import type { SiteSettingsQueryResult } from "./sanity.types";

export type { VaivaeImage as SanityVaivaeImage } from "./sanity.types";
export type * from "./sanity.types";

export type SanityImage = NonNullable<NonNullable<SiteSettingsQueryResult>["logo"]>;
