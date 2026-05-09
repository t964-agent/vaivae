import type { PortableTextBlock } from "@portabletext/types";
import type { ReactNode } from "react";

import type { SanityImage } from "@/sanity/types";

export function asPortableText(
  value: unknown[] | null | undefined,
): PortableTextBlock[] | undefined {
  return value ? (value as PortableTextBlock[]) : undefined;
}

export function getImageUrl(image: SanityImage | null | undefined): string | undefined {
  return image?.asset?.url ?? undefined;
}

export function getSlugValue(
  slug: { current?: string | null } | string | null | undefined,
): string | null {
  if (typeof slug === "string") {
    const trimmed = slug.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  const current = slug?.current?.trim();

  return current && current.length > 0 ? current : null;
}

export function renderEmphasisText(value: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern = /<em>(.*?)<\/em>/gis;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    const [raw, emphasized] = match;

    if (match.index > lastIndex) {
      nodes.push(value.slice(lastIndex, match.index));
    }

    nodes.push(<em key={`${match.index}-${raw.length}`}>{emphasized ?? ""}</em>);
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : value;
}
