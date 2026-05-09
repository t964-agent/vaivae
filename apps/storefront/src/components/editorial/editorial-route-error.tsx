"use client";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Button, Container, Stack } from "@/components/ui";

type EditorialRouteErrorProps = {
  body: string;
  eyebrow: string;
  reset: () => void;
  title: string;
};

export function EditorialRouteError({ body, eyebrow, reset, title }: EditorialRouteErrorProps) {
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
            <Button onClick={reset} type="button" variant="ghost">
              Try again
            </Button>
          </div>
        </Stack>
      </section>
    </Container>
  );
}
