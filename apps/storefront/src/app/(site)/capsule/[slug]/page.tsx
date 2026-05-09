import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MuxVideo } from "@/components/atoms/mux-video";
import { RichText } from "@/components/atoms/rich-text";
import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { PageBuilder } from "@/components/page-builder/page-builder";
import { resolvePageBuilderContext } from "@/components/page-builder/context";
import { ProductRail } from "@/components/page-builder/modules/product-rail";
import type { PageBuilderModule } from "@/components/page-builder/types";
import { asPortableText } from "@/components/page-builder/utils";
import { Container, HStack, Stack } from "@/components/ui";
import {
  cleanText,
  createProductRailModule,
  formatEditorialDate,
  getSanityImageUrl,
  truncateText,
  uniqueProductReferences,
  type ProductRailProduct,
} from "@/lib/editorial";
import { capsuleByHandleQuery, capsuleListQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { CapsuleByHandleQueryResult } from "@/sanity/types";

type CapsuleDetailPageProps = {
  params: Promise<{ slug: string }>;
};

async function getCapsule(slug: string, stega = true): Promise<CapsuleByHandleQueryResult> {
  const { data } = await sanityFetch({
    params: { handle: slug },
    query: capsuleByHandleQuery,
    ...(stega ? {} : { stega: false }),
    tags: ["capsule", `capsule:${slug}`],
  });

  return data;
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    perspective: "published",
    query: capsuleListQuery,
    stega: false,
    tags: ["capsule"],
  }).catch(() => ({ data: [] }));

  return data.flatMap((capsule) => (capsule.slug ? [{ slug: capsule.slug }] : []));
}

export async function generateMetadata({ params }: CapsuleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const capsule = await getCapsule(slug, false).catch(() => null);

  if (!capsule) {
    return {
      alternates: { canonical: `/capsule/${slug}` },
      title: "Capsule",
    };
  }

  const title = cleanText(capsule.seo?.title) ?? cleanText(capsule.title) ?? "Capsule";
  const description =
    truncateText(capsule.seo?.description) ??
    "A seasonal vaïvae capsule landing with story, product, and visual notes.";
  const canonicalPath = `/capsule/${capsule.slug ?? slug}`;
  const image = getSanityImageUrl(capsule.seo?.ogImage ?? capsule.coverImage);
  const imageAlt = cleanText(capsule.seo?.ogImage?.alt) ?? cleanText(capsule.coverImage?.alt) ?? title;

  return {
    alternates: { canonical: canonicalPath },
    description,
    openGraph: {
      description,
      images: image ? [{ alt: imageAlt, height: 630, url: image, width: 1200 }] : undefined,
      title: `${title} — Capsule — vaïvae`,
      type: "website",
      url: canonicalPath,
    },
    robots: {
      follow: true,
      index: capsule.seo?.noindex === true ? false : true,
    },
    title: `${title} — Capsule`,
    twitter: {
      card: "summary_large_image",
      description,
      images: image ? [{ alt: imageAlt, url: image }] : undefined,
      title: `${title} — Capsule — vaïvae`,
    },
  };
}

export default async function CapsuleDetailPage({ params }: CapsuleDetailPageProps) {
  const { slug } = await params;
  const capsule = await getCapsule(slug);

  if (!capsule) {
    notFound();
  }

  const title = cleanText(capsule.title) ?? "Untitled capsule";
  const releaseDate = formatEditorialDate(capsule.releaseDate, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDate = formatEditorialDate(capsule.endDate, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const modules = (capsule.pageBuilder ?? []) as PageBuilderModule[];
  const products = uniqueProductReferences((capsule.products ?? []) as ProductRailProduct[]);
  const productRail = products.length
    ? createProductRailModule({
        eyebrow: "Shop the capsule",
        heading: "The capsule edit",
        key: "capsule-products",
        products,
      })
    : null;
  const context = await resolvePageBuilderContext(productRail ? [...modules, productRail] : modules);

  return (
    <>
      <section className="relative isolate min-h-[88dvh] overflow-hidden bg-ink text-on-dark">
        {capsule.coverVideo?.muxAssetId ? (
          <MuxVideo
            aspectRatio="16/10"
            className="absolute inset-0 size-full"
            controls={false}
            metadata={{ video_title: title }}
            playbackId={capsule.coverVideo.muxAssetId}
            {...(capsule.coverImage?.asset?.url ? { posterUrl: capsule.coverImage.asset.url } : {})}
          />
        ) : capsule.coverImage?.asset ? (
          <VaivaeImage
            className="absolute inset-0 size-full object-cover"
            image={capsule.coverImage}
            priority
            sizes="100vw"
            width={1800}
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/30 to-ink/15" />
        <Container className="relative flex min-h-[88dvh] items-end pt-40 pb-14 md:pb-20" variant="wide">
          <Stack className="max-w-5xl" gap={6}>
            <SectionEyebrow className="text-on-dark/65">
              {capsule.eyebrow ?? "Capsule"}
            </SectionEyebrow>
            <SectionHeading as="h1" className="text-[clamp(4rem,12vw,13rem)] text-on-dark">
              <em>{title}</em>
            </SectionHeading>
            {releaseDate || endDate ? (
              <HStack className="text-xs tracking-[0.16em] text-on-dark/65 uppercase" gap={3} wrap>
                {releaseDate ? <time dateTime={capsule.releaseDate ?? undefined}>{releaseDate}</time> : null}
                {releaseDate && endDate ? <span aria-hidden>·</span> : null}
                {endDate ? <time dateTime={capsule.endDate ?? undefined}>Through {endDate}</time> : null}
              </HStack>
            ) : null}
          </Stack>
        </Container>
      </section>

      {capsule.description?.length ? (
        <Container asChild variant="narrow">
          <section className="py-16 md:py-24">
            <RichText value={asPortableText(capsule.description)} />
          </section>
        </Container>
      ) : null}

      <PageBuilder context={context} modules={modules} />

      {productRail ? (
        <ProductRail data={productRail} medusaProducts={context.medusaProducts} />
      ) : null}

      {!modules.length && !productRail ? (
        <Container asChild variant="narrow">
          <section className="py-20 md:py-28">
            <SectionBody>The capsule edit is being composed.</SectionBody>
          </section>
        </Container>
      ) : null}
    </>
  );
}
