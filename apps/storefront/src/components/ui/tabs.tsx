"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";

import { cn } from "@/lib/utils";

export type TabsProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;
export type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;
export type TabsTriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;
export type TabsContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

/** Tabs root with Radix keyboard semantics. */
function Tabs(props: TabsProps) {
  return <TabsPrimitive.Root {...props} />;
}
Tabs.displayName = "Tabs";

/** Tab trigger row. */
const TabsList = forwardRef<ComponentRef<typeof TabsPrimitive.List>, TabsListProps>(
  function TabsList({ className, ...props }, ref) {
    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn("inline-flex border-b border-on-light/10", className)}
        {...props}
      />
    );
  },
);
TabsList.displayName = "TabsList";

/** Individual tab with reduced-motion-safe underline transition. */
const TabsTrigger = forwardRef<ComponentRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  function TabsTrigger({ children, className, ...props }, ref) {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          "group relative inline-flex h-11 items-center justify-center px-4 text-sm font-medium text-on-light/55 transition-colors hover:text-on-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold data-[state=active]:text-on-light",
          className,
        )}
        {...props}
      >
        {children}
        <span className="pointer-events-none absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-accent-red transition-transform duration-200 group-data-[state=active]:scale-x-100 motion-reduce:transition-none" />
      </TabsPrimitive.Trigger>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

/** Tab panel content. */
const TabsContent = forwardRef<ComponentRef<typeof TabsPrimitive.Content>, TabsContentProps>(
  function TabsContent({ className, ...props }, ref) {
    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn(
          "mt-6 outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
