import { Container, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { PageBuilderModuleOf } from "../types";

export type QuoteProps = {
  data: PageBuilderModuleOf<"quote">;
};

export function Quote({ data }: QuoteProps) {
  if (!data.quote) {
    return null;
  }

  const isPress = data.style === "press";

  return (
    <section className="py-20 md:py-32">
      <Container variant={isPress ? "default" : "narrow"}>
        <Stack
          align={isPress ? "start" : "center"}
          className={cn(!isPress && "text-center")}
          gap={6}
        >
          <blockquote
            className={cn(
              "font-display leading-[0.98] font-light tracking-[-0.055em] text-on-light",
              isPress ? "text-4xl md:text-6xl" : "text-[clamp(3.5rem,9vw,9rem)] italic",
            )}
          >
            “{data.quote}”
          </blockquote>
          {data.attribution || data.source ? (
            <p className="font-body text-xs tracking-[0.24em] text-on-light/50 uppercase">
              {[data.attribution, data.source].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </Stack>
      </Container>
    </section>
  );
}
