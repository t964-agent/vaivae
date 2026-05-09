"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Button, HStack, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SanityImage } from "@/sanity/types";

export type ProductGalleryImage =
  | {
      alt: string;
      id: string;
      image: SanityImage;
      kind: "sanity";
    }
  | {
      alt: string;
      id: string;
      kind: "medusa";
      url: string;
    };

export type ProductGalleryProps = {
  images: ProductGalleryImage[];
  productTitle: string;
};

function GalleryImage({
  className,
  image,
  priority,
}: {
  className?: string | undefined;
  image: ProductGalleryImage;
  priority?: boolean | undefined;
}) {
  if (image.kind === "sanity") {
    return (
      <VaivaeImage
        className={cn("size-full object-cover", className)}
        image={image.image}
        priority={priority ?? false}
        sizes="(min-width: 1024px) 56vw, 100vw"
        width={1400}
      />
    );
  }

  return (
    <Image
      alt={image.alt}
      className={cn("object-cover", className)}
      fill
      priority={priority ?? false}
      sizes="(min-width: 1024px) 56vw, 100vw"
      src={image.url}
    />
  );
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    align: "start",
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const updateState = () => {
      const nextIndex = emblaApi.selectedScrollSnap();

      setSelectedIndex(nextIndex);
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      thumbsApi?.scrollTo(nextIndex);
    };

    updateState();
    emblaApi.on("select", updateState);
    emblaApi.on("reInit", updateState);

    return () => {
      emblaApi.off("select", updateState);
      emblaApi.off("reInit", updateState);
    };
  }, [emblaApi, thumbsApi]);

  if (images.length === 0) {
    return (
      <div
        aria-label={`${productTitle} image pending`}
        className="flex aspect-[4/5] min-h-[26rem] items-center justify-center bg-on-light/5 text-xs tracking-[0.22em] text-on-light/35 uppercase"
        role="img"
      >
        Image pending
      </div>
    );
  }

  return (
    <Stack aria-label={`${productTitle} product images`} gap={4}>
      <section aria-label="Product images" aria-roledescription="carousel" role="region">
        <div aria-atomic="true" aria-live="polite" className="sr-only">
          {`Image ${selectedIndex + 1} of ${images.length} selected`}
        </div>
        <div className="overflow-hidden bg-on-light/5" ref={emblaRef}>
          <div className="flex touch-pan-y touch-pinch-zoom">
            {images.map((image, index) => (
              <figure
                aria-label={`Image ${index + 1} of ${images.length}`}
                aria-roledescription="slide"
                className="relative aspect-[4/5] min-w-0 flex-[0_0_100%]"
                key={image.id}
                role="group"
              >
                <GalleryImage image={image} priority={index === 0} />
                {image.alt ? <figcaption className="sr-only">{image.alt}</figcaption> : null}
              </figure>
            ))}
          </div>
        </div>
      </section>

      {images.length > 1 ? (
        <Stack gap={3}>
          <div className="overflow-hidden" ref={thumbsRef}>
            <div className="flex gap-3">
              {images.map((image, index) => (
                <Button
                  aria-current={index === selectedIndex ? "true" : undefined}
                  aria-label={`Show image ${index + 1} of ${images.length}`}
                  className={cn(
                    "relative aspect-[4/5] h-24 shrink-0 overflow-hidden rounded-none border-on-light/15 p-0 hover:border-on-light/35",
                    index === selectedIndex && "border-accent-red",
                  )}
                  key={`thumb-${image.id}`}
                  onClick={() => scrollTo(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <GalleryImage
                    className="transition-transform duration-300 hover:scale-105"
                    image={image}
                  />
                </Button>
              ))}
            </div>
          </div>

          <HStack justify="between">
            <HStack gap={2}>
              {images.map((image, index) => (
                <Button
                  aria-label={`Show image ${index + 1}`}
                  className={cn(
                    "size-3 rounded-full border-on-light/25 p-0",
                    index === selectedIndex && "border-accent-red bg-accent-red",
                  )}
                  key={`dot-${image.id}`}
                  onClick={() => scrollTo(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <span className="sr-only">Image {index + 1}</span>
                </Button>
              ))}
            </HStack>
            <HStack gap={2}>
              <Button
                aria-label="Previous product image"
                disabled={!canScrollPrev}
                onClick={() => emblaApi?.scrollPrev()}
                size="icon"
                type="button"
                variant="ghost"
              >
                <ChevronLeft aria-hidden className="size-4" />
              </Button>
              <Button
                aria-label="Next product image"
                disabled={!canScrollNext}
                onClick={() => emblaApi?.scrollNext()}
                size="icon"
                type="button"
                variant="ghost"
              >
                <ChevronRight aria-hidden className="size-4" />
              </Button>
            </HStack>
          </HStack>
        </Stack>
      ) : null}
    </Stack>
  );
}
