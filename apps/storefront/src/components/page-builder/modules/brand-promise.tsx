import { RichText } from "@/components/atoms/rich-text";
import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Container, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";

import { CtaLink } from "../cta-link";
import { asPortableText } from "../utils";
import type { PageBuilderModuleOf } from "../types";

export type BrandPromiseProps = {
  data: PageBuilderModuleOf<"brandPromise">;
};

export function BrandPromise({ data }: BrandPromiseProps) {
  const isDark = data.theme === "light-text-on-dark";
  const isCentered = data.alignment === "center";
  const variant = data.width === "full" ? "fluid" : data.width === "wide" ? "wide" : "narrow";

  return (
    <section className={cn("py-24 md:py-36", isDark && "bg-ink text-on-dark")}>
      <Container variant={variant}>
        <Stack
          align={isCentered ? "center" : "start"}
          className={cn(isCentered && "text-center")}
          gap={8}
        >
          {data.eyebrow ? (
            <SectionEyebrow className={cn(isDark && "text-on-dark/60")}>
              {data.eyebrow}
            </SectionEyebrow>
          ) : null}
          {data.statement ? (
            <SectionHeading
              as="h2"
              className={cn("text-[clamp(3rem,8vw,8rem)]", isDark && "text-on-dark")}
            >
              {data.statement}
            </SectionHeading>
          ) : null}
          <RichText
            className={cn(
              "max-w-2xl",
              isCentered && "mx-auto",
              isDark && "text-on-dark prose-p:text-on-dark/70 prose-strong:text-on-dark",
            )}
            value={asPortableText(data.body)}
          />
          <CtaLink cta={data.cta} tone={isDark ? "on-dark" : "on-light"} />
        </Stack>
      </Container>
    </section>
  );
}
