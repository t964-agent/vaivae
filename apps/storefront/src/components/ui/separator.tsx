"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";

import { cn } from "@/lib/utils";

export type SeparatorProps = ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;

/** Decorative separator with horizontal default and vertical support. */
const Separator = forwardRef<ComponentRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(
  function Separator({ className, decorative = true, orientation = "horizontal", ...props }, ref) {
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        className={cn(
          "shrink-0 bg-on-light/10 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
          className,
        )}
        decorative={decorative}
        orientation={orientation}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";

export { Separator };
