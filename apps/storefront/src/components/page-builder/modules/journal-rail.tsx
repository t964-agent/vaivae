import { JournalCard } from "@/components/cards/journal-card";
import { Container, Stack } from "@/components/ui";

import { ModuleHeader } from "../module-header";
import { RailCarousel } from "../rail-carousel";
import type { PageBuilderModuleOf } from "../types";

export type JournalRailProps = {
  data: PageBuilderModuleOf<"journalRail">;
};

export function JournalRail({ data }: JournalRailProps) {
  const entries = data.entries ?? [];
  const limitedEntries = entries.slice(0, data.limit ?? entries.length);

  if (limitedEntries.length === 0) {
    return null;
  }

  const cards = limitedEntries.map((entry) => <JournalCard entry={entry} key={entry._id} />);

  return (
    <section className="py-20 md:py-32">
      <Stack gap={10}>
        <ModuleHeader cta={data.cta} eyebrow={data.eyebrow} heading={data.heading} />
        <Container variant="wide">
          <RailCarousel ariaLabel={data.heading ?? "Journal rail"} items={cards} />
        </Container>
      </Stack>
    </section>
  );
}
