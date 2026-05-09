import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartUiProvider } from "@/components/providers/cart-ui-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getCartItemCount } from "@/lib/cart-utils";
import { getCart } from "@/medusa/cart";
import type { StoreCart } from "@/medusa/types";
import { SanityLive } from "@/sanity/live";

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

type SiteLayoutProps = {
  children: ReactNode;
};

async function getInitialCart(): Promise<StoreCart | null> {
  try {
    return await getCart();
  } catch {
    return null;
  }
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const [cart, draft] = await Promise.all([getInitialCart(), draftMode()]);
  const cartItemCount = getCartItemCount(cart);

  return (
    <div
      className={`${fraunces.variable} ${interTight.variable} min-h-dvh bg-cream font-body text-on-light antialiased selection:bg-accent-gold selection:text-ink`}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <CartUiProvider>
        <NuqsAdapter>
          <SiteHeader cartItemCount={cartItemCount} />
          <main className="min-h-dvh" id="main-content">
            {children}
          </main>
          <SiteFooter />
        </NuqsAdapter>
        <CartDrawer initialCart={cart} key={cart?.id ?? "empty-cart"} />
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
      </CartUiProvider>
      {/* Public storefront only; /studio uses the isolated (studio) layout without SanityLive. */}
      <SanityLive />
      {draft.isEnabled ? <VisualEditing /> : null}
      {/* PostHog will be wired in Agent 24 once Termly consent gating is in place per ADR-015 / §8.7.5. */}
      <SpeedInsights />
      <Analytics />
    </div>
  );
}
