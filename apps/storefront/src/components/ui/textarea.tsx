"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Applies error border and aria-invalid when true. */
  error?: boolean;
};

/** Brand-styled multiline input mirroring Input's focus and error treatment. */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error = false, "aria-invalid": ariaInvalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      className={cn(
        "min-h-28 w-full resize-y rounded-none border bg-cream px-4 py-3 font-body text-sm text-on-light shadow-none transition-colors placeholder:text-on-light/40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold disabled:cursor-not-allowed disabled:opacity-45",
        error
          ? "border-accent-red"
          : "border-on-light/20 hover:border-on-light/35 focus:border-on-light/40",
        className,
      )}
      data-invalid={error ? "true" : undefined}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
