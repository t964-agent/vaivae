import Link from "next/link";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Button, Container, Stack } from "@/components/ui";

export default function ProductNotFound() {
  return (
    <Container asChild variant="wide">
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack className="min-h-[32rem] justify-center" gap={6}>
          <SectionEyebrow>404</SectionEyebrow>
          <SectionHeading as="h1" className="max-w-3xl">
            This piece has left the <em>runway</em>.
          </SectionHeading>
          <SectionBody>
            The product may be unpublished, retired, or not yet part of the live collection.
          </SectionBody>
          <div>
            <Button asChild variant="ghost">
              <Link href="/products">Return to the collection</Link>
            </Button>
          </div>
        </Stack>
      </section>
    </Container>
  );
}
