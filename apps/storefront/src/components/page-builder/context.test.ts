import { describe, expect, it, vi } from "vitest";

import type { PageBuilderModule, PageBuilderModuleOf } from "./types";

const { productListMock } = vi.hoisted(() => ({
  productListMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/medusa/client", () => ({
  getMedusaClient: () => ({
    store: {
      product: {
        list: productListMock,
      },
    },
  }),
}));

vi.mock("@/medusa/regions", () => ({
  getDefaultRegion: async () => ({ id: "reg_test" }),
}));

import { resolvePageBuilderContext } from "./context";

type ProductRailProduct = NonNullable<PageBuilderModuleOf<"productRail">["products"]>[number];

function productReference(input: {
  handle: string;
  medusaProductId: string;
  title: string;
}): ProductRailProduct {
  return {
    _id: input.medusaProductId,
    _type: "product",
    editorialReady: true,
    handle: input.handle,
    heroImage: null,
    medusaProductId: input.medusaProductId,
    oneLineHook: null,
    title: input.title,
  };
}

function productRail(products: ProductRailProduct[]): PageBuilderModule {
  return {
    _key: "stale-handle-rail",
    _type: "productRail",
    columns: 3,
    cta: null,
    density: "compact",
    eyebrow: null,
    heading: "Shop",
    intro: null,
    layout: "carousel",
    products,
  } satisfies PageBuilderModuleOf<"productRail">;
}

describe("resolvePageBuilderContext", () => {
  it("enriches page-builder products by Medusa id when the Sanity handle is stale", async () => {
    productListMock.mockResolvedValueOnce({
      products: [
        {
          handle: "new-name",
          id: "prod_stale_handle",
          title: "New name",
          variants: [],
        },
      ],
    });

    const context = await resolvePageBuilderContext([
      productRail([
        productReference({
          handle: "old-name",
          medusaProductId: "prod_stale_handle",
          title: "Old name",
        }),
      ]),
    ]);

    expect(productListMock).toHaveBeenCalledWith({
      fields:
        "id,title,handle,thumbnail,status,*variants,+variants.inventory_quantity,*variants.calculated_price",
      id: ["prod_stale_handle"],
      limit: 1,
      region_id: "reg_test",
    });
    expect(context.medusaProducts?.get("prod_stale_handle")?.handle).toBe("new-name");
    expect(context.medusaProducts?.get("old-name")).toBeUndefined();
  });
});
