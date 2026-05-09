import type { HttpTypes } from "@medusajs/types";

import type { ProductEditorialFragment } from "@/lib/sanity/products";

export type StoreCart = HttpTypes.StoreCart;
export type StoreCartAddress = HttpTypes.StoreCartAddress;
export type StoreCartLineItem = HttpTypes.StoreCartLineItem;
export type StoreCartShippingOption = HttpTypes.StoreCartShippingOptionWithServiceZone;
export type StoreCollection = HttpTypes.StoreCollection;
export type StoreCustomer = HttpTypes.StoreCustomer;
export type StoreCustomerAddress = HttpTypes.StoreCustomerAddress;
export type StoreOrder = HttpTypes.StoreOrder;
export type StoreProduct = HttpTypes.StoreProduct;
export type StoreProductCategory = HttpTypes.StoreProductCategory;
export type StoreProductCollection = HttpTypes.StoreCollection;
export type StoreProductOption = HttpTypes.StoreProductOption;
export type StoreProductOptionValue = HttpTypes.StoreProductOptionValue;
export type StoreProductVariant = HttpTypes.StoreProductVariant;
export type StoreRegion = HttpTypes.StoreRegion;
export type StoreRegionCountry = HttpTypes.StoreRegionCountry;

export type MergedProduct = {
  editorial?: ProductEditorialFragment;
  medusa: StoreProduct;
};
