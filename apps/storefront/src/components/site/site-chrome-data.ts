import { cache } from "react";

import { globalQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { GlobalQueryResult } from "@/sanity/types";

const SITE_CHROME_TAGS = ["site-settings", "navigation", "footer"] as const;
const EMPTY_SITE_CHROME = {
  footer: null,
  navigation: null,
  siteSettings: null,
} satisfies GlobalQueryResult;

export const getSiteChrome = cache(async () => {
  try {
    const { data } = await sanityFetch({
      query: globalQuery,
      tags: [...SITE_CHROME_TAGS],
    });

    return data;
  } catch {
    return EMPTY_SITE_CHROME;
  }
});

export { SITE_CHROME_TAGS };
