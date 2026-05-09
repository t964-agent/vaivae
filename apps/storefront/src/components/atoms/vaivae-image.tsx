import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/image";
import type { SanityImage } from "@/sanity/types";

const DEFAULT_SIZES = "(min-width: 1024px) 800px, (min-width: 640px) 600px, 100vw";
const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 1200;

export type VaivaeImageProps = {
  className?: string;
  height?: number;
  image: SanityImage | null | undefined;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  width?: number;
};

function getPositiveNumber(value: number | null | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function VaivaeImage({
  className,
  height,
  image,
  priority = false,
  quality = 80,
  sizes = DEFAULT_SIZES,
  width,
}: VaivaeImageProps) {
  if (!image?.asset) {
    return null;
  }

  const dimensions = image.asset.metadata?.dimensions;
  const aspectRatio = getPositiveNumber(dimensions?.aspectRatio);
  const resolvedWidth =
    width ??
    getPositiveNumber(dimensions?.width) ??
    (height && aspectRatio ? Math.round(height * aspectRatio) : DEFAULT_WIDTH);
  const resolvedHeight =
    height ??
    getPositiveNumber(dimensions?.height) ??
    (aspectRatio ? Math.round(resolvedWidth / aspectRatio) : DEFAULT_HEIGHT);
  const alt = image.alt?.trim() ?? "";
  const lqip = image.asset.metadata?.lqip ?? undefined;
  const blurProps = lqip ? { blurDataURL: lqip, placeholder: "blur" as const } : {};
  const src = urlFor(image as SanityImageSource)
    .width(resolvedWidth)
    .quality(quality)
    .fit("clip")
    .url();

  return (
    <Image
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("h-auto", className)}
      height={resolvedHeight}
      priority={priority}
      quality={quality}
      sizes={sizes}
      src={src}
      width={resolvedWidth}
      {...blurProps}
    />
  );
}
