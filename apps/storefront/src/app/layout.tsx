import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
