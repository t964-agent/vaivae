import { ProductCard, productCardMedusaFromStoreProduct } from "@/components/cards/product-card";
import { Container, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/medusa/types";

import { ModuleHeader } from "../module-header";
import { RailCarousel } from "../rail-carousel";
import type { PageBuilderModuleOf } from "../types";

export type ProductRailProps = {
  data: PageBuilderModuleOf<"productRail">;
  medusaProducts?: Map<string, StoreProduct> | undefined;
};

function columnsClass(columns: number | null): string {
  if (columns === 2) {
    return "md:grid-cols-2";
  }

  if (columns === 4) {
    return "md:grid-cols-2 lg:grid-cols-4";
  }

  return "md:grid-cols-2 lg:grid-cols-3";
}

export function ProductRail({ data, medusaProducts }: ProductRailProps) {
  const products = data.products ?? [];

  if (products.length === 0) {
    return null;
  }

  const layout = data.density === "compact" ? "compact" : "editorial";
  const cards = products.map((product) => {
    const medusa = product.handle ? medusaProducts?.get(product.handle) : null;

    return (
      <ProductCard
        eyebrow={data.eyebrow ?? undefined}
        key={product._id}
        layout={layout}
        medusa={productCardMedusaFromStoreProduct(medusa)}
        sanity={product}
      />
    );
  });

  return (
    <section className="py-20 md:py-32">
      <Stack gap={10}>
        <ModuleHeader
          body={data.intro}
          cta={data.cta}
          eyebrow={data.eyebrow}
          heading={data.heading}
        />
        <Container variant="wide">
          {data.layout === "grid" ? (
            <div className={cn("grid gap-8", columnsClass(data.columns))}>{cards}</div>
          ) : (
            <RailCarousel ariaLabel={data.heading ?? "Product rail"} items={cards} />
          )}
        </Container>
      </Stack>
    </section>
  );
}
