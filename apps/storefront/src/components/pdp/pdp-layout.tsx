import type { Route } from "next";
import Link from "next/link";

import { RichText } from "@/components/atoms/rich-text";
import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { ProductRail } from "@/components/page-builder/modules/product-rail";
import { PageBuilder } from "@/components/page-builder/page-builder";
import { resolvePageBuilderContext } from "@/components/page-builder/context";
import type { PageBuilderModule, PageBuilderModuleOf } from "@/components/page-builder/types";
import { asPortableText } from "@/components/page-builder/utils";
import { Badge, Container, HStack, Stack } from "@/components/ui";
import { listEditorialProducts, type EditorialProduct } from "@/lib/sanity/products";
import type { StoreProduct } from "@/medusa/types";
import type { ProductEditorialFragment } from "@/lib/sanity/products";
import type { SanityImage } from "@/sanity/types";

import { AddToCartForm } from "./add-to-cart-form";
import { ProductGallery, type ProductGalleryImage } from "./product-gallery";
import { SpecsAccordion } from "./specs-accordion";

export type PdpLayoutProps = {
  editorial: EditorialProduct;
  product: StoreProduct;
  recommendations: StoreProduct[];
};

function hasSanityImage(image: SanityImage | null | undefined): image is SanityImage {
  return Boolean(image?.asset);
}

function getPdpGalleryImages(
  product: StoreProduct,
  editorial: EditorialProduct,
): ProductGalleryImage[] {
  const editorialReady = editorial?.editorialReady === true;

  if (editorialReady) {
    const images = [editorial.heroImage, ...(editorial.gallery ?? [])].filter(hasSanityImage);

    if (images.length > 0) {
      return images.map((image, index) => ({
        alt: image.alt?.trim() || `${product.title} image ${index + 1}`,
        id: image.asset?._id ?? `sanity-${index}`,
        image,
        kind: "sanity" as const,
      }));
    }
  }

  const medusaImages = new Map<string, ProductGalleryImage>();

  if (product.thumbnail) {
    medusaImages.set(product.thumbnail, {
      alt: `${product.title} primary image`,
      id: "thumbnail",
      kind: "medusa",
      url: product.thumbnail,
    });
  }

  for (const image of product.images ?? []) {
    if (!image.url) {
      continue;
    }

    medusaImages.set(image.url, {
      alt: `${product.title} image`,
      id: image.id,
      kind: "medusa",
      url: image.url,
    });
  }

  return [...medusaImages.values()];
}

function getEyebrow(product: StoreProduct, editorial: EditorialProduct): string {
  const editorialEyebrow = editorial?.editorialReady === true ? editorial.eyebrow?.trim() : null;
  const categoryName = product.categories?.find((category) => category.name?.trim())?.name;
  const collectionTitle = product.collection?.title?.trim();

  return editorialEyebrow || categoryName || collectionTitle || "Product";
}

function getRecommendationProductFragment(
  product: StoreProduct,
  editorialByMedusaId: Map<string, ProductEditorialFragment>,
): ProductEditorialFragment {
  return (
    editorialByMedusaId.get(product.id) ?? {
      _id: product.id,
      _type: "product",
      editorialReady: false,
      handle: product.handle,
      heroImage: null,
      medusaProductId: product.id,
      oneLineHook: null,
      title: product.title,
    }
  );
}

async function Recommendations({ products }: { products: StoreProduct[] }) {
  if (products.length === 0) {
    return null;
  }

  const editorialByMedusaId = await listEditorialProducts(products.map((product) => product.id));
  const medusaProducts = new Map(
    products.flatMap((product) => (product.handle ? [[product.handle, product] as const] : [])),
  );
  const productRail = {
    _key: "pdp-recommendations",
    _type: "productRail",
    columns: 4,
    cta: null,
    density: "compact",
    eyebrow: "Related",
    heading: "From the same edit",
    intro: "Pieces held in the same material language and cadence.",
    layout: "carousel",
    products: products.map((product) =>
      getRecommendationProductFragment(product, editorialByMedusaId),
    ),
  } satisfies PageBuilderModuleOf<"productRail">;

  return <ProductRail data={productRail} medusaProducts={medusaProducts} />;
}

function LookbookFeature({ editorial }: { editorial: EditorialProduct }) {
  const lookbook = editorial?.lookbookFeature;
  const slug = lookbook?.slug?.trim();

  if (!lookbook || !slug) {
    return null;
  }

  return (
    <Container asChild variant="wide">
      <section aria-labelledby="lookbook-feature-heading" className="py-16 md:py-24">
        <Link
          className="grid gap-6 border-y border-on-light/10 py-8 transition-colors hover:border-on-light/25 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold md:grid-cols-[16rem_minmax(0,1fr)] md:items-center"
          href={`/lookbook/${slug}` as Route}
        >
          <div className="overflow-hidden bg-on-light/5">
            {lookbook.coverImage ? (
              <VaivaeImage
                className="aspect-[4/5] size-full object-cover"
                image={lookbook.coverImage}
                sizes="(min-width: 768px) 16rem, 100vw"
                width={520}
              />
            ) : (
              <div className="aspect-[4/5]" />
            )}
          </div>
          <Stack gap={4}>
            <SectionEyebrow>Look featured in</SectionEyebrow>
            <SectionHeading as="h2" className="text-5xl md:text-7xl" id="lookbook-feature-heading">
              <em>{lookbook.title ?? "The lookbook"}</em>
            </SectionHeading>
            <SectionBody>View the full editorial sequence.</SectionBody>
          </Stack>
        </Link>
      </section>
    </Container>
  );
}

export async function PdpLayout({ editorial, product, recommendations }: PdpLayoutProps) {
  const galleryImages = getPdpGalleryImages(product, editorial);
  const editorialReady = editorial?.editorialReady === true;
  const storyModules = (
    editorialReady ? (editorial.pdpStorytelling ?? []) : []
  ) as PageBuilderModule[];
  const pageBuilderContext = await resolvePageBuilderContext(storyModules);
  const hook = editorialReady ? editorial?.oneLineHook?.trim() : null;

  return (
    <>
      <Container asChild variant="wide">
        <section className="pt-24 pb-16 md:pt-32 md:pb-24" aria-labelledby="product-heading">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-start xl:gap-16">
            <ProductGallery images={galleryImages} productTitle={product.title} />

            <Stack className="lg:sticky lg:top-28" gap={8}>
              <Stack gap={6}>
                <HStack gap={3} justify="between">
                  <SectionEyebrow>{getEyebrow(product, editorial)}</SectionEyebrow>
                  {product.status === "published" ? <Badge size="sm">Ready</Badge> : null}
                </HStack>
                <SectionHeading as="h1" className="text-6xl md:text-8xl" id="product-heading">
                  <em>{product.title}</em>
                </SectionHeading>
                {hook ? <SectionBody>{hook}</SectionBody> : null}
                {!hook && product.description ? (
                  <SectionBody>{product.description}</SectionBody>
                ) : null}
              </Stack>

              <AddToCartForm colorSwatches={editorial?.colorSwatches} product={product} />
              <SpecsAccordion editorial={editorial} product={product} />
            </Stack>
          </div>
        </section>
      </Container>

      {editorialReady && editorial?.narrative?.length ? (
        <Container asChild variant="narrow">
          <section aria-labelledby="product-story-heading" className="py-16 md:py-28">
            <Stack gap={8}>
              <SectionEyebrow>Story</SectionEyebrow>
              <SectionHeading as="h2" className="sr-only" id="product-story-heading">
                Product story
              </SectionHeading>
              <RichText className="text-lg" value={asPortableText(editorial.narrative)} />
            </Stack>
          </section>
        </Container>
      ) : null}

      {editorialReady ? <PageBuilder context={pageBuilderContext} modules={storyModules} /> : null}
      <LookbookFeature editorial={editorial} />
      <Recommendations products={recommendations} />
    </>
  );
}
