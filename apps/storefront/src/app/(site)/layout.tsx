import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Fraunces, Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { CartUiProvider } from "@/components/providers/cart-ui-provider";
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

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div
      className={`${fraunces.variable} ${interTight.variable} min-h-dvh bg-cream font-body text-on-light antialiased selection:bg-accent-gold selection:text-ink`}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {/* Public storefront only; /studio uses the isolated (studio) layout without SanityLive. */}
      <SanityLive />
      <CartUiProvider>
        {children}
        <Toaster closeButton position="bottom-center" richColors />
      </CartUiProvider>
      {/* PostHog will be wired in Agent 24 once Termly consent gating is in place per ADR-015 / §8.7.5. */}
      <SpeedInsights />
      <Analytics />
    </div>
  );
}
