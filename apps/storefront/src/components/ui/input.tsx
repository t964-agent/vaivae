"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Applies error border and aria-invalid when true. */
  error?: boolean;
};

/** Brand-styled input with a 44px touch target and accessible focus state. */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error = false, type = "text", "aria-invalid": ariaInvalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      className={cn(
        "h-11 w-full rounded-none border bg-cream px-4 py-2 font-body text-sm text-on-light shadow-none transition-colors placeholder:text-on-light/40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold disabled:cursor-not-allowed disabled:opacity-45",
        error
          ? "border-accent-red"
          : "border-on-light/20 hover:border-on-light/35 focus:border-on-light/40",
        className,
      )}
      data-invalid={error ? "true" : undefined}
      type={type}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
