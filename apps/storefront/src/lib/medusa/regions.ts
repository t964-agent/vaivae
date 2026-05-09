import "server-only";

import { unstable_cache } from "next/cache";

import { getMedusaClient } from "@/medusa/client";
import type { StoreRegion, StoreRegionCountry } from "@/medusa/types";

const DEFAULT_COUNTRY_CODE = "us";
const DEFAULT_CURRENCY_CODE = "usd";

function normalizeCountryCode(countryCode: string): string {
  return countryCode.trim().toLowerCase();
}

function normalizeCurrencyCode(currencyCode: string | null | undefined): string {
  return currencyCode?.trim().toLowerCase() ?? "";
}

function regionIncludesCountry(region: StoreRegion, countryCode: string): boolean {
  return (
    region.countries?.some(
      (country: StoreRegionCountry) => country.iso_2?.toLowerCase() === countryCode,
    ) ?? false
  );
}

async function fetchRegions(): Promise<StoreRegion[]> {
  const { regions } = await getMedusaClient().store.region.list({
    fields: "id,name,currency_code,*countries",
    limit: 100,
  });

  return regions;
}

const getCachedRegions = unstable_cache(fetchRegions, ["medusa-regions"], {
  revalidate: 60 * 60,
  tags: ["regions"],
});

export async function getRegions(): Promise<StoreRegion[]> {
  return getCachedRegions();
}

export async function getRegionByCountry(countryCode: string): Promise<StoreRegion | null> {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  const regions = await getRegions();

  return regions.find((region) => regionIncludesCountry(region, normalizedCountryCode)) ?? null;
}

export async function getDefaultRegion(): Promise<StoreRegion> {
  const regions = await getRegions();
  const region = regions.find(
    (candidate) =>
      normalizeCurrencyCode(candidate.currency_code) === DEFAULT_CURRENCY_CODE &&
      regionIncludesCountry(candidate, DEFAULT_COUNTRY_CODE),
  );

  if (!region) {
    throw new Error("Medusa default region not found. Expected a US region using USD currency.");
  }

  return region;
}
