import type { Metadata } from "next";
import Link from "next/link";

import { WishlistItemActions } from "@/components/account/wishlist-item-actions";
import { ProductCard, productCardMedusaFromStoreProduct } from "@/components/cards/product-card";
import { Button, Stack } from "@/components/ui";
import { listEditorialProducts } from "@/lib/sanity/products";
import { listProductsByIds } from "@/medusa/products";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreProduct, StoreProductVariant } from "@/medusa/types";
import { getWishlist, type WishlistItem } from "@/medusa/wishlist";

export const metadata: Metadata = {
  title: "Wishlist",
};

function getVariant(product: StoreProduct, variantId: string): StoreProductVariant | null {
  return product.variants?.find((variant) => variant.id === variantId) ?? null;
}

function isVariantPurchasable(variant: StoreProductVariant | null): boolean {
  if (!variant) {
    return false;
  }

  return (
    variant.manage_inventory === false ||
    variant.allow_backorder === true ||
    (variant.inventory_quantity ?? 0) > 0
  );
}

function getVariantLabel(variant: StoreProductVariant | null): string | null {
  return variant?.title?.trim() || null;
}

function getProductId(item: WishlistItem): string | null {
  return item.product_id?.trim() || null;
}

export default async function WishlistPage() {
  const wishlistItems = await getWishlist();
  const productIds = wishlistItems.flatMap((item) => {
    const productId = getProductId(item);

    return productId ? [productId] : [];
  });
  const region = await getDefaultRegion();
  const products = await listProductsByIds(productIds, region.id);
  const editorial = await listEditorialProducts(products.map((product) => product.id));
  const productsById = new Map(products.map((product) => [product.id, product]));

  if (wishlistItems.length === 0) {
    return (
      <div className="grid min-h-96 place-items-center border border-on-light/10 bg-on-light/[0.025] p-8 text-center">
        <Stack align="center" className="max-w-xl" gap={6}>
          <h2 className="font-display text-5xl leading-none font-light tracking-[-0.05em] text-on-light italic">
            Your wishlist is empty.
          </h2>
          <p className="text-sm leading-6 text-on-light/60">Heart something you love.</p>
          <Button asChild>
            <Link href="/products">Discover the collection</Link>
          </Button>
        </Stack>
      </div>
    );
  }

  return (
    <Stack gap={8}>
      <div className="grid gap-2">
        <h2 className="font-display text-4xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          Wishlist
        </h2>
        <p className="text-sm leading-6 text-on-light/60">
          {wishlistItems.length === 1 ? "1 saved piece." : `${wishlistItems.length} saved pieces.`}
        </p>
      </div>

      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3" role="list">
        {wishlistItems.map((item) => {
          const product = item.product_id ? productsById.get(item.product_id) : null;

          if (!product) {
            return (
              <article
                className="grid gap-4 border border-on-light/10 p-5"
                key={item.id}
                role="listitem"
              >
                <Stack gap={3}>
                  <h3 className="font-display text-2xl leading-none font-light tracking-[-0.05em] italic">
                    Piece unavailable
                  </h3>
                  <p className="text-sm leading-6 text-on-light/60">
                    This saved variant is no longer available in the storefront catalog.
                  </p>
                </Stack>
                <WishlistItemActions
                  canMoveToBag={false}
                  itemId={item.id}
                  title="Saved piece"
                  variantId={item.product_variant_id}
                />
              </article>
            );
          }

          const variant = getVariant(product, item.product_variant_id);
          const variantLabel = getVariantLabel(variant);

          return (
            <article className="grid gap-4" key={item.id} role="listitem">
              <ProductCard
                layout="editorial"
                medusa={productCardMedusaFromStoreProduct(product)}
                sanity={editorial.get(product.id)}
              />
              <Stack gap={3}>
                {variantLabel ? (
                  <p className="text-xs tracking-[0.14em] text-on-light/50 uppercase">
                    Saved variant: {variantLabel}
                  </p>
                ) : null}
                <WishlistItemActions
                  canMoveToBag={isVariantPurchasable(variant)}
                  itemId={item.id}
                  title={product.title}
                  variantId={item.product_variant_id}
                />
              </Stack>
            </article>
          );
        })}
      </div>
    </Stack>
  );
}
