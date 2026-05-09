import { LookbookCard } from "@/components/cards/lookbook-card";
import { Container, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";

import { ModuleHeader } from "../module-header";
import type { PageBuilderModuleOf } from "../types";

export type LookbookGridProps = {
  data: PageBuilderModuleOf<"lookbookGrid">;
};

export function LookbookGrid({ data }: LookbookGridProps) {
  const images = data.images ?? [];
  const lookbook = data.lookbookEntry;
  const cards = images.length
    ? images.map((image) => (
        <LookbookCard
          key={image._key}
          lookbook={{
            _id: `${lookbook?._id ?? "lookbook"}-${image._key}`,
            coverImage: image,
            eyebrow: data.eyebrow,
            slug: lookbook?.slug,
            title: lookbook?.title ?? data.heading,
          }}
        />
      ))
    : lookbook
      ? [
          <LookbookCard
            key={lookbook._id}
            lookbook={{
              _id: lookbook._id,
              eyebrow: data.eyebrow,
              slug: lookbook.slug,
              title: lookbook.title ?? data.heading,
            }}
          />,
        ]
      : [];

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-32">
      <Stack gap={10}>
        <ModuleHeader cta={data.cta} eyebrow={data.eyebrow} heading={data.heading} />
        <Container variant="wide">
          {data.layout === "scroll" ? (
            <ul
              className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-6 pb-4 md:-mx-8 md:px-8 lg:mx-0 lg:px-0"
              role="list"
            >
              {cards.map((card, index) => (
                <li
                  className="min-w-0 shrink-0 basis-[86vw] snap-center sm:basis-[58vw] lg:basis-[40vw]"
                  key={index}
                >
                  {card}
                </li>
              ))}
            </ul>
          ) : (
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-3")}>{cards}</div>
          )}
        </Container>
      </Stack>
    </section>
  );
}
