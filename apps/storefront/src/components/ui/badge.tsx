"use client";

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariantClasses = {
  neutral: "border-on-light/15 bg-on-light/5 text-on-light",
  accent: "border-oxblood bg-oxblood text-on-dark",
  warning: "border-accent-gold bg-accent-gold text-ink",
  danger: "border-accent-red bg-accent-red text-on-dark",
  info: "border-ink bg-ink text-on-dark",
} as const;

const badgeSizeClasses = {
  sm: "px-2 py-0.5 text-[0.625rem]",
  md: "px-2.5 py-1 text-xs",
} as const;

export type BadgeVariant = keyof typeof badgeVariantClasses;
export type BadgeSize = keyof typeof badgeSizeClasses;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** Semantic color treatment. */
  variant?: BadgeVariant;
  /** Compact pill sizing. */
  size?: BadgeSize;
};

/** Small status pill for labels, facets, and metadata. */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, size = "md", variant = "neutral", ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border font-body font-medium tracking-[0.12em] uppercase",
        badgeVariantClasses[variant],
        badgeSizeClasses[size],
        className,
      )}
      data-size={size}
      data-variant={variant}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
