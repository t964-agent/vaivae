"use client";

import { motion, useReducedMotion } from "motion/react";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const spinnerSizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
} as const;

export type SpinnerSize = keyof typeof spinnerSizeClasses;

export type SpinnerProps = Omit<
  ComponentPropsWithoutRef<typeof motion.svg>,
  "animate" | "children" | "initial" | "transition" | "viewBox"
> & {
  /** Visual size of the loading indicator. */
  size?: SpinnerSize;
  /** Accessible label. Pass an empty string when nearby text already announces loading. */
  label?: string;
};

/** Brand-aware loading indicator for pending UI states. */
const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { className, label = "Loading", size = "md", ...props },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : {
        animate: { rotate: 360 },
        transition: { duration: 0.9, ease: "linear" as const, repeat: Infinity },
      };

  return (
    <motion.svg
      ref={ref}
      aria-hidden={label ? undefined : true}
      aria-label={label || undefined}
      className={cn("shrink-0 text-current", spinnerSizeClasses[size], className)}
      fill="none"
      initial={false}
      role={label ? "status" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...motionProps}
      {...props}
    >
      <circle className="opacity-20" cx="12" cy="12" r="9" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </motion.svg>
  );
});
Spinner.displayName = "Spinner";

export { Spinner };
