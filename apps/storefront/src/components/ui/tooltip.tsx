"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";

import { cn } from "@/lib/utils";

export type TooltipProviderProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>;
export type TooltipProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;
export type TooltipTriggerProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>;
export type TooltipContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

/** Provider for tooltip delay and skip-delay behavior. */
function TooltipProvider({ delayDuration = 250, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}
TooltipProvider.displayName = "TooltipProvider";

/** Non-interactive tooltip root. */
function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive.Root {...props} />;
}
Tooltip.displayName = "Tooltip";

/** Tooltip trigger element. */
const TooltipTrigger = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Trigger>,
  TooltipTriggerProps
>(function TooltipTrigger(props, ref) {
  return <TooltipPrimitive.Trigger ref={ref} {...props} />;
});
TooltipTrigger.displayName = "TooltipTrigger";

/** Small dark tooltip bubble with arrow. */
const TooltipContent = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(function TooltipContent({ children, className, sideOffset = 6, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        className={cn(
          "z-50 rounded-full bg-ink px-3 py-1.5 text-xs text-on-dark shadow-fine outline-none",
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-ink" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
