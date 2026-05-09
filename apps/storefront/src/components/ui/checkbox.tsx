"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

/**
 * Checkbox primitive.
 *
 * Usage: pair with `<Label htmlFor="terms">Accept terms</Label>` and set `id="terms"`
 * on the Checkbox so the visible label controls the input.
 */
const Checkbox = forwardRef<ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-on-light/30 bg-cream text-on-dark shadow-none transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold disabled:cursor-not-allowed disabled:opacity-45 data-[state=checked]:border-oxblood data-[state=checked]:bg-oxblood data-[state=indeterminate]:border-oxblood data-[state=indeterminate]:bg-oxblood",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check aria-hidden className="size-3.5" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
