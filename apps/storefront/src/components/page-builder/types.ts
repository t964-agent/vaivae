import type { StoreProduct } from "@/medusa/types";
import type { PageBySlugQueryResult } from "@/sanity/sanity.types";

export type PageBuilderModule = NonNullable<
  NonNullable<PageBySlugQueryResult>["pageBuilder"]
>[number];

export type PageBuilderModuleOf<TType extends PageBuilderModule["_type"]> = Extract<
  PageBuilderModule,
  { _type: TType }
>;

export type PageBuilderContext = {
  medusaProducts?: Map<string, StoreProduct>;
};
