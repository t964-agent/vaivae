import type { Route } from "next";
import Link from "next/link";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Stack } from "@/components/ui";
import type { SanityImage } from "@/sanity/types";

import { getSlugValue } from "../page-builder/utils";

type JournalCardEntry = {
  _id: string;
  coverImage?: SanityImage | null | undefined;
  eyebrow?: string | null | undefined;
  excerpt?: string | null | undefined;
  publishedAt?: string | null | undefined;
  slug?: { current?: string | null } | string | null | undefined;
  title?: string | null | undefined;
};

export type JournalCardProps = {
  entry: JournalCardEntry;
};

function formatDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

export function JournalCard({ entry }: JournalCardProps) {
  const slug = getSlugValue(entry.slug);
  const title = entry.title?.trim() || "Untitled journal entry";
  const publishedAt = formatDate(entry.publishedAt);
  const content = (
    <Stack gap={4}>
      <div className="overflow-hidden bg-on-light/5">
        {entry.coverImage?.asset ? (
          <VaivaeImage
            className="aspect-[4/3] size-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
            image={entry.coverImage}
            sizes="(min-width: 1024px) 30vw, 88vw"
            width={920}
          />
        ) : (
          <div className="aspect-[4/3] bg-on-light/5" />
        )}
      </div>
      <Stack gap={2}>
        <SectionEyebrow>{entry.eyebrow ?? "Journal"}</SectionEyebrow>
        <SectionHeading as="h3" className="text-3xl leading-[0.98] md:text-4xl">
          <em>{title}</em>
        </SectionHeading>
        {entry.excerpt ? (
          <SectionBody className="text-sm leading-6">{entry.excerpt}</SectionBody>
        ) : null}
        {publishedAt ? (
          <span className="font-body text-xs tracking-[0.16em] text-on-light/45 uppercase">
            {publishedAt}
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
      className="group block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
      href={`/journal/${slug}` as Route}
    >
      {content}
    </Link>
  );
}
