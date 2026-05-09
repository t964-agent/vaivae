import type { Route } from "next";
import Link from "next/link";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Button, Stack } from "@/components/ui";
import type { SanityImage } from "@/sanity/types";

export type EditorialCardProps = {
  body?: string | null;
  cta?: { href: string; label: string; targetBlank?: boolean } | null;
  eyebrow?: string | null;
  heading: string;
  image?: SanityImage | null;
};

export function EditorialCard({ body, cta, eyebrow, heading, image }: EditorialCardProps) {
  return (
    <article className="border border-on-light/10 bg-cream/60 p-5 md:p-6">
      <Stack gap={6}>
        {image?.asset ? (
          <VaivaeImage
            className="aspect-[4/3] size-full object-cover"
            image={image}
            sizes="(min-width: 1024px) 32vw, 90vw"
            width={900}
          />
        ) : null}
        <Stack gap={3}>
          {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
          <SectionHeading as="h3" className="text-4xl leading-none md:text-5xl">
            {heading}
          </SectionHeading>
          {body ? <SectionBody className="text-sm leading-6">{body}</SectionBody> : null}
          {cta ? (
            <Button asChild className="self-start" variant="underline">
              {cta.targetBlank ? (
                <a href={cta.href} rel="noopener noreferrer" target="_blank">
                  {cta.label}
                </a>
              ) : (
                <Link href={cta.href as Route}>{cta.label}</Link>
              )}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </article>
  );
}
