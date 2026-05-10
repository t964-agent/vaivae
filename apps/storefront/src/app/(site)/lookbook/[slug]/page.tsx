import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MuxVideo } from "@/components/atoms/mux-video";
import { RichText } from "@/components/atoms/rich-text";
import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { ProductCard, productCardMedusaFromStoreProduct } from "@/components/cards/product-card";
import { resolvePageBuilderContext } from "@/components/page-builder/context";
import { ProductRail } from "@/components/page-builder/modules/product-rail";
import { asPortableText } from "@/components/page-builder/utils";
import { Button, Container, Stack } from "@/components/ui";
import {
  cleanText,
  createProductRailModule,
  getSanityImageUrl,
  truncateText,
  uniqueProductReferences,
  type ProductRailProduct,
} from "@/lib/editorial";
import { breadcrumbJsonLd, creativeWorkJsonLd, jsonLdScriptProps } from "@/lib/seo/jsonld";
import { lookbookByHandleQuery, lookbookListQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { LookbookByHandleQueryResult } from "@/sanity/types";

type LookbookPageProps = {
  params: Promise<{ slug: string }>;
};

async function getLookbook(slug: string, stega = true): Promise<LookbookByHandleQueryResult> {
  const { data } = await sanityFetch({
    params: { handle: slug },
    query: lookbookByHandleQuery,
    ...(stega ? {} : { stega: false }),
    tags: ["lookbook", `lookbook:${slug}`],
  });

  return data;
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    perspective: "published",
    query: lookbookListQuery,
    stega: false,
    tags: ["lookbook"],
  }).catch(() => ({ data: [] }));

  return data.flatMap((lookbook) => (lookbook.slug ? [{ slug: lookbook.slug }] : []));
}

export async function generateMetadata({ params }: LookbookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lookbook = await getLookbook(slug, false).catch(() => null);

  if (!lookbook) {
    return {
      alternates: { canonical: `/lookbook/${slug}` },
      title: "Lookbook",
    };
  }

  const title = cleanText(lookbook.seo?.title) ?? cleanText(lookbook.title) ?? "Lookbook";
  const description =
    truncateText(lookbook.seo?.description) ??
    "A visual vaïvae lookbook tracing the season through fabric, light, and movement.";
  const canonicalPath = `/lookbook/${lookbook.slug ?? slug}`;
  const image = `${canonicalPath}/opengraph-image`;
  const imageAlt =
    cleanText(lookbook.seo?.ogImage?.alt) ?? cleanText(lookbook.coverImage?.alt) ?? title;

  return {
    alternates: { canonical: canonicalPath },
    description,
    openGraph: {
      description,
      images: image ? [{ alt: imageAlt, height: 630, url: image, width: 1200 }] : undefined,
      title: `${title} — Lookbook — vaïvae`,
      type: "website",
      url: canonicalPath,
    },
    robots: {
      follow: true,
      index: lookbook.seo?.noindex === true ? false : true,
    },
    title: `${title} — Lookbook`,
    twitter: {
      card: "summary_large_image",
      description,
      images: image ? [{ alt: imageAlt, url: image }] : undefined,
      title: `${title} — Lookbook — vaïvae`,
    },
  };
}

export default async function LookbookDetailPage({ params }: LookbookPageProps) {
  const { slug } = await params;
  const lookbook = await getLookbook(slug);

  if (!lookbook) {
    notFound();
  }

  const title = cleanText(lookbook.title) ?? "Untitled lookbook";
  const looks = lookbook.looks ?? [];
  const products = uniqueProductReferences(
    looks.flatMap((look) => look.products ?? []) as ProductRailProduct[],
  );
  const productRail = products.length
    ? createProductRailModule({
        eyebrow: "Shop the lookbook",
        heading: "Referenced pieces",
        key: "lookbook-related-products",
        products,
      })
    : null;
  const context = await resolvePageBuilderContext(productRail ? [productRail] : []);
  const canonicalPath = `/lookbook/${lookbook.slug ?? slug}`;
  const description =
    cleanText(lookbook.seo?.description) ??
    "A visual vaïvae lookbook tracing the season through fabric, light, and movement.";

  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Lookbook", url: "/lookbook" },
            { name: title, url: canonicalPath },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          creativeWorkJsonLd({
            datePublished: lookbook.publishedAt,
            description,
            image: getSanityImageUrl(lookbook.coverImage),
            name: title,
            url: canonicalPath,
          }),
        )}
      />
      <section className="relative isolate min-h-[88dvh] overflow-hidden bg-ink text-on-dark">
        {lookbook.coverVideo?.muxAssetId ? (
          <MuxVideo
            aspectRatio="16/10"
            className="absolute inset-0 size-full"
            controls={false}
            metadata={{ video_title: title }}
            playbackId={lookbook.coverVideo.muxAssetId}
            {...(lookbook.coverImage?.asset?.url
              ? { posterUrl: lookbook.coverImage.asset.url }
              : {})}
          />
        ) : lookbook.coverImage?.asset ? (
          <VaivaeImage
            className="absolute inset-0 size-full object-cover"
            image={lookbook.coverImage}
            priority
            sizes="100vw"
            width={1800}
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/30 to-ink/15" />
        <Container
          className="relative flex min-h-[88dvh] items-end pt-40 pb-14 md:pb-20"
          variant="wide"
        >
          <Stack className="max-w-5xl" gap={6}>
            <SectionEyebrow className="text-on-dark/65">
              {lookbook.eyebrow ?? "Lookbook"}
            </SectionEyebrow>
            <SectionHeading as="h1" className="text-[clamp(4rem,12vw,13rem)] text-on-dark">
              <em>{title}</em>
            </SectionHeading>
            {lookbook.seasonOrDrop?.slug ? (
              <Button asChild tone="on-dark" variant="underline">
                <Link href={`/capsule/${lookbook.seasonOrDrop.slug}` as Route}>
                  {lookbook.seasonOrDrop.title ?? "View capsule"}
                </Link>
              </Button>
            ) : null}
          </Stack>
        </Container>
      </section>

      {lookbook.description?.length ? (
        <Container asChild variant="narrow">
          <section className="py-16 md:py-24">
            <RichText value={asPortableText(lookbook.description)} />
          </section>
        </Container>
      ) : null}

      <Container asChild variant="wide">
        <section aria-labelledby="looks-heading" className="py-20 md:py-32">
          <Stack gap={12}>
            <Stack className="max-w-3xl" gap={4}>
              <SectionEyebrow>Looks</SectionEyebrow>
              <SectionHeading as="h2" className="text-5xl md:text-7xl" id="looks-heading">
                The edit
              </SectionHeading>
            </Stack>

            {looks.length > 0 ? (
              <div className="grid gap-x-5 gap-y-16 md:grid-cols-2 lg:gap-x-8 lg:gap-y-24">
                {looks.map((look, index) => {
                  const lookProducts = look.products ?? [];

                  return (
                    <article className="group" key={look._key}>
                      <Stack gap={6}>
                        <figure>
                          {look.image?.asset ? (
                            <VaivaeImage
                              className="aspect-[4/5] size-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                              image={look.image}
                              sizes="(min-width: 1024px) 46vw, 94vw"
                              width={1200}
                            />
                          ) : (
                            <div
                              aria-label={`Look ${index + 1} image pending`}
                              className="aspect-[4/5] bg-on-light/5"
                              role="img"
                            />
                          )}
                          <figcaption className="mt-4 flex items-start justify-between gap-6 font-body text-xs tracking-[0.16em] text-on-light/50 uppercase">
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            {look.caption ? (
                              <span className="max-w-md text-right">{look.caption}</span>
                            ) : null}
                          </figcaption>
                        </figure>

                        {lookProducts.length > 0 ? (
                          <div className="grid gap-4 sm:grid-cols-2">
                            {lookProducts.map((product) => {
                              const medusa = product.handle
                                ? context.medusaProducts?.get(product.handle)
                                : null;

                              return (
                                <ProductCard
                                  key={`${look._key}-${product._id}`}
                                  layout="compact"
                                  medusa={productCardMedusaFromStoreProduct(medusa)}
                                  sanity={product}
                                />
                              );
                            })}
                          </div>
                        ) : null}
                      </Stack>
                    </article>
                  );
                })}
              </div>
            ) : (
              <SectionBody>Looks are being composed.</SectionBody>
            )}
          </Stack>
        </section>
      </Container>

      {productRail ? (
        <ProductRail data={productRail} medusaProducts={context.medusaProducts} />
      ) : null}
    </>
  );
}
