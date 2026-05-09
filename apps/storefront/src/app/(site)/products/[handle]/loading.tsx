import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Container, HStack, Skeleton, Stack } from "@/components/ui";

export default function ProductLoading() {
  return (
    <Container asChild variant="wide">
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] xl:gap-16">
          <Stack gap={4}>
            <Skeleton className="aspect-[4/5] h-auto w-full" />
            <HStack gap={3}>
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton className="h-24 w-20" key={index} />
              ))}
            </HStack>
          </Stack>

          <Stack gap={8}>
            <Stack gap={6}>
              <SectionEyebrow>Product</SectionEyebrow>
              <SectionHeading as="h1" className="text-6xl md:text-8xl">
                <em>Loading</em>
              </SectionHeading>
              <Skeleton className="h-6 w-full max-w-md" />
            </Stack>
            <Stack gap={4}>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </Stack>
            <Stack gap={2}>
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton className="h-16 w-full" key={index} />
              ))}
            </Stack>
          </Stack>
        </div>
      </section>
    </Container>
  );
}
