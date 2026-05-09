"use client";

import Link from "next/link";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Button, Container, HStack, Stack } from "@/components/ui";

type ProductErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({ reset }: ProductErrorProps) {
  return (
    <Container asChild variant="wide">
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack className="min-h-[32rem] justify-center" gap={6}>
          <SectionEyebrow>Product</SectionEyebrow>
          <SectionHeading as="h1" className="max-w-3xl">
            This piece is momentarily <em>unavailable</em>.
          </SectionHeading>
          <SectionBody>
            Refresh the product page. If the issue remains, the collection is still available.
          </SectionBody>
          <HStack gap={3} wrap>
            <Button onClick={reset} type="button" variant="ghost">
              Try again
            </Button>
            <Button asChild variant="underline">
              <Link href="/products">Back to products</Link>
            </Button>
          </HStack>
        </Stack>
      </section>
    </Container>
  );
}
