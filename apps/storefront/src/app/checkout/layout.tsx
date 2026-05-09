import { Fraunces, Inter_Tight } from "next/font/google";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  axes: ["opsz"],
  display: "swap",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  weight: "variable",
});

const interTight = Inter_Tight({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["300", "400", "500", "600"],
});

type CheckoutLayoutProps = {
  children: ReactNode;
};

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <div
      className={`${fraunces.variable} ${interTight.variable} min-h-dvh bg-cream font-body text-on-light antialiased selection:bg-accent-gold selection:text-ink`}
    >
      <a className="skip-link" href="#checkout-main">
        Skip to checkout
      </a>
      <header className="border-b border-on-light/10 bg-cream/95 px-5 py-4 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            aria-label="vaïvae home"
            className="font-display text-2xl leading-none font-light tracking-[-0.06em] italic"
            href={"/" as Route}
          >
            vaïvae
          </Link>
          <div className="flex items-center gap-4 text-xs tracking-[0.12em] text-on-light/55 uppercase">
            <span className="hidden sm:inline">Secure checkout · Stripe</span>
            <Link className="underline-offset-4 hover:underline" href={"/products" as Route}>
              Back to bag
            </Link>
          </div>
        </div>
      </header>
      <main id="checkout-main">{children}</main>
      <Toaster
        closeButton
        position="bottom-center"
        richColors
        theme="light"
        toastOptions={{
          closeButtonAriaLabel: "Dismiss toast",
          classNames: {
            actionButton: "bg-oxblood! text-on-dark!",
            cancelButton: "bg-on-light/10! text-on-light!",
            closeButton: "border-on-light/20! bg-cream! text-on-light!",
            description: "font-body! text-on-light/65!",
            error: "border-accent-red/45!",
            info: "border-ink/20!",
            success: "border-accent-gold/45!",
            title: "font-body! font-medium! tracking-[-0.01em] text-on-light!",
            toast: "border-on-light/10! bg-cream! text-on-light! shadow-fine!",
            warning: "border-accent-orange/45!",
          },
          duration: 4500,
        }}
      />
    </div>
  );
}
