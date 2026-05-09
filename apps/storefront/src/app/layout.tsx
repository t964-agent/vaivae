import type { Metadata } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "@/styles/globals.css";

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

const metadataBase = new URL(process.env["NEXT_PUBLIC_BASE_URL"] ?? "https://vaivae.com");

export const metadata: Metadata = {
  applicationName: "vaïvae",
  alternates: {
    canonical: "/",
  },
  description: "vaïvae is a luxury editorial fashion house building The Living Runway.",
  metadataBase,
  openGraph: {
    description: "A cinematic editorial fashion storefront is coming soon.",
    locale: "en_US",
    siteName: "vaïvae",
    title: "vaïvae — The Living Runway",
    type: "website",
    url: "/",
  },
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: "vaïvae — The Living Runway",
    template: "%s — vaïvae",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={`${fraunces.variable} ${interTight.variable}`} lang="en">
      <body className="min-h-dvh bg-cream font-body text-on-light antialiased selection:bg-accent-gold selection:text-ink">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <Toaster closeButton position="bottom-center" richColors />
        {/* PostHog will be wired in Agent 24 once Termly consent gating is in place per ADR-015 / §8.7.5. */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
