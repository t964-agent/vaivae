import { SectionBody, SectionHeading } from "@/components/atoms/section-text";
import { ProductCard, productCardMedusaFromStoreProduct } from "@/components/cards/product-card";
import { Stack } from "@/components/ui";
import type { MergedProduct, StoreProduct } from "@/medusa/types";
import type { ProductEditorialFragment } from "@/lib/sanity/products";

export type ProductGridProps = {
  editorial: Map<string, ProductEditorialFragment>;
  products: StoreProduct[];
};

function EmptyProductGrid() {
  return (
    <Stack
      align="center"
      className="min-h-[28rem] justify-center border border-on-light/10 bg-on-light/[0.025] px-6 py-20 text-center"
      gap={4}
    >
      <SectionHeading as="h2" className="max-w-2xl text-4xl md:text-6xl">
        The collection is being <em>prepared</em>.
      </SectionHeading>
      <SectionBody className="mx-auto max-w-xl text-sm md:text-base">
        No pieces match this edit yet. Return soon, or broaden the selection.
      </SectionBody>
    </Stack>
  );
}

export function ProductGrid({ editorial, products }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyProductGrid />;
  }

  const mergedProducts: MergedProduct[] = products.map((product) => {
    const editorialProduct = editorial.get(product.id);

    return editorialProduct
      ? { editorial: editorialProduct, medusa: product }
      : { medusa: product };
  });

  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3" role="list">
      {mergedProducts.map((product) => (
        <article key={product.medusa.id} role="listitem">
          <ProductCard
            layout="editorial"
            medusa={productCardMedusaFromStoreProduct(product.medusa)}
            sanity={product.editorial}
          />
        </article>
      ))}
    </div>
  );
}
