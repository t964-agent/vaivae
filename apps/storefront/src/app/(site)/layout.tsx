import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { draftMode, headers } from "next/headers";
import Script from "next/script";
import { VisualEditing } from "next-sanity/visual-editing";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
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

let hasWarnedMissingTermlyUuid = false;

function isVercelAnalyticsEnabled(): boolean {
  return process.env["NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED"] === "true";
}

async function getInitialCart(): Promise<StoreCart | null> {
  try {
    return await getCart();
  } catch {
    return null;
  }
}

function getTermlyWebsiteUuid(): string | undefined {
  const websiteUuid = process.env["NEXT_PUBLIC_TERMLY_WEBSITE_UUID"]?.trim();

  if (!websiteUuid && process.env["NODE_ENV"] === "development" && !hasWarnedMissingTermlyUuid) {
    hasWarnedMissingTermlyUuid = true;
    console.warn("Termly CMP skipped: NEXT_PUBLIC_TERMLY_WEBSITE_UUID is not set.");
  }

  return websiteUuid || undefined;
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const [cart, draft, requestHeaders] = await Promise.all([
    getInitialCart(),
    draftMode(),
    headers(),
  ]);
  const cartItemCount = getCartItemCount(cart);
  const termlyWebsiteUuid = getTermlyWebsiteUuid();
  const vercelAnalyticsEnabled = isVercelAnalyticsEnabled();
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  const isHome = requestHeaders.get("x-pathname") === "/";

  return (
    <div
      className={`${fraunces.variable} ${interTight.variable} min-h-dvh bg-cream font-body text-on-light antialiased selection:bg-accent-gold selection:text-ink`}
    >
      {termlyWebsiteUuid ? (
        <Script
          nonce={nonce}
          src={`https://app.termly.io/embed.min.js?autoBlock=on&websiteUUID=${termlyWebsiteUuid}`}
          strategy="afterInteractive"
        />
      ) : null}
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AnalyticsProvider nonce={nonce}>
        <CartUiProvider>
          <NuqsAdapter>
            <SiteHeader cartItemCount={cartItemCount} />
            <main className="min-h-dvh" id="main-content">
              {children}
            </main>
            {isHome ? null : <SiteFooter />}
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
      </AnalyticsProvider>
      {/* Public storefront only; /studio uses the isolated (studio) layout without SanityLive. */}
      <SanityLive />
      {draft.isEnabled ? <VisualEditing /> : null}
      <SpeedInsights />
      {vercelAnalyticsEnabled ? <Analytics /> : null}
    </div>
  );
}
