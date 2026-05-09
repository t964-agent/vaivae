import { RichText } from "@/components/atoms/rich-text";
import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Container, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/medusa/types";

import type { PageBuilderModuleOf } from "../types";
import { asPortableText, getImageUrl } from "../utils";

import { VideoChapterPlayer, type VideoChapterHotspot } from "./video-chapter-player";

export type VideoChapterProps = {
  data: PageBuilderModuleOf<"videoChapter">;
  medusaProducts?: Map<string, StoreProduct> | undefined;
};

function getHotspots(
  data: PageBuilderModuleOf<"videoChapter">,
  medusaProducts: Map<string, StoreProduct> | undefined,
): VideoChapterHotspot[] {
  return (data.productHotspots ?? []).map((hotspot) => {
    const sanityProduct = hotspot.product;
    const medusaProduct = sanityProduct?.handle ? medusaProducts?.get(sanityProduct.handle) : null;
    const handle = sanityProduct?.handle ?? medusaProduct?.handle ?? null;
    const label =
      hotspot.label?.trim() ||
      sanityProduct?.title?.trim() ||
      medusaProduct?.title?.trim() ||
      "Shop the look";

    return {
      href: handle ? `/products/${handle}` : null,
      label,
    };
  });
}

export function VideoChapter({ data, medusaProducts }: VideoChapterProps) {
  const heading = data.heading?.trim();
  const isDark = data.theme !== "dark-text-on-light";

  if (!heading) {
    return null;
  }

  return (
    <section className={cn("py-20 md:py-32", isDark && "bg-ink text-on-dark")}>
      <Container variant="wide">
        <Stack gap={8}>
          <VideoChapterPlayer
            hotspots={getHotspots(data, medusaProducts)}
            playbackId={data.muxPlaybackId}
            posterAlt={data.posterImage?.alt ?? ""}
            posterUrl={getImageUrl(data.posterImage)}
            title={heading}
          />
          <Stack className="max-w-3xl" gap={4}>
            {data.eyebrow ? (
              <SectionEyebrow className={cn(isDark && "text-on-dark/60")}>
                {data.eyebrow}
              </SectionEyebrow>
            ) : null}
            <SectionHeading
              as="h2"
              className={cn("text-5xl md:text-7xl", isDark && "text-on-dark")}
            >
              {heading}
            </SectionHeading>
            <RichText
              className={cn(
                isDark && "text-on-dark prose-p:text-on-dark/70 prose-strong:text-on-dark",
              )}
              value={asPortableText(data.body)}
            />
          </Stack>
        </Stack>
      </Container>
    </section>
  );
}
