import type { Route } from "next";
import Link from "next/link";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Button, Container, Skeleton, Stack } from "@/components/ui";

type EditorialLoadingStateProps = {
  eyebrow: string;
  title: string;
};

type EditorialNotFoundStateProps = {
  body: string;
  ctaHref: string;
  ctaLabel: string;
  eyebrow?: string;
  title: string;
};

export function EditorialLoadingState({ eyebrow, title }: EditorialLoadingStateProps) {
  return (
    <Container asChild variant="wide">
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack gap={12}>
          <Stack className="max-w-4xl" gap={6}>
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <SectionHeading as="h1">{title}</SectionHeading>
            <Skeleton className="h-6 w-full max-w-xl" />
          </Stack>
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {Array.from({ length: 4 }, (_, index) => (
              <Stack key={index} gap={4}>
                <Skeleton className="aspect-[4/5] h-auto w-full" />
                <Stack gap={2}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </Stack>
              </Stack>
            ))}
          </div>
        </Stack>
      </section>
    </Container>
  );
}

export function EditorialNotFoundState({
  body,
  ctaHref,
  ctaLabel,
  eyebrow = "404",
  title,
}: EditorialNotFoundStateProps) {
  return (
    <Container asChild variant="wide">
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack className="min-h-[32rem] justify-center" gap={6}>
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <SectionHeading as="h1" className="max-w-3xl">
            {title}
          </SectionHeading>
          <SectionBody>{body}</SectionBody>
          <div>
            <Button asChild variant="ghost">
              <Link href={ctaHref as Route}>{ctaLabel}</Link>
            </Button>
          </div>
        </Stack>
      </section>
    </Container>
  );
}
