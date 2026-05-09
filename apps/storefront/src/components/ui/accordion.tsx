"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";

import { cn } from "@/lib/utils";

export type AccordionProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>;
export type AccordionItemProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>;
export type AccordionHeaderProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>;
export type AccordionTriggerProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>;
export type AccordionContentProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>;

/** Accordion root with Radix single/multiple selection semantics. */
function Accordion(props: AccordionProps) {
  return <AccordionPrimitive.Root {...props} />;
}
Accordion.displayName = "Accordion";

/** Accordion item wrapper. */
const AccordionItem = forwardRef<ComponentRef<typeof AccordionPrimitive.Item>, AccordionItemProps>(
  function AccordionItem({ className, ...props }, ref) {
    return (
      <AccordionPrimitive.Item
        ref={ref}
        className={cn("border-b border-on-light/10", className)}
        {...props}
      />
    );
  },
);
AccordionItem.displayName = "AccordionItem";

/** Header element that contains the trigger button. */
const AccordionHeader = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Header>,
  AccordionHeaderProps
>(function AccordionHeader({ className, ...props }, ref) {
  return <AccordionPrimitive.Header ref={ref} className={cn("flex", className)} {...props} />;
});
AccordionHeader.displayName = "AccordionHeader";

/** Toggle control with reduced-motion-safe chevron rotation. */
const AccordionTrigger = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger({ children, className, ...props }, ref) {
  return (
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex flex-1 items-center justify-between gap-4 py-5 text-left text-sm font-medium tracking-[0.04em] text-on-light transition-colors hover:underline hover:decoration-accent-red hover:underline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden
        className="size-4 shrink-0 text-on-light/45 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
      />
    </AccordionPrimitive.Trigger>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

/** Collapsible content with height transition disabled for reduced motion. */
const AccordionContent = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(function AccordionContent({ children, className, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "grid overflow-hidden text-sm leading-6 text-on-light/65 data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr] motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <div className="min-h-0 pb-5">{children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger };
