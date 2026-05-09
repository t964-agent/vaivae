import type { Route } from "next";
import Link from "next/link";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Stack } from "@/components/ui";
import type { SanityImage } from "@/sanity/types";

import { getSlugValue } from "../page-builder/utils";

type CapsuleCardEntry = {
  _id: string;
  coverImage?: SanityImage | null | undefined;
  description?: string | null | undefined;
  releaseDate?: string | null | undefined;
  slug?: { current?: string | null } | string | null | undefined;
  title?: string | null | undefined;
};

export type CapsuleCardProps = {
  capsule: CapsuleCardEntry;
};

function formatReleaseDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  const slug = getSlugValue(capsule.slug);
  const title = capsule.title?.trim() || "Untitled capsule";
  const releaseDate = formatReleaseDate(capsule.releaseDate);
  const content = (
    <Stack className="group" gap={4}>
      <div className="overflow-hidden bg-on-light/5">
        {capsule.coverImage?.asset ? (
          <VaivaeImage
            className="aspect-[5/6] size-full object-cover transition-transform duration-700 group-hover:scale-[1.015]"
            image={capsule.coverImage}
            sizes="(min-width: 1280px) 34vw, (min-width: 768px) 48vw, 88vw"
            width={980}
          />
        ) : (
          <div className="aspect-[5/6] bg-on-light/5" />
        )}
      </div>
      <Stack gap={2}>
        <SectionEyebrow>Capsule</SectionEyebrow>
        <SectionHeading as="h3" className="text-4xl leading-none md:text-5xl">
          {title}
        </SectionHeading>
        {capsule.description ? (
          <SectionBody className="line-clamp-2 text-sm leading-6">
            {capsule.description}
          </SectionBody>
        ) : null}
        {releaseDate ? (
          <span className="font-body text-xs tracking-[0.16em] text-on-light/45 uppercase">
            {releaseDate}
          </span>
        ) : null}
      </Stack>
    </Stack>
  );

  if (!slug) {
    return <article>{content}</article>;
  }

  return (
    <Link
      className="block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
      href={`/capsule/${slug}` as Route}
    >
      {content}
    </Link>
  );
}
