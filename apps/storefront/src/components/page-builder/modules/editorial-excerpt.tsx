import { EditorialCard } from "@/components/cards/editorial-card";
import { JournalCard } from "@/components/cards/journal-card";
import { SectionEyebrow } from "@/components/atoms/section-text";
import { Container, Stack } from "@/components/ui";

import { CtaLink } from "../cta-link";
import type { PageBuilderModuleOf } from "../types";

export type EditorialExcerptProps = {
  data: PageBuilderModuleOf<"editorialExcerpt">;
};

export function EditorialExcerpt({ data }: EditorialExcerptProps) {
  const title = data.customHeading?.trim() || data.journalEntry?.title?.trim();

  if (!title && !data.quote) {
    return null;
  }

  return (
    <section className="py-20 md:py-32">
      <Container variant="narrow">
        <Stack gap={8}>
          {data.quote ? (
            <Stack gap={6}>
              {data.eyebrow ? <SectionEyebrow>{data.eyebrow}</SectionEyebrow> : null}
              <blockquote className="font-display text-5xl leading-[0.98] font-light tracking-[-0.055em] text-on-light italic md:text-7xl">
                “{data.quote}”
              </blockquote>
              {title ? <EditorialCard cta={null} eyebrow="Read next" heading={title} /> : null}
            </Stack>
          ) : data.journalEntry ? (
            <JournalCard
              entry={{
                _id: data.journalEntry._id,
                eyebrow: data.eyebrow,
                slug: data.journalEntry.slug,
                title,
              }}
            />
          ) : title ? (
            <EditorialCard eyebrow={data.eyebrow} heading={title} />
          ) : null}
          <CtaLink cta={data.cta} />
        </Stack>
      </Container>
    </section>
  );
}
