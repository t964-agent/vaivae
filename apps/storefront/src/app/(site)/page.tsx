import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page";
import { getSiteChrome } from "@/components/site/site-chrome-data";
import { jsonLdScriptProps, organizationJsonLd } from "@/lib/seo/jsonld";

const description = "vaïvae is a luxury editorial fashion house building The Living Runway.";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description,
  openGraph: {
    description,
    title: "vaïvae — The Living Runway",
    type: "website",
    url: "/",
  },
  title: "The Living Runway",
  twitter: {
    card: "summary_large_image",
    description,
    title: "vaïvae — The Living Runway",
  },
};

export default async function Page() {
  const { siteSettings } = await getSiteChrome();

  return (
    <>
      <script {...jsonLdScriptProps(organizationJsonLd(siteSettings))} />
      <HomePage />
    </>
  );
}
