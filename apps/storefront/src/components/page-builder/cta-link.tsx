import type { Route } from "next";
import Link from "next/link";

import { Button, type ButtonTone, type ButtonVariant } from "@/components/ui";
import { resolveChromeLink, type ChromeLink } from "@/components/site/site-link";
import { cn } from "@/lib/utils";

export type PageBuilderCta = {
  _type: "cta";
  label: string | null;
  link: (ChromeLink & { internal?: unknown }) | null;
  style: "ghost" | "primary" | "underline" | null;
} | null;

type CtaLinkProps = {
  className?: string;
  cta: PageBuilderCta | undefined;
  tone?: ButtonTone;
};

export function CtaLink({ className, cta, tone = "on-light" }: CtaLinkProps) {
  const label = cta?.label?.trim();
  const resolved = cta?.link ? resolveChromeLink(cta.link) : null;

  if (!label || !resolved) {
    return null;
  }

  const variant = (cta?.style ?? "underline") satisfies ButtonVariant;

  if (resolved.isExternal) {
    const target = resolved.targetBlank ? "_blank" : undefined;
    const rel = target ? "noopener noreferrer" : undefined;

    return (
      <Button asChild className={cn(className)} tone={tone} variant={variant}>
        <a href={resolved.href} rel={rel} target={target}>
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild className={cn(className)} tone={tone} variant={variant}>
      <Link href={resolved.href as Route}>{label}</Link>
    </Button>
  );
}
