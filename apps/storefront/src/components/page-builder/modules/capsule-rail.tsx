import { CapsuleCard } from "@/components/cards/capsule-card";
import { Container, Stack } from "@/components/ui";

import { ModuleHeader } from "../module-header";
import { RailCarousel } from "../rail-carousel";
import type { PageBuilderModuleOf } from "../types";

export type CapsuleRailProps = {
  data: PageBuilderModuleOf<"capsuleRail">;
};

export function CapsuleRail({ data }: CapsuleRailProps) {
  const capsules = data.capsules ?? [];

  if (capsules.length === 0) {
    return null;
  }

  const cards = capsules.map((capsule) => <CapsuleCard capsule={capsule} key={capsule._id} />);

  return (
    <section className="py-20 md:py-32">
      <Stack gap={10}>
        <ModuleHeader cta={data.cta} eyebrow={data.eyebrow} heading={data.heading} />
        <Container variant="wide">
          <RailCarousel
            ariaLabel={data.heading ?? "Capsule rail"}
            items={cards}
            slideClassName="basis-[86%] sm:basis-[48%] lg:basis-[38%]"
          />
        </Container>
      </Stack>
    </section>
  );
}
