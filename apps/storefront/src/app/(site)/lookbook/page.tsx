import type { Metadata } from "next";

import { LookbookCard } from "@/components/cards/lookbook-card";
import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Container, Stack } from "@/components/ui";
import { lookbookListQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { LookbookListQueryResult } from "@/sanity/types";

const LOOKBOOK_TAGS = ["lookbook"];

async function getLookbooks(): Promise<LookbookListQueryResult> {
  try {
    const { data } = await sanityFetch({ query: lookbookListQuery, tags: LOOKBOOK_TAGS });

    return data;
  } catch {
    return [];
  }
}

export function generateMetadata(): Metadata {
  return {
    alternates: {
      canonical: "/lookbook",
    },
    description: "Seasonal vaïvae lookbooks, gathered as quiet studies in movement and form.",
    openGraph: {
      description: "Seasonal vaïvae lookbooks, gathered as quiet studies in movement and form.",
      title: "Lookbook — vaïvae",
      type: "website",
      url: "/lookbook",
    },
    title: "Lookbook",
  };
}

export default async function LookbookPage() {
  const lookbooks = await getLookbooks();

  return (
    <Container asChild variant="wide">
      <section aria-labelledby="lookbook-heading" className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack gap={12}>
          <Stack className="max-w-4xl" gap={6}>
            <SectionEyebrow>Drop 01 — May 2026</SectionEyebrow>
            <SectionHeading as="h1" id="lookbook-heading">
              Lookbook
            </SectionHeading>
            <SectionBody>
              Seasonal studies in fabric, light, and posture. Each lookbook is an edited field
              note from the vaïvae world.
            </SectionBody>
          </Stack>

          {lookbooks.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
              {lookbooks.map((lookbook) => (
                <LookbookCard key={lookbook._id} lookbook={lookbook} />
              ))}
            </div>
          ) : (
            <p className="max-w-xl border-y border-on-light/10 py-10 font-display text-3xl leading-tight font-light tracking-[-0.04em] text-on-light/65 italic">
              Lookbooks are being prepared.
            </p>
          )}
        </Stack>
      </section>
    </Container>
  );
}
