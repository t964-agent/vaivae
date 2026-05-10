import type { Metadata } from "next";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { CapsuleCard } from "@/components/cards/capsule-card";
import { Container, Stack } from "@/components/ui";
import { capsuleListQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { CapsuleListQueryResult } from "@/sanity/types";

async function getCapsules(): Promise<CapsuleListQueryResult> {
  try {
    const { data } = await sanityFetch({ query: capsuleListQuery, tags: ["capsule"] });

    return data;
  } catch {
    return [];
  }
}

export function generateMetadata(): Metadata {
  const description = "Seasonal vaïvae capsule landings, each composed as a small editorial world.";

  return {
    alternates: {
      canonical: "/capsule",
    },
    description,
    openGraph: {
      description,
      title: "Capsules — vaïvae",
      type: "website",
      url: "/capsule",
    },
    robots: {
      follow: true,
      index: true,
    },
    title: "Capsules",
    twitter: {
      card: "summary_large_image",
      description,
      title: "Capsules — vaïvae",
    },
  };
}

export default async function CapsulePage() {
  const capsules = await getCapsules();

  return (
    <Container asChild variant="wide">
      <section aria-labelledby="capsule-heading" className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack gap={12}>
          <Stack className="max-w-4xl" gap={6}>
            <SectionEyebrow>Seasonal Capsules</SectionEyebrow>
            <SectionHeading as="h1" id="capsule-heading">
              Capsules
            </SectionHeading>
            <SectionBody>
              Drop-specific worlds: story, product, and image held in one considered edit.
            </SectionBody>
          </Stack>

          {capsules.length > 0 ? (
            <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {capsules.map((capsule) => (
                <CapsuleCard capsule={capsule} key={capsule._id} />
              ))}
            </div>
          ) : (
            <p className="max-w-xl border-y border-on-light/10 py-10 font-display text-3xl leading-tight font-light tracking-[-0.04em] text-on-light/65 italic">
              Capsules are being prepared.
            </p>
          )}
        </Stack>
      </section>
    </Container>
  );
}
