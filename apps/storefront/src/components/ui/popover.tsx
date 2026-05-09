"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";

import { cn } from "@/lib/utils";

export type PopoverProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>;
export type PopoverTriggerProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>;
export type PopoverAnchorProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>;
export type PopoverPortalProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>;
export type PopoverContentProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>;
export type PopoverCloseProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>;
export type PopoverArrowProps = ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>;

/** Interactive floating panel root. */
function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root {...props} />;
}
Popover.displayName = "Popover";

/** Popover trigger element. */
const PopoverTrigger = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Trigger>,
  PopoverTriggerProps
>(function PopoverTrigger(props, ref) {
  return <PopoverPrimitive.Trigger ref={ref} {...props} />;
});
PopoverTrigger.displayName = "PopoverTrigger";

/** Optional positioning anchor. */
const PopoverAnchor = forwardRef<ComponentRef<typeof PopoverPrimitive.Anchor>, PopoverAnchorProps>(
  function PopoverAnchor(props, ref) {
    return <PopoverPrimitive.Anchor ref={ref} {...props} />;
  },
);
PopoverAnchor.displayName = "PopoverAnchor";

/** Portal target for popover content. */
function PopoverPortal(props: PopoverPortalProps) {
  return <PopoverPrimitive.Portal {...props} />;
}
PopoverPortal.displayName = "PopoverPortal";

/** Brand-styled popover content with Radix collision handling. */
const PopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(function PopoverContent({ align = "center", className, sideOffset = 8, ...props }, ref) {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        className={cn(
          "z-50 w-72 border border-on-light/10 bg-cream p-4 text-on-light shadow-fine outline-none",
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPortal>
  );
});
PopoverContent.displayName = "PopoverContent";

/** Popover close control. */
const PopoverClose = forwardRef<ComponentRef<typeof PopoverPrimitive.Close>, PopoverCloseProps>(
  function PopoverClose(props, ref) {
    return <PopoverPrimitive.Close ref={ref} {...props} />;
  },
);
PopoverClose.displayName = "PopoverClose";

/** Optional popover arrow. */
const PopoverArrow = forwardRef<ComponentRef<typeof PopoverPrimitive.Arrow>, PopoverArrowProps>(
  function PopoverArrow({ className, ...props }, ref) {
    return <PopoverPrimitive.Arrow ref={ref} className={cn("fill-cream", className)} {...props} />;
  },
);
PopoverArrow.displayName = "PopoverArrow";

export {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
};
