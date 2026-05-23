/// <reference types="vitest/globals" />

type SanitySyncProductInput = {
  handle: string;
  id: string;
  materials?: string[] | null;
  title: string;
};

type SanityProductMirror = {
  _id: string;
  handle: string | null;
  medusaProductId: string | null;
  mirrorMaterials: string[];
  title: string | null;
};

type PatchBuilder = {
  commit: (options: { autoGenerateArrayKeys: boolean }) => Promise<void>;
  set: (value: Record<string, unknown>) => PatchBuilder;
  setIfMissing: (value: Record<string, unknown>) => PatchBuilder;
};

type SanitySyncServiceShape = {
  deleteProduct: (productId: string) => Promise<void>;
  getProductMirror: (productId: string) => Promise<SanityProductMirror | null>;
  syncProduct: (product: SanitySyncProductInput) => Promise<void>;
};

type SanitySyncServiceConstructor = new () => SanitySyncServiceShape;
type ModuleLoader = (request: string, parent: unknown, isMain: boolean) => unknown;
type ModuleWithLoader = {
  _load: ModuleLoader;
};

function getDefaultExport<T>(module: unknown): T {
  const loaded = module as { default?: T };

  return loaded.default ?? (module as T);
}

async function loadService() {
  vi.resetModules();

  const patchBuilder: PatchBuilder = {
    commit: vi.fn(async () => undefined),
    set: vi.fn(() => patchBuilder),
    setIfMissing: vi.fn(() => patchBuilder),
  } satisfies PatchBuilder;

  const createIfNotExists = vi.fn(async () => undefined);
  const deleteDocument = vi.fn(async () => undefined);
  const patch = vi.fn(() => patchBuilder);
  const fetch = vi.fn(async (): Promise<unknown> => null);
  const info = vi.fn();
  const child = vi.fn(() => ({ info }));
  const createSanityClient = vi.fn(() => ({
    createIfNotExists,
    delete: deleteDocument,
    fetch,
    patch,
  }));
  const moduleLoader = require("node:module") as ModuleWithLoader;
  const originalLoad = moduleLoader._load;

  vi.spyOn(moduleLoader, "_load").mockImplementation((request, parent, isMain) => {
    if (request === "../../lib/env") {
      return {
        env: {
          SANITY_DATASET: "development",
          SANITY_PROJECT_ID: "test-project",
          SANITY_WRITE_TOKEN: "test-token",
        },
      };
    }

    if (request === "../../lib/logger") {
      return { child };
    }

    if (request === "./client") {
      return { createSanityClient };
    }

    return originalLoad(request, parent, isMain);
  });

  const module = await import("./service.js");
  const Service = getDefaultExport<SanitySyncServiceConstructor>(module);

  return {
    child,
    commit: patchBuilder.commit,
    createIfNotExists,
    createSanityClient,
    deleteDocument,
    fetch,
    info,
    patch,
    service: new Service(),
    set: patchBuilder.set,
    setIfMissing: patchBuilder.setIfMissing,
  };
}

describe("SanitySyncService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("syncs a Medusa product into the Sanity mirror document", async () => {
    // Arrange
    const mocks = await loadService();

    // Act
    await mocks.service.syncProduct({
      handle: " terracotta-slip ",
      id: " prod_terracotta ",
      materials: [" silk ", "", "linen"],
      title: " Terracotta Slip ",
    });

    // Assert
    expect(mocks.createSanityClient).toHaveBeenCalledWith({
      dataset: "development",
      projectId: "test-project",
      writeToken: "test-token",
    });
    expect(mocks.createIfNotExists).toHaveBeenCalledWith({
      _id: "prod_terracotta",
      _type: "product",
      editorialReady: false,
      handle: { _type: "slug", current: "terracotta-slip" },
      medusaProductId: "prod_terracotta",
      mirrorMaterials: ["silk", "linen"],
      title: "Terracotta Slip",
    });
    expect(mocks.patch).toHaveBeenCalledWith("prod_terracotta");
    expect(mocks.setIfMissing).toHaveBeenCalledWith({ editorialReady: false });
    expect(mocks.set).toHaveBeenCalledWith({
      handle: { _type: "slug", current: "terracotta-slip" },
      medusaProductId: "prod_terracotta",
      mirrorMaterials: ["silk", "linen"],
      title: "Terracotta Slip",
    });
    expect(mocks.commit).toHaveBeenCalledWith({ autoGenerateArrayKeys: true });
    expect(mocks.info).toHaveBeenCalledWith(
      { productId: "prod_terracotta" },
      "synced product to Sanity",
    );
  });

  it("deletes a mirrored product by trimmed Medusa id", async () => {
    // Arrange
    const mocks = await loadService();

    // Act
    await mocks.service.deleteProduct(" prod_terracotta ");

    // Assert
    expect(mocks.deleteDocument).toHaveBeenCalledWith("prod_terracotta");
    expect(mocks.info).toHaveBeenCalledWith(
      { productId: "prod_terracotta" },
      "deleted product from Sanity",
    );
  });

  it("reads the current Sanity mirror document by trimmed Medusa id", async () => {
    // Arrange
    const mocks = await loadService();

    mocks.fetch.mockResolvedValueOnce({
      _id: "prod_terracotta",
      handle: "terracotta-slip",
      medusaProductId: "prod_terracotta",
      mirrorMaterials: ["silk", "linen"],
      title: "Terracotta Slip",
    });

    // Act
    const mirror = await mocks.service.getProductMirror(" prod_terracotta ");

    // Assert
    expect(mocks.fetch).toHaveBeenCalledWith(expect.stringContaining("_id == $productId"), {
      productId: "prod_terracotta",
    });
    expect(mirror).toEqual({
      _id: "prod_terracotta",
      handle: "terracotta-slip",
      medusaProductId: "prod_terracotta",
      mirrorMaterials: ["silk", "linen"],
      title: "Terracotta Slip",
    });
  });

  it("returns null when the Sanity mirror document does not exist", async () => {
    // Arrange
    const mocks = await loadService();

    mocks.fetch.mockResolvedValueOnce(null);

    // Act / Assert
    await expect(mocks.service.getProductMirror("prod_missing")).resolves.toBeNull();
  });

  it("rejects products without required mirror fields", async () => {
    // Arrange
    const mocks = await loadService();

    // Act / Assert
    await expect(
      mocks.service.syncProduct({ handle: "terracotta-slip", id: "prod_terracotta", title: " " }),
    ).rejects.toThrow(/product.title is required/);
  });
});
