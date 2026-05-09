import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SectionEyebrowProps = HTMLAttributes<HTMLParagraphElement>;

export function SectionEyebrow({ className, ...props }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        "font-body text-[0.68rem] font-medium tracking-[0.32em] text-on-light/55 uppercase",
        className,
      )}
      {...props}
    />
  );
}

export type SectionHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
};

export function SectionHeading({
  as: Tag = "h2",
  children,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-display text-[clamp(2.5rem,7vw,7rem)] leading-[0.95] font-light tracking-[-0.055em] text-on-light [&_em]:text-accent-gold [&_em]:italic",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export type SectionBodyProps = HTMLAttributes<HTMLParagraphElement>;

export function SectionBody({ className, ...props }: SectionBodyProps) {
  return (
    <p
      className={cn(
        "max-w-[42rem] font-body text-base leading-7 text-on-light/65 md:text-lg",
        className,
      )}
      {...props}
    />
  );
}
