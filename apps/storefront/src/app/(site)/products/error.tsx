"use client";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Button, Container, Stack } from "@/components/ui";

type ProductsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductsError({ reset }: ProductsErrorProps) {
  return (
    <Container asChild variant="wide">
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack className="min-h-[32rem] justify-center" gap={6}>
          <SectionEyebrow>Shop</SectionEyebrow>
          <SectionHeading as="h1" className="max-w-3xl">
            The collection is momentarily <em>unavailable</em>.
          </SectionHeading>
          <SectionBody>
            Refresh the edit. If the issue remains, the collection will return shortly.
          </SectionBody>
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
