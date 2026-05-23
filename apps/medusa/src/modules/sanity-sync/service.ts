import type { SanityClient } from "@sanity/client";
import type { Logger } from "pino";
import type { MedusaEnv } from "../../lib/env";

type SanityClientFactory = {
  createSanityClient(env: { projectId: string; dataset: string; writeToken: string }): SanityClient;
};

type LoggerModule = {
  child(scope: string): Logger;
};

type ProductHandle = {
  _type: "slug";
  current: string;
};

type SanityProductMirrorDocument = {
  _id: string;
  _type: "product";
  editorialReady: false;
  handle: ProductHandle;
  medusaProductId: string;
  mirrorMaterials: string[];
  title: string;
};

type SanityProductMirrorReadDocument = {
  _id?: unknown;
  handle?: unknown;
  medusaProductId?: unknown;
  mirrorMaterials?: unknown;
  title?: unknown;
};

type SanityProductMirror = {
  _id: string;
  handle: string | null;
  medusaProductId: string | null;
  mirrorMaterials: string[];
  title: string | null;
};

type SanitySyncProductInput = {
  id: string;
  title: string;
  handle: string;
  materials?: string[] | null;
};

const { env } = require("../../lib/env") as {
  env: Pick<MedusaEnv, "SANITY_DATASET" | "SANITY_PROJECT_ID" | "SANITY_WRITE_TOKEN">;
};
const { child } = require("../../lib/logger") as LoggerModule;
const { createSanityClient } = require("./client") as SanityClientFactory;

const logger = child("sanity-sync");

function requireTrimmed(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required for Sanity product sync.`);
  }

  return normalized;
}

function normalizeMaterials(materials: string[] | null | undefined): string[] {
  return (materials ?? [])
    .map((material) => material.trim())
    .filter((material) => material.length > 0);
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toSanityProductMirrorDocument(
  product: SanitySyncProductInput,
): SanityProductMirrorDocument {
  const productId = requireTrimmed(product.id, "product.id");
  const title = requireTrimmed(product.title, "product.title");
  const handle = requireTrimmed(product.handle, "product.handle");

  return {
    _id: productId,
    _type: "product",
    editorialReady: false,
    handle: {
      _type: "slug",
      current: handle,
    },
    medusaProductId: productId,
    mirrorMaterials: normalizeMaterials(product.materials),
    title,
  };
}

class SanitySyncService {
  private readonly client: SanityClient;

  constructor() {
    this.client = createSanityClient({
      dataset: env.SANITY_DATASET,
      projectId: env.SANITY_PROJECT_ID,
      writeToken: env.SANITY_WRITE_TOKEN,
    });
  }

  /** Create or refresh Medusa-owned mirror fields while preserving editorial fields. */
  async syncProduct(product: SanitySyncProductInput): Promise<void> {
    const document = toSanityProductMirrorDocument(product);

    await this.client.createIfNotExists(document);
    await this.client
      .patch(document._id)
      .setIfMissing({
        editorialReady: false,
      })
      .set({
        handle: document.handle,
        medusaProductId: document.medusaProductId,
        mirrorMaterials: document.mirrorMaterials,
        title: document.title,
      })
      .commit({ autoGenerateArrayKeys: true });

    logger.info({ productId: document.medusaProductId }, "synced product to Sanity");
  }

  async deleteProduct(productId: string): Promise<void> {
    const sanityId = requireTrimmed(productId, "product.id");

    await this.client.delete(sanityId);
    logger.info({ productId: sanityId }, "deleted product from Sanity");
  }

  async getProductMirror(productId: string): Promise<SanityProductMirror | null> {
    const sanityId = requireTrimmed(productId, "product.id");
    const mirror = await this.client.fetch<SanityProductMirrorReadDocument | null>(
      `*[_id == $productId && _type == "product"][0]{
        _id,
        "handle": handle.current,
        medusaProductId,
        mirrorMaterials,
        title
      }`,
      { productId: sanityId },
    );

    if (!mirror) {
      return null;
    }

    return {
      _id: readString(mirror._id) ?? sanityId,
      handle: readString(mirror.handle),
      medusaProductId: readString(mirror.medusaProductId),
      mirrorMaterials: readStringArray(mirror.mirrorMaterials),
      title: readString(mirror.title),
    };
  }
}

export = SanitySyncService;
