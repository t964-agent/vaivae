"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useId, useState, type ReactNode } from "react";

import { Button, HStack } from "@/components/ui";
import { cn } from "@/lib/utils";

type RailCarouselProps = {
  ariaLabel: string;
  className?: string;
  items: ReactNode[];
  slideClassName?: string;
};

export function RailCarousel({
  ariaLabel,
  className,
  items,
  slideClassName = "basis-[82%] sm:basis-[45%] lg:basis-[31%]",
}: RailCarouselProps) {
  const reduceMotion = useReducedMotion() === true;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    duration: reduceMotion ? 0 : 24,
    loop: false,
    slidesToScroll: "auto",
  });
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [selected, setSelected] = useState(0);
  const statusId = useId();

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const updateState = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      setSelected(emblaApi.selectedScrollSnap());
    };

    updateState();
    emblaApi.on("select", updateState);
    emblaApi.on("reInit", updateState);

    return () => {
      emblaApi.off("select", updateState);
      emblaApi.off("reInit", updateState);
    };
  }, [emblaApi]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={cn("relative", className)}
      role="region"
    >
      <div aria-atomic="true" aria-live="polite" className="sr-only" id={statusId}>
        {`Slide ${selected + 1} of ${items.length}`}
      </div>
      <div className="overflow-x-auto overscroll-x-contain md:overflow-hidden" ref={emblaRef}>
        <ul className="flex touch-pan-y touch-pinch-zoom gap-5 pb-4 md:gap-6" role="list">
          {items.map((item, index) => (
            <li
              aria-label={`${index + 1} of ${items.length}`}
              aria-roledescription="slide"
              className={cn("min-w-0 shrink-0 grow-0 snap-start", slideClassName)}
              key={index}
              role="group"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <HStack className="mt-8 hidden md:flex" gap={3} justify="end">
        <Button
          aria-controls={statusId}
          aria-label={`Previous ${ariaLabel.toLowerCase()}`}
          disabled={!canScrollPrev}
          onClick={() => emblaApi?.scrollPrev()}
          size="icon"
          variant="ghost"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </Button>
        <Button
          aria-controls={statusId}
          aria-label={`Next ${ariaLabel.toLowerCase()}`}
          disabled={!canScrollNext}
          onClick={() => emblaApi?.scrollNext()}
          size="icon"
          variant="ghost"
        >
          <ChevronRight aria-hidden className="size-4" />
        </Button>
      </HStack>
    </section>
  );
}
