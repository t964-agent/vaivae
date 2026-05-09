import type { Route } from "next";
import Link from "next/link";

import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import type { SanityImage } from "@/sanity/types";

import { getSlugValue } from "../page-builder/utils";

type LookbookCardEntry = {
  _id: string;
  coverImage?: SanityImage | null | undefined;
  eyebrow?: string | null | undefined;
  slug?: { current?: string | null } | string | null | undefined;
  title?: string | null | undefined;
};

export type LookbookCardProps = {
  lookbook: LookbookCardEntry;
};

export function LookbookCard({ lookbook }: LookbookCardProps) {
  const slug = getSlugValue(lookbook.slug);
  const title = lookbook.title?.trim() || "Untitled lookbook";
  const content = (
    <article className="group relative isolate min-h-[28rem] overflow-hidden bg-ink text-on-dark">
      {lookbook.coverImage?.asset ? (
        <VaivaeImage
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          image={lookbook.coverImage}
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 92vw"
          width={1100}
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/20 to-transparent" />
      <div className="relative flex min-h-[28rem] flex-col justify-end p-6 md:p-8">
        <SectionEyebrow className="text-on-dark/65">
          {lookbook.eyebrow ?? "Lookbook"}
        </SectionEyebrow>
        <SectionHeading as="h3" className="mt-3 text-4xl text-on-dark md:text-5xl">
          <em>{title}</em>
        </SectionHeading>
      </div>
    </article>
  );

  if (!slug) {
    return content;
  }

  return (
    <Link
      className="block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
      href={`/lookbook/${slug}` as Route}
    >
      {content}
    </Link>
  );
}
