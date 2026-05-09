"use client";

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Subtle placeholder block for loading regions. */
const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { className, "aria-hidden": ariaHidden, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden={ariaHidden ?? true}
      className={cn("h-4 w-full animate-pulse rounded-sm bg-on-light/10", className)}
      {...props}
    />
  );
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
