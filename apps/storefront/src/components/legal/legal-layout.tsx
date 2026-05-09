import Link from "next/link";

import { RichText } from "@/components/atoms/rich-text";
import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { asPortableText } from "@/components/page-builder/utils";
import { Container, Stack } from "@/components/ui";
import { cleanText, formatEditorialDate } from "@/lib/editorial";
import type { LegalBySlugQueryResult } from "@/sanity/types";

type LegalDocument = NonNullable<LegalBySlugQueryResult>;

type LegalLayoutProps = {
  doc: LegalDocument;
};

const legalKindLabels = {
  accessibility: "Accessibility",
  cookies: "Cookies",
  imprint: "Imprint",
  privacy: "Privacy",
  returns: "Returns",
  shipping: "Shipping",
  terms: "Terms",
  wholesale: "Wholesale",
} satisfies Record<NonNullable<LegalDocument["kind"]>, string>;

function getLegalKindLabel(kind: LegalDocument["kind"]): string {
  return kind ? legalKindLabels[kind] : "Policy";
}

function CookieInventoryEmbed() {
  return (
    <section
      aria-labelledby="termly-cookie-inventory-heading"
      className="mt-14 border-t border-on-light/10 pt-10"
    >
      <Stack gap={4}>
        <div className="grid gap-3">
          <SectionEyebrow>Live inventory</SectionEyebrow>
          <h2
            className="font-display text-3xl leading-tight font-light tracking-[-0.04em] text-on-light italic md:text-5xl"
            id="termly-cookie-inventory-heading"
          >
            Cookies in use
          </h2>
          <p className="font-body text-sm leading-6 text-on-light/60 md:text-base">
            Termly maintains this inventory from recurring scans. Cookie records are not mirrored
            into Sanity.
          </p>
        </div>
        <div
          className="min-h-80 overflow-hidden rounded-sm border border-on-light/10 bg-on-light/[0.02] p-4"
          data-termly-component="cookie-list"
        />
      </Stack>
    </section>
  );
}

export function LegalLayout({ doc }: LegalLayoutProps) {
  const title = cleanText(doc.title) ?? getLegalKindLabel(doc.kind);
  const kindLabel = getLegalKindLabel(doc.kind);
  const lastUpdated = formatEditorialDate(doc.lastUpdated, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Container asChild variant="narrow">
      <article className="py-28 md:py-36">
        <Stack gap={10}>
          <header className="grid gap-5">
            <SectionEyebrow>Legal · {kindLabel}</SectionEyebrow>
            <SectionHeading as="h1" className="text-6xl md:text-8xl">
              {title}
            </SectionHeading>
            {lastUpdated ? (
              <p className="font-body text-xs tracking-[0.16em] text-on-light/45 uppercase">
                Last updated <time dateTime={doc.lastUpdated ?? undefined}>{lastUpdated}</time>
              </p>
            ) : null}
          </header>

          <RichText value={asPortableText(doc.body)} />

          {doc.kind === "cookies" ? <CookieInventoryEmbed /> : null}

          <footer className="border-t border-on-light/10 pt-8">
            <p className="font-body text-sm leading-6 text-on-light/60">
              Need help? Email{" "}
              <Link
                className="text-on-light underline decoration-accent-red/40 underline-offset-4 transition-colors hover:decoration-accent-red focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
                href="mailto:privacy@vaivae.com"
              >
                privacy@vaivae.com
              </Link>
              .
            </p>
          </footer>
        </Stack>
      </article>
    </Container>
  );
}
