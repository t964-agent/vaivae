import type { ReactNode } from "react";

import { Container, Stack } from "@/components/ui";

type AuthShellProps = {
  body: string;
  children: ReactNode;
  eyebrow: string;
  title: string;
};

export function AuthShell({ body, children, eyebrow, title }: AuthShellProps) {
  return (
    <Container asChild variant="wide">
      <section className="grid min-h-[calc(100dvh-6rem)] items-center pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.7fr)] lg:items-start lg:gap-16">
          <Stack className="max-w-3xl" gap={6}>
            <p className="font-body text-[0.68rem] tracking-[0.24em] text-on-light/45 uppercase">
              {eyebrow}
            </p>
            <h1 className="font-display text-5xl leading-none font-light tracking-[-0.06em] text-on-light italic sm:text-7xl lg:text-8xl">
              {title}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-on-light/62 sm:text-base sm:leading-7">
              {body}
            </p>
          </Stack>

          <div className="border border-on-light/10 bg-on-light/[0.025] p-5 shadow-[0_1px_0_rgba(26,15,8,0.04)] sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </section>
    </Container>
  );
}
