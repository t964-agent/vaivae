"use client";

import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const containerVariantClasses = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-screen-2xl",
  fluid: "max-w-none",
} as const;

export type ContainerVariant = keyof typeof containerVariantClasses;

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  /** Render classes onto a child element such as section or main. */
  asChild?: boolean;
  /** Maximum width preset. */
  variant?: ContainerVariant;
};

/** Responsive page-width wrapper for storefront layouts. */
const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { asChild = false, className, variant = "default", ...props },
  ref,
) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn(
        "mx-auto w-full px-6 md:px-8 lg:px-12",
        containerVariantClasses[variant],
        className,
      )}
      data-variant={variant}
      {...props}
    />
  );
});
Container.displayName = "Container";

export { Container };
