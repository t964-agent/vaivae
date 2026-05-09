"use client";

import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const stackGapClasses = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
} as const;

const stackAlignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const stackJustifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

export type StackGap = keyof typeof stackGapClasses;
export type StackAlign = keyof typeof stackAlignClasses;
export type StackJustify = keyof typeof stackJustifyClasses;

type SharedStackProps = HTMLAttributes<HTMLDivElement> & {
  /** Tailwind gap step mapped to a static class. */
  gap?: StackGap;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
};

export type StackProps = SharedStackProps;
export type HStackProps = SharedStackProps & {
  /** Allows horizontal stacks to wrap on small viewports. */
  wrap?: boolean;
};

/** Vertical layout primitive with static gap variants. */
const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { align = "stretch", className, gap = 4, justify = "start", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col",
        stackGapClasses[gap],
        stackAlignClasses[align],
        stackJustifyClasses[justify],
        className,
      )}
      {...props}
    />
  );
});
Stack.displayName = "Stack";

/** Horizontal layout primitive with optional wrapping. */
const HStack = forwardRef<HTMLDivElement, HStackProps>(function HStack(
  { align = "center", className, gap = 4, justify = "start", wrap = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-row",
        wrap && "flex-wrap",
        stackGapClasses[gap],
        stackAlignClasses[align],
        stackJustifyClasses[justify],
        className,
      )}
      {...props}
    />
  );
});
HStack.displayName = "HStack";

export { HStack, Stack };
