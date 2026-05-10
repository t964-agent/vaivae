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
  icons: {
    apple: [{ sizes: "180x180", url: "/apple-touch-icon.png" }],
    icon: [
      { sizes: "16x16", type: "image/png", url: "/favicon-16x16.png" },
      { sizes: "32x32", type: "image/png", url: "/favicon-32x32.png" },
      { sizes: "any", url: "/favicon.ico" },
    ],
  },
  manifest: "/manifest.webmanifest",
  metadataBase,
  openGraph: {
    description: "vaïvae is a luxury editorial fashion house building The Living Runway.",
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
  twitter: {
    card: "summary_large_image",
    description: "vaïvae is a luxury editorial fashion house building The Living Runway.",
    title: "vaïvae — The Living Runway",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <link href="https://cdn.sanity.io" rel="preconnect" />
        <link href="https://image.mux.com" rel="preconnect" />
        <link href="https://stream.mux.com" rel="preconnect" />
        {children}
      </body>
    </html>
  );
}
