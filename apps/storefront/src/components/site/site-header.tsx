import type { Route } from "next";
import Link from "next/link";

import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { cn } from "@/lib/utils";
import { getCurrentCustomer } from "@/medusa/customer";
import type { GlobalQueryResult } from "@/sanity/types";

import { getSiteChrome } from "./site-chrome-data";
import { SiteHeaderClient } from "./site-header-client";
import type { UserMenuCustomer } from "./user-menu";

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

async function getHeaderCustomer(): Promise<UserMenuCustomer | null> {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return null;
    }

    return {
      firstName: customer.first_name ?? null,
      lastName: customer.last_name ?? null,
    };
  } catch {
    return null;
  }
}

export async function SiteHeader({ cartItemCount = 0 }: SiteHeaderProps) {
  const [data, customer] = await Promise.all([getSiteChrome(), getHeaderCustomer()]);

  return (
    <SiteHeaderClient
      brandMark={<BrandMark siteSettings={data.siteSettings} />}
      cartItemCount={cartItemCount}
      customer={customer}
      key={cartItemCount}
      navigation={data.navigation}
    />
  );
}
