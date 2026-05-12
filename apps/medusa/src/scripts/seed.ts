import type { ExecArgs } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import Drop01 = require("./drop-01");

const { ContainerRegistrationKeys, Modules, ProductStatus } =
  require("@medusajs/framework/utils") as typeof MedusaUtils;

type Logger = {
  info(message: string): void;
  warn(message: string): void;
};

type LinkService = {
  create(data: Record<string, Record<string, string>>): Promise<unknown>;
};

type Workflow<TResult> = {
  run(args: { input: unknown }): Promise<{ result: TResult }>;
};

type CoreFlows = {
  createApiKeysWorkflow(container: ExecArgs["container"]): Workflow<ApiKey[]>;
  createInventoryLevelsWorkflow(container: ExecArgs["container"]): Workflow<unknown>;
  createProductCategoriesWorkflow(container: ExecArgs["container"]): Workflow<ProductCategory[]>;
  createProductsWorkflow(container: ExecArgs["container"]): Workflow<Product[]>;
  createRegionsWorkflow(container: ExecArgs["container"]): Workflow<Region[]>;
  createSalesChannelsWorkflow(container: ExecArgs["container"]): Workflow<SalesChannel[]>;
  createShippingOptionsWorkflow(container: ExecArgs["container"]): Workflow<unknown>;
  createShippingProfilesWorkflow(container: ExecArgs["container"]): Workflow<ShippingProfile[]>;
  createStockLocationsWorkflow(container: ExecArgs["container"]): Workflow<StockLocation[]>;
  createTaxRegionsWorkflow(container: ExecArgs["container"]): Workflow<unknown>;
  linkSalesChannelsToApiKeyWorkflow(container: ExecArgs["container"]): Workflow<unknown>;
  linkSalesChannelsToStockLocationWorkflow(container: ExecArgs["container"]): Workflow<unknown>;
};

const {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} = require("@medusajs/medusa/core-flows") as CoreFlows;

type ApiKey = {
  id: string;
  redacted?: string | null;
  title: string;
  token?: string | null;
  type: "publishable" | "secret";
};

type ApiKeyModuleService = {
  listApiKeys(filters?: Record<string, unknown>, config?: { take?: number }): Promise<ApiKey[]>;
};

type Store = {
  default_location_id?: string | null;
  default_sales_channel_id?: string | null;
  id: string;
};

type StoreModuleService = {
  listStores(filters?: Record<string, unknown>, config?: { take?: number }): Promise<Store[]>;
  updateStores(
    id: string,
    data: {
      default_location_id?: string | null;
      default_sales_channel_id?: string | null;
      supported_currencies?: Array<{ currency_code: string; is_default?: boolean }>;
    },
  ): Promise<Store>;
};

type SalesChannel = {
  id: string;
  name: string;
};

type SalesChannelModuleService = {
  listSalesChannels(
    filters?: Record<string, unknown>,
    config?: { take?: number },
  ): Promise<SalesChannel[]>;
};

type Region = {
  id: string;
  name: string;
};

type RegionModuleService = {
  listRegions(filters?: Record<string, unknown>, config?: { take?: number }): Promise<Region[]>;
};

type TaxModuleService = {
  listTaxRegions(filters?: Record<string, unknown>, config?: { take?: number }): Promise<unknown[]>;
};

type StockLocation = {
  id: string;
  name: string;
};

type StockLocationModuleService = {
  listStockLocations(
    filters?: Record<string, unknown>,
    config?: { take?: number },
  ): Promise<StockLocation[]>;
};

type ServiceZone = {
  id: string;
  name: string;
};

type FulfillmentSet = {
  id: string;
  name: string;
  service_zones?: ServiceZone[];
};

type ShippingProfile = {
  id: string;
  type: string;
};

type ShippingOption = {
  id: string;
  name: string;
};

type FulfillmentModuleService = {
  createFulfillmentSets(data: {
    name: string;
    service_zones: Array<{
      geo_zones: Array<{ country_code: string; type: "country" }>;
      name: string;
    }>;
    type: "shipping";
  }): Promise<FulfillmentSet>;
  listFulfillmentSets(
    filters?: Record<string, unknown>,
    config?: { relations?: string[]; take?: number },
  ): Promise<FulfillmentSet[]>;
  listShippingOptions(
    filters?: Record<string, unknown>,
    config?: { take?: number },
  ): Promise<ShippingOption[]>;
  listShippingProfiles(
    filters?: Record<string, unknown>,
    config?: { take?: number },
  ): Promise<ShippingProfile[]>;
};

type ProductCategory = {
  handle?: string | null;
  id: string;
  name: string;
};

type Product = {
  handle?: string | null;
  id: string;
};

type ProductModuleService = {
  listProductCategories(
    filters?: Record<string, unknown>,
    config?: { take?: number },
  ): Promise<ProductCategory[]>;
  listProducts(filters?: Record<string, unknown>, config?: { take?: number }): Promise<Product[]>;
};

type InventoryItem = {
  id: string;
  location_levels?: Array<{ location_id?: string | null }>;
  sku?: string | null;
};

type QueryService = {
  graph<TData>(input: {
    entity: string;
    fields: string[];
    filters?: Record<string, unknown>;
  }): Promise<{ data: TData[] }>;
};

type InventoryLevelInput = {
  inventory_item_id: string;
  location_id: string;
  stocked_quantity: number;
};

type SeedContext = {
  apiKeyModule: ApiKeyModuleService;
  container: ExecArgs["container"];
  fulfillmentModule: FulfillmentModuleService;
  link: LinkService;
  logger: Logger;
  productModule: ProductModuleService;
  query: QueryService;
  regionModule: RegionModuleService;
  salesChannelModule: SalesChannelModuleService;
  stockLocationModule: StockLocationModuleService;
  storeModule: StoreModuleService;
  taxModule: TaxModuleService;
};

const SALES_CHANNEL_NAME = "Storefront";
const REGION_NAME = "United States";
const STOCK_LOCATION_NAME = "vaivae Warehouse";
const FULFILLMENT_SET_NAME = "US Domestic delivery";
const SHIPPING_PROFILE_NAME = "Default Shipping Profile";
const PRODUCT_CATEGORY_HANDLE = "drop-01";
const PRODUCT_CATEGORY_NAME = "Drop 01";
const PAYMENT_PROVIDER_ID = "pp_stripe_stripe";
const TAX_PROVIDER_ID = "tp_system";
const FULFILLMENT_PROVIDER_ID = "manual_manual";
const STOREFRONT_API_KEY_TITLE = "Vercel Storefront";

function first<TItem>(items: readonly TItem[], label: string): TItem {
  const item = items[0];

  if (!item) {
    throw new Error(`Missing ${label}.`);
  }

  return item;
}

function isDuplicateLinkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return message.includes("duplicate") || message.includes("already") || message.includes("exists");
}

async function createLinkIfMissing(
  ctx: SeedContext,
  label: string,
  data: Record<string, Record<string, string>>,
): Promise<void> {
  try {
    await ctx.link.create(data);
  } catch (error: unknown) {
    if (isDuplicateLinkError(error)) {
      ctx.logger.info(`${label} link already exists; skipping.`);
      return;
    }

    throw error;
  }
}

async function ensureStore(ctx: SeedContext): Promise<Store> {
  return first(await ctx.storeModule.listStores({}, { take: 1 }), "Medusa store");
}

async function ensureSalesChannel(ctx: SeedContext): Promise<SalesChannel> {
  const existing = await ctx.salesChannelModule.listSalesChannels(
    { name: SALES_CHANNEL_NAME },
    { take: 1 },
  );
  const salesChannel = existing[0];

  if (salesChannel) {
    ctx.logger.info(`Sales channel ${SALES_CHANNEL_NAME} already exists.`);
    return salesChannel;
  }

  const { result } = await createSalesChannelsWorkflow(ctx.container).run({
    input: {
      salesChannelsData: [{ name: SALES_CHANNEL_NAME }],
    },
  });

  return first(result, "created sales channel");
}

async function configureStore(
  ctx: SeedContext,
  store: Store,
  salesChannel: SalesChannel,
  stockLocation?: StockLocation,
): Promise<void> {
  const update: Parameters<StoreModuleService["updateStores"]>[1] = {
    supported_currencies: [{ currency_code: "usd", is_default: true }],
  };

  if (store.default_sales_channel_id !== salesChannel.id) {
    update.default_sales_channel_id = salesChannel.id;
  }

  if (stockLocation && store.default_location_id !== stockLocation.id) {
    update.default_location_id = stockLocation.id;
  }

  await ctx.storeModule.updateStores(store.id, update);
}

async function ensureRegion(ctx: SeedContext): Promise<Region> {
  const existing = await ctx.regionModule.listRegions({ name: REGION_NAME }, { take: 1 });
  const region = existing[0];

  if (region) {
    ctx.logger.info(`${REGION_NAME} region already exists.`);
    return region;
  }

  const { result } = await createRegionsWorkflow(ctx.container).run({
    input: {
      regions: [
        {
          automatic_taxes: true,
          countries: ["us"],
          currency_code: "usd",
          metadata: { seed_key: "drop-01-us-region" },
          name: REGION_NAME,
          payment_providers: [PAYMENT_PROVIDER_ID],
        },
      ],
    },
  });

  return first(result, "created region");
}

async function ensureTaxRegion(ctx: SeedContext): Promise<void> {
  const existing = await ctx.taxModule.listTaxRegions({ country_code: "us" }, { take: 1 });

  if (existing.length > 0) {
    ctx.logger.info("US tax region already exists.");
    return;
  }

  await createTaxRegionsWorkflow(ctx.container).run({
    input: [{ country_code: "us", provider_id: TAX_PROVIDER_ID }],
  });
}

async function ensureStockLocation(ctx: SeedContext): Promise<StockLocation> {
  const existing = await ctx.stockLocationModule.listStockLocations(
    { name: STOCK_LOCATION_NAME },
    { take: 1 },
  );
  const stockLocation = existing[0];

  if (stockLocation) {
    ctx.logger.info(`${STOCK_LOCATION_NAME} stock location already exists.`);
    return stockLocation;
  }

  const { result } = await createStockLocationsWorkflow(ctx.container).run({
    input: {
      locations: [
        {
          address: {
            address_1: "Launch warehouse address pending",
            city: "New York",
            country_code: "US",
            postal_code: "10001",
            province: "NY",
          },
          metadata: { seed_key: "drop-01-primary-warehouse" },
          name: STOCK_LOCATION_NAME,
        },
      ],
    },
  });

  return first(result, "created stock location");
}

async function ensureShippingProfile(ctx: SeedContext): Promise<ShippingProfile> {
  const existing = await ctx.fulfillmentModule.listShippingProfiles(
    { type: "default" },
    { take: 1 },
  );
  const shippingProfile = existing[0];

  if (shippingProfile) {
    ctx.logger.info("Default shipping profile already exists.");
    return shippingProfile;
  }

  const { result } = await createShippingProfilesWorkflow(ctx.container).run({
    input: {
      data: [{ name: SHIPPING_PROFILE_NAME, type: "default" }],
    },
  });

  return first(result, "created shipping profile");
}

function getServiceZone(fulfillmentSet: FulfillmentSet): ServiceZone {
  return first(fulfillmentSet.service_zones ?? [], `${fulfillmentSet.name} service zone`);
}

async function ensureFulfillmentSet(
  ctx: SeedContext,
  stockLocation: StockLocation,
): Promise<FulfillmentSet> {
  const existing = await ctx.fulfillmentModule.listFulfillmentSets(
    { name: FULFILLMENT_SET_NAME },
    { relations: ["service_zones"], take: 1 },
  );
  const fulfillmentSet = existing[0];

  if (fulfillmentSet) {
    await createLinkIfMissing(ctx, "Stock location fulfillment set", {
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    });

    return fulfillmentSet;
  }

  const created = await ctx.fulfillmentModule.createFulfillmentSets({
    name: FULFILLMENT_SET_NAME,
    service_zones: [
      {
        geo_zones: [{ country_code: "us", type: "country" }],
        name: "US Domestic",
      },
    ],
    type: "shipping",
  });

  await createLinkIfMissing(ctx, "Stock location fulfillment set", {
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: created.id },
  });

  return created;
}

async function ensureShippingOptions(
  ctx: SeedContext,
  region: Region,
  shippingProfile: ShippingProfile,
  fulfillmentSet: FulfillmentSet,
): Promise<void> {
  const serviceZone = getServiceZone(fulfillmentSet);
  const options = [
    {
      name: "Standard Shipping",
      price_type: "flat",
      prices: [
        { amount: 2500, currency_code: "usd" },
        { amount: 2500, region_id: region.id },
      ],
      provider_id: FULFILLMENT_PROVIDER_ID,
      rules: [
        { attribute: "enabled_in_store", operator: "eq", value: "true" },
        { attribute: "is_return", operator: "eq", value: "false" },
      ],
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      type: {
        code: "standard",
        description: "5-7 business days.",
        label: "Standard",
      },
    },
    {
      name: "Express Shipping",
      price_type: "flat",
      prices: [
        { amount: 4500, currency_code: "usd" },
        { amount: 4500, region_id: region.id },
      ],
      provider_id: FULFILLMENT_PROVIDER_ID,
      rules: [
        { attribute: "enabled_in_store", operator: "eq", value: "true" },
        { attribute: "is_return", operator: "eq", value: "false" },
      ],
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      type: {
        code: "express",
        description: "2-3 business days.",
        label: "Express",
      },
    },
    {
      name: "Complimentary Shipping",
      price_type: "flat",
      prices: [
        { amount: 0, currency_code: "usd" },
        { amount: 0, region_id: region.id },
      ],
      provider_id: FULFILLMENT_PROVIDER_ID,
      rules: [
        { attribute: "enabled_in_store", operator: "eq", value: "true" },
        { attribute: "is_return", operator: "eq", value: "false" },
        { attribute: "subtotal", operator: "gte", value: "50000" },
      ],
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      type: {
        code: "free-over-500",
        description: "Complimentary domestic delivery over $500.",
        label: "Complimentary",
      },
    },
  ];

  const missing = [];

  for (const option of options) {
    const existing = await ctx.fulfillmentModule.listShippingOptions(
      { name: option.name },
      { take: 1 },
    );

    if (existing.length === 0) {
      missing.push(option);
    }
  }

  if (missing.length === 0) {
    ctx.logger.info("Shipping options already exist.");
    return;
  }

  await createShippingOptionsWorkflow(ctx.container).run({ input: missing });
}

async function ensureProductCategory(ctx: SeedContext): Promise<ProductCategory> {
  const existing = await ctx.productModule.listProductCategories(
    { handle: PRODUCT_CATEGORY_HANDLE },
    { take: 1 },
  );
  const category = existing[0];

  if (category) {
    ctx.logger.info(`${PRODUCT_CATEGORY_NAME} category already exists.`);
    return category;
  }

  const { result } = await createProductCategoriesWorkflow(ctx.container).run({
    input: {
      product_categories: [
        {
          description: "The launch capsule for vaïvae Drop 01 - The Living Runway.",
          handle: PRODUCT_CATEGORY_HANDLE,
          is_active: true,
          is_internal: false,
          metadata: { seed_key: "drop-01-category" },
          name: PRODUCT_CATEGORY_NAME,
        },
      ],
    },
  });

  return first(result, "created Drop 01 category");
}

function getMaterialLabels(product: (typeof Drop01.DROP_01_PRODUCTS)[number]): string[] {
  return product.materialKeys.map((materialKey) => {
    const material = Drop01.DROP_01_MATERIALS.find((item) => item.key === materialKey);

    return material?.name ?? materialKey;
  });
}

function toMedusaProduct(
  product: (typeof Drop01.DROP_01_PRODUCTS)[number],
  salesChannel: SalesChannel,
  shippingProfile: ShippingProfile,
  category: ProductCategory,
): Record<string, unknown> {
  return {
    category_ids: [category.id],
    description: product.description,
    discountable: true,
    handle: product.handle,
    id: product.medusaProductId,
    material: product.material,
    metadata: {
      drop: "drop-01",
      made_in: product.madeIn,
      mirror_materials: getMaterialLabels(product),
      seed_key: product.medusaProductId,
    },
    options: product.options.map((option) => ({
      title: option.title,
      values: [...option.values],
    })),
    origin_country: "it",
    sales_channels: [{ id: salesChannel.id }],
    shipping_profile_id: shippingProfile.id,
    status: ProductStatus.PUBLISHED,
    title: product.title,
    variants: product.variants.map((variant) => ({
      allow_backorder: false,
      manage_inventory: true,
      material: product.material,
      metadata: {
        drop: "drop-01",
        seed_key: variant.sku,
      },
      options: variant.optionValues,
      prices: [{ amount: product.priceUsd, currency_code: "usd" }],
      sku: variant.sku,
      title: variant.title,
      weight: product.weightGrams,
    })),
    weight: product.weightGrams,
  };
}

async function ensureProducts(
  ctx: SeedContext,
  salesChannel: SalesChannel,
  shippingProfile: ShippingProfile,
  category: ProductCategory,
): Promise<void> {
  const handles = Drop01.DROP_01_PRODUCTS.map((product) => product.handle);
  const existingProducts = await ctx.productModule.listProducts(
    { handle: handles },
    { take: Drop01.DROP_01_PRODUCTS.length },
  );
  const existingByHandle = new Map(
    existingProducts.flatMap((product) =>
      product.handle ? [[product.handle, product] as const] : [],
    ),
  );
  const missing = [];

  for (const product of Drop01.DROP_01_PRODUCTS) {
    const existing = existingByHandle.get(product.handle);

    if (!existing) {
      missing.push(toMedusaProduct(product, salesChannel, shippingProfile, category));
      continue;
    }

    if (existing.id !== product.medusaProductId) {
      throw new Error(
        `Existing product ${product.handle} has id ${existing.id}, expected ${product.medusaProductId}. ` +
          "Sanity product seeds require deterministic Medusa product IDs.",
      );
    }
  }

  if (missing.length === 0) {
    ctx.logger.info("Drop 01 products already exist.");
    return;
  }

  await createProductsWorkflow(ctx.container).run({
    input: { products: missing },
  });
}

async function linkSalesChannelToStockLocation(
  ctx: SeedContext,
  salesChannel: SalesChannel,
  stockLocation: StockLocation,
): Promise<void> {
  try {
    await linkSalesChannelsToStockLocationWorkflow(ctx.container).run({
      input: { add: [salesChannel.id], id: stockLocation.id },
    });
  } catch (error: unknown) {
    if (isDuplicateLinkError(error)) {
      ctx.logger.info("Sales channel stock location link already exists; skipping.");
      return;
    }

    throw error;
  }
}

async function ensurePublishableApiKey(
  ctx: SeedContext,
  salesChannel: SalesChannel,
): Promise<void> {
  const existing = await ctx.apiKeyModule.listApiKeys(
    { title: STOREFRONT_API_KEY_TITLE, type: "publishable" },
    { take: 1 },
  );
  let apiKey = existing[0];

  if (apiKey) {
    ctx.logger.info(`${STOREFRONT_API_KEY_TITLE} publishable key already exists.`);
  } else {
    const { result } = await createApiKeysWorkflow(ctx.container).run({
      input: {
        api_keys: [
          {
            created_by: "drop-01-seed",
            title: STOREFRONT_API_KEY_TITLE,
            type: "publishable",
          },
        ],
      },
    });

    apiKey = first(result, "created storefront publishable API key");
  }

  try {
    await linkSalesChannelsToApiKeyWorkflow(ctx.container).run({
      input: { add: [salesChannel.id], id: apiKey.id, remove: [] },
    });
  } catch (error: unknown) {
    if (isDuplicateLinkError(error)) {
      ctx.logger.info("Storefront publishable key sales channel link already exists; skipping.");
    } else {
      throw error;
    }
  }

  const token = apiKey.token?.trim();

  if (token) {
    ctx.logger.info(`Storefront publishable API key token: ${token}`);
  } else if (apiKey.redacted) {
    ctx.logger.warn(
      `Storefront publishable API key exists as ${apiKey.redacted}, but Medusa did not return its full token. Copy it from Medusa Admin if needed.`,
    );
  }
}

function hasInventoryLevelAtLocation(item: InventoryItem, stockLocation: StockLocation): boolean {
  return (item.location_levels ?? []).some((level) => level.location_id === stockLocation.id);
}

async function ensureInventoryLevels(
  ctx: SeedContext,
  stockLocation: StockLocation,
): Promise<void> {
  const seededVariants: Array<{ inventory: number; sku: string }> = [];
  const inventoryBySku = new Map<string, InventoryItem>();
  const { data: inventoryItems } = await ctx.query.graph<InventoryItem>({
    entity: "inventory_item",
    fields: ["id", "sku", "location_levels.location_id"],
  });

  for (const product of Drop01.DROP_01_PRODUCTS) {
    for (const variant of product.variants) {
      seededVariants.push({ inventory: variant.inventory, sku: variant.sku });
    }
  }

  for (const item of inventoryItems) {
    if (item.sku) {
      inventoryBySku.set(item.sku, item);
    }
  }

  const inventoryLevels: InventoryLevelInput[] = [];

  for (const variant of seededVariants) {
    const item = inventoryBySku.get(variant.sku);

    if (!item) {
      ctx.logger.warn(`Inventory item for ${variant.sku} was not found; skipping inventory level.`);
      continue;
    }

    if (hasInventoryLevelAtLocation(item, stockLocation)) {
      continue;
    }

    inventoryLevels.push({
      inventory_item_id: item.id,
      location_id: stockLocation.id,
      stocked_quantity: variant.inventory,
    });
  }

  if (inventoryLevels.length === 0) {
    ctx.logger.info("Drop 01 inventory levels already exist.");
    return;
  }

  await createInventoryLevelsWorkflow(ctx.container).run({
    input: { inventory_levels: inventoryLevels },
  });
}

async function seed({ container }: ExecArgs): Promise<void> {
  const ctx: SeedContext = {
    apiKeyModule: container.resolve<ApiKeyModuleService>(Modules.API_KEY),
    container,
    fulfillmentModule: container.resolve<FulfillmentModuleService>(Modules.FULFILLMENT),
    link: container.resolve<LinkService>(ContainerRegistrationKeys.LINK),
    logger: container.resolve<Logger>(ContainerRegistrationKeys.LOGGER),
    productModule: container.resolve<ProductModuleService>(Modules.PRODUCT),
    query: container.resolve<QueryService>(ContainerRegistrationKeys.QUERY),
    regionModule: container.resolve<RegionModuleService>(Modules.REGION),
    salesChannelModule: container.resolve<SalesChannelModuleService>(Modules.SALES_CHANNEL),
    stockLocationModule: container.resolve<StockLocationModuleService>(Modules.STOCK_LOCATION),
    storeModule: container.resolve<StoreModuleService>(Modules.STORE),
    taxModule: container.resolve<TaxModuleService>(Modules.TAX),
  };

  ctx.logger.info("Seeding Drop 01 - May 2026...");

  const store = await ensureStore(ctx);
  const salesChannel = await ensureSalesChannel(ctx);
  await configureStore(ctx, store, salesChannel);

  const region = await ensureRegion(ctx);
  await ensureTaxRegion(ctx);

  const stockLocation = await ensureStockLocation(ctx);
  await configureStore(ctx, store, salesChannel, stockLocation);
  await createLinkIfMissing(ctx, "Stock location fulfillment provider", {
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: FULFILLMENT_PROVIDER_ID },
  });

  const shippingProfile = await ensureShippingProfile(ctx);
  const fulfillmentSet = await ensureFulfillmentSet(ctx, stockLocation);
  await ensureShippingOptions(ctx, region, shippingProfile, fulfillmentSet);
  await linkSalesChannelToStockLocation(ctx, salesChannel, stockLocation);

  const category = await ensureProductCategory(ctx);
  await ensureProducts(ctx, salesChannel, shippingProfile, category);
  await ensureInventoryLevels(ctx, stockLocation);
  await ensurePublishableApiKey(ctx, salesChannel);

  ctx.logger.info("Drop 01 seed complete.");
}

exports.default = seed;
