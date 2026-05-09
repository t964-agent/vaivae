import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Container, HStack, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";

import { CtaLink } from "../cta-link";
import type { PageBuilderModuleOf } from "../types";

export type CtaSectionProps = {
  data: PageBuilderModuleOf<"ctaSection">;
};

const solidColorClasses = {
  "accent-gold": "bg-accent-gold text-ink",
  "accent-orange": "bg-accent-orange text-ink",
  "accent-red": "bg-accent-red text-on-dark",
  cream: "bg-cream text-on-light",
  ink: "bg-ink text-on-dark",
  oxblood: "bg-oxblood text-on-dark",
} as const;

export function CtaSection({ data }: CtaSectionProps) {
  const isDark = data.theme === "light-text-on-dark";
  const background = data.background;
  const solidColor = background?.solidColor ?? (isDark ? "ink" : "cream");
  const tone = isDark ? "on-dark" : "on-light";

  if (!data.heading) {
    return null;
  }

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden py-24 md:py-36",
        background?.type !== "image" && solidColorClasses[solidColor],
      )}
    >
      {background?.type === "image" ? (
        <>
          <VaivaeImage
            className="absolute inset-0 -z-20 size-full object-cover"
            image={background.image}
            sizes="100vw"
            width={1800}
          />
          <div className={cn("absolute inset-0 -z-10", isDark ? "bg-ink/65" : "bg-cream/75")} />
        </>
      ) : null}
      <Container variant="narrow">
        <Stack align="center" className="text-center" gap={6}>
          {data.eyebrow ? (
            <SectionEyebrow className={cn(isDark && "text-on-dark/65")}>
              {data.eyebrow}
            </SectionEyebrow>
          ) : null}
          <SectionHeading as="h2" className={cn("text-5xl md:text-7xl", isDark && "text-on-dark")}>
            {data.heading}
          </SectionHeading>
          {data.body ? (
            <SectionBody className={cn("mx-auto", isDark && "text-on-dark/72")}>
              {data.body}
            </SectionBody>
          ) : null}
          <HStack gap={4} justify="center" wrap>
            <CtaLink cta={data.primaryCta} tone={tone} />
            <CtaLink cta={data.secondaryCta} tone={tone} />
          </HStack>
        </Stack>
      </Container>
    </section>
  );
}
