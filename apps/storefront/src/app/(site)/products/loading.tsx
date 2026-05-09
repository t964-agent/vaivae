import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Container, HStack, Skeleton, Stack } from "@/components/ui";

export default function ProductsLoading() {
  return (
    <Container asChild variant="wide">
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <Stack gap={12}>
          <Stack className="max-w-4xl" gap={6}>
            <SectionEyebrow>Shop</SectionEyebrow>
            <SectionHeading as="h1">The Collection</SectionHeading>
            <Skeleton className="h-6 w-full max-w-xl" />
          </Stack>
          <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
            <Stack className="hidden lg:flex" gap={8}>
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-36 w-full" />
            </Stack>
            <Stack gap={10}>
              <HStack justify="between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-24 lg:hidden" />
              </HStack>
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }, (_, index) => (
                  <Stack key={index} gap={4}>
                    <Skeleton className="aspect-[4/5] h-auto w-full" />
                    <Stack gap={2}>
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </Stack>
                  </Stack>
                ))}
              </div>
            </Stack>
          </div>
        </Stack>
      </section>
    </Container>
  );
}
