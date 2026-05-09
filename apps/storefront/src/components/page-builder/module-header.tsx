import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Container, HStack, Stack, type ContainerVariant } from "@/components/ui";
import { cn } from "@/lib/utils";

import { CtaLink, type PageBuilderCta } from "./cta-link";

type ModuleHeaderProps = {
  align?: "center" | "left";
  body?: string | null;
  className?: string;
  cta?: PageBuilderCta | undefined;
  eyebrow?: string | null;
  heading?: string | null;
  headingId?: string;
  tone?: "on-dark" | "on-light";
  variant?: ContainerVariant;
};

export function ModuleHeader({
  align = "left",
  body,
  className,
  cta,
  eyebrow,
  heading,
  headingId,
  tone = "on-light",
  variant = "default",
}: ModuleHeaderProps) {
  if (!eyebrow && !heading && !body && !cta) {
    return null;
  }

  const isCentered = align === "center";

  return (
    <Container className={cn(className)} variant={variant}>
      <HStack
        align="end"
        className={cn(isCentered && "justify-center text-center")}
        gap={8}
        justify="between"
      >
        <Stack align={isCentered ? "center" : "start"} className="max-w-3xl" gap={4}>
          {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
          {heading ? (
            <SectionHeading as="h2" className="text-5xl md:text-7xl" id={headingId}>
              {heading}
            </SectionHeading>
          ) : null}
          {body ? <SectionBody className={cn(isCentered && "mx-auto")}>{body}</SectionBody> : null}
        </Stack>
        {cta && !isCentered ? <CtaLink cta={cta} tone={tone} /> : null}
      </HStack>
      {cta && isCentered ? (
        <div className="mt-8 flex justify-center">
          <CtaLink cta={cta} tone={tone} />
        </div>
      ) : null}
    </Container>
  );
}
