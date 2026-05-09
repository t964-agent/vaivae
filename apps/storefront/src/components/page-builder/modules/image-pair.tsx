import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Container, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";

import { CtaLink } from "../cta-link";
import type { PageBuilderModuleOf } from "../types";

export type ImagePairProps = {
  data: PageBuilderModuleOf<"imagePair">;
};

function figureClass(layout: PageBuilderModuleOf<"imagePair">["layout"], side: "left" | "right") {
  if (layout === "left-emphasis" && side === "left") {
    return "md:col-span-7";
  }

  if (layout === "left-emphasis" && side === "right") {
    return "md:col-span-5 md:pt-24";
  }

  if (layout === "right-emphasis" && side === "right") {
    return "md:col-span-7";
  }

  if (layout === "right-emphasis" && side === "left") {
    return "md:col-span-5 md:pt-24";
  }

  return "md:col-span-6";
}

export function ImagePair({ data }: ImagePairProps) {
  const isDark = data.theme === "light-text-on-dark";

  return (
    <section className={cn("py-20 md:py-32", isDark && "bg-ink text-on-dark")}>
      <Container variant="wide">
        <Stack gap={10}>
          {data.eyebrow || data.heading ? (
            <Stack gap={4}>
              {data.eyebrow ? (
                <SectionEyebrow className={cn(isDark && "text-on-dark/60")}>
                  {data.eyebrow}
                </SectionEyebrow>
              ) : null}
              {data.heading ? (
                <SectionHeading
                  as="h2"
                  className={cn("text-5xl md:text-7xl", isDark && "text-on-dark")}
                >
                  {data.heading}
                </SectionHeading>
              ) : null}
            </Stack>
          ) : null}
          <div className="grid gap-5 md:grid-cols-12 md:gap-8">
            <figure className={figureClass(data.layout, "left")}>
              <VaivaeImage
                className="aspect-[4/5] size-full object-cover"
                image={data.leftImage}
                sizes="(min-width: 1024px) 50vw, 100vw"
                width={1200}
              />
              {data.leftCaption ? (
                <figcaption
                  className={cn(
                    "mt-3 text-xs tracking-[0.14em] uppercase",
                    isDark ? "text-on-dark/55" : "text-on-light/45",
                  )}
                >
                  {data.leftCaption}
                </figcaption>
              ) : null}
            </figure>
            <figure className={figureClass(data.layout, "right")}>
              <VaivaeImage
                className="aspect-[4/5] size-full object-cover"
                image={data.rightImage}
                sizes="(min-width: 1024px) 50vw, 100vw"
                width={1200}
              />
              {data.rightCaption ? (
                <figcaption
                  className={cn(
                    "mt-3 text-xs tracking-[0.14em] uppercase",
                    isDark ? "text-on-dark/55" : "text-on-light/45",
                  )}
                >
                  {data.rightCaption}
                </figcaption>
              ) : null}
            </figure>
          </div>
          <CtaLink cta={data.cta} tone={isDark ? "on-dark" : "on-light"} />
        </Stack>
      </Container>
    </section>
  );
}
