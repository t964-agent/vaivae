"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";

import { cn } from "@/lib/utils";

export type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

/** Accessible label primitive with restrained vaïvae typography. */
const Label = forwardRef<ComponentRef<typeof LabelPrimitive.Root>, LabelProps>(function Label(
  { className, ...props },
  ref,
) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "font-body text-xs font-medium tracking-[0.12em] text-on-light uppercase peer-disabled:cursor-not-allowed peer-disabled:opacity-45",
        className,
      )}
      {...props}
    />
  );
});
Label.displayName = "Label";

export { Label };
