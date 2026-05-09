"use client";

import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes, type MouseEventHandler } from "react";

import { cn } from "@/lib/utils";

import { Spinner } from "./spinner";

const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border font-body font-medium tracking-[0.02em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold disabled:pointer-events-none disabled:opacity-45 data-[loading=true]:cursor-wait data-[loading=true]:opacity-75";

const buttonVariantClasses = {
  "on-light": {
    primary: "border-accent-red bg-accent-red text-on-dark hover:bg-accent-red/90",
    ghost:
      "border-on-light/20 bg-transparent text-on-light hover:border-on-light/35 hover:bg-on-light/5",
    underline:
      "rounded-none border-x-0 border-t-0 border-b-on-light/20 bg-transparent px-0 text-on-light hover:border-b-accent-red",
    destructive: "border-accent-red bg-accent-red text-on-dark hover:bg-accent-red/90",
  },
  "on-dark": {
    primary: "border-cream bg-cream text-oxblood hover:bg-on-dark",
    ghost:
      "border-on-dark/25 bg-transparent text-on-dark hover:border-on-dark/45 hover:bg-on-dark/10",
    underline:
      "rounded-none border-x-0 border-t-0 border-b-on-dark/25 bg-transparent px-0 text-on-dark hover:border-b-accent-gold",
    destructive: "border-accent-red bg-accent-red text-on-dark hover:bg-accent-red/90",
  },
} as const;

const buttonSizeClasses = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "size-9 p-0",
} as const;

export type ButtonTone = keyof typeof buttonVariantClasses;
export type ButtonVariant = keyof (typeof buttonVariantClasses)["on-light"];
export type ButtonSize = keyof typeof buttonSizeClasses;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Render the button styling onto a child element, such as a Next Link. */
  asChild?: boolean;
  /** Shows a spinner, disables interaction, and swaps out the visible label. */
  loading?: boolean;
  /** Visual treatment for the current context. */
  variant?: ButtonVariant;
  /** Touch-target aware sizing. */
  size?: ButtonSize;
  /** Adjusts foreground/background contrast for light or dark surfaces. */
  tone?: ButtonTone;
};

/** Composable action primitive with vaïvae brand variants and Slot support. */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    asChild = false,
    children,
    className,
    disabled = false,
    loading = false,
    onClick,
    size = "md",
    tone = "on-light",
    type,
    variant = "primary",
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  return (
    <Comp
      ref={ref}
      aria-busy={loading || undefined}
      aria-disabled={asChild && isDisabled ? true : undefined}
      className={cn(
        buttonBaseClasses,
        buttonVariantClasses[tone][variant],
        buttonSizeClasses[size],
        className,
      )}
      data-loading={loading ? "true" : undefined}
      data-size={size}
      data-tone={tone}
      data-variant={variant}
      disabled={asChild ? undefined : isDisabled}
      onClick={handleClick}
      type={asChild ? undefined : (type ?? "button")}
      {...props}
    >
      {loading ? <Spinner label="Loading" size="sm" /> : children}
    </Comp>
  );
});
Button.displayName = "Button";

export { Button };
