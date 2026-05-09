import type { Route } from "next";
import Link from "next/link";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Badge, HStack, Skeleton, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/medusa/types";
import type { SanityImage } from "@/sanity/types";

export type ProductCardSanity = {
  _id: string;
  editorialReady?: boolean | null;
  handle?: string | null;
  heroImage?: SanityImage | null;
  oneLineHook?: string | null;
  title?: string | null;
};

export type ProductCardMedusa = {
  available?: boolean;
  handle?: string | null;
  id: string;
  price?: { amount: number; currency_code: string } | null | undefined;
  title?: string | null;
};

export type ProductCardProps = {
  eyebrow?: string | undefined;
  layout?: "editorial" | "compact";
  loading?: boolean;
  medusa?: ProductCardMedusa | null | undefined;
  sanity?: ProductCardSanity | null | undefined;
};

function formatPrice(price: ProductCardMedusa["price"]): string {
  if (!price || !Number.isFinite(price.amount) || !price.currency_code.trim()) {
    return "Available soon";
  }

  return new Intl.NumberFormat("en-US", {
    currency: price.currency_code.toUpperCase(),
    style: "currency",
  }).format(price.amount / 100);
}

function getVariantAvailability(product: StoreProduct): boolean {
  const variants = product.variants ?? [];

  return variants.some(
    (variant) =>
      variant.manage_inventory === false ||
      variant.allow_backorder === true ||
      (variant.inventory_quantity ?? 0) > 0,
  );
}

function getFirstPrice(product: StoreProduct): { amount: number; currency_code: string } | null {
  const variants = product.variants ?? [];
  const pricedVariant = variants.find(
    (variant) => typeof variant.calculated_price?.calculated_amount === "number",
  );
  const calculatedPrice = pricedVariant?.calculated_price;
  const amount = calculatedPrice?.calculated_amount;
  const currencyCode = calculatedPrice?.currency_code;

  if (typeof amount !== "number" || !currencyCode) {
    return null;
  }

  return { amount, currency_code: currencyCode };
}

export function productCardMedusaFromStoreProduct(
  product: StoreProduct | null | undefined,
): ProductCardMedusa | null {
  if (!product) {
    return null;
  }

  return {
    available: getVariantAvailability(product),
    handle: product.handle,
    id: product.id,
    price: getFirstPrice(product),
    title: product.title,
  };
}

function ProductCardSkeleton({ layout }: { layout: "compact" | "editorial" }) {
  return (
    <Stack className="w-full" gap={layout === "compact" ? 3 : 4}>
      <Skeleton className={cn(layout === "compact" ? "aspect-[4/5]" : "aspect-[4/5]", "h-auto")} />
      <Stack gap={2}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </Stack>
    </Stack>
  );
}

function ProductImage({ image, title }: { image: SanityImage | null | undefined; title: string }) {
  if (image?.asset) {
    return (
      <VaivaeImage
        className="aspect-[4/5] size-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
        image={image}
        sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 82vw"
        width={900}
      />
    );
  }

  return (
    <div
      aria-label={`${title} image pending`}
      className="flex aspect-[4/5] items-center justify-center bg-on-light/5 text-xs tracking-[0.22em] text-on-light/35 uppercase"
      role="img"
    >
      Image pending
    </div>
  );
}

export function ProductCard({
  eyebrow,
  layout = "editorial",
  loading = false,
  medusa,
  sanity,
}: ProductCardProps) {
  if (loading) {
    return <ProductCardSkeleton layout={layout} />;
  }

  const handle = sanity?.handle?.trim() || medusa?.handle?.trim() || null;
  const title = sanity?.title?.trim() || medusa?.title?.trim() || "Untitled product";
  const hook = sanity?.oneLineHook?.trim();
  const price = formatPrice(medusa?.price ?? null);
  const isUnavailable = medusa?.available === false;
  const cardContent = (
    <Stack className="group w-full" gap={layout === "compact" ? 3 : 4}>
      <div className="overflow-hidden bg-on-light/5">
        <ProductImage image={sanity?.heroImage} title={title} />
      </div>
      {layout === "compact" ? (
        <HStack align="start" className="text-sm" gap={3} justify="between">
          <span className="font-display leading-tight tracking-[-0.03em] text-on-light italic">
            {title}
          </span>
          <span aria-label={`Price: ${price}`} className="shrink-0 text-xs text-on-light/55">
            {price}
          </span>
        </HStack>
      ) : (
        <Stack gap={2}>
          <HStack gap={3} justify="between">
            <SectionEyebrow className="text-on-light/45">{eyebrow ?? "Product"}</SectionEyebrow>
            {isUnavailable ? <Badge size="sm">Soon</Badge> : null}
          </HStack>
          <SectionHeading as="h3" className="text-2xl leading-none md:text-3xl">
            <em>{title}</em>
          </SectionHeading>
          <HStack align="end" gap={4} justify="between">
            {hook ? (
              <SectionBody className="text-sm leading-6 md:text-base">{hook}</SectionBody>
            ) : null}
            <span
              aria-label={`Price: ${price}`}
              className="ml-auto shrink-0 font-body text-xs tracking-[0.12em] text-on-light/55 uppercase"
            >
              {price}
            </span>
          </HStack>
        </Stack>
      )}
    </Stack>
  );

  if (!handle) {
    return <article className="block w-full">{cardContent}</article>;
  }

  return (
    <Link
      className="block w-full focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
      href={`/products/${handle}` as Route}
    >
      {cardContent}
    </Link>
  );
}
