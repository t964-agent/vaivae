import type { Route } from "next";
import Link from "next/link";

import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { cn } from "@/lib/utils";
import type { GlobalQueryResult } from "@/sanity/types";

import { getSiteChrome } from "./site-chrome-data";
import { SiteHeaderClient } from "./site-header-client";

type SiteSettings = GlobalQueryResult["siteSettings"];

type SiteHeaderProps = {
  cartItemCount?: number | undefined;
};

function BrandMark({ siteSettings }: { siteSettings: SiteSettings }) {
  const siteName = siteSettings?.siteName?.trim() || "vaïvae";
  const logo = siteSettings?.logo;

  return (
    <Link
      aria-label={`${siteName} home`}
      className={cn(
        "inline-flex items-center font-display text-2xl leading-none font-light tracking-[-0.04em] italic focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
      )}
      href={"/" as Route}
    >
      {logo?.asset ? (
        <VaivaeImage
          className="max-h-9 w-auto object-contain"
          height={36}
          image={logo}
          priority
          sizes="112px"
          width={112}
        />
      ) : (
        <span>{siteName}</span>
      )}
    </Link>
  );
}

export async function SiteHeader({ cartItemCount = 0 }: SiteHeaderProps) {
  const data = await getSiteChrome();

  return (
    <SiteHeaderClient
      brandMark={<BrandMark siteSettings={data.siteSettings} />}
      cartItemCount={cartItemCount}
      key={cartItemCount}
      navigation={data.navigation}
    />
  );
}
