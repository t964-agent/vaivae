import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { pageBuilderArray, pageBuilderOptions, validateSingleHeroFilm } from "../pageBuilder";

const reservedPageSlugs = new Set([
  "account",
  "api",
  "accessibility",
  "cart",
  "checkout",
  "collections",
  "cookies",
  "home",
  "imprint",
  "journal",
  "login",
  "lookbook",
  "product",
  "products",
  "privacy",
  "register",
  "returns",
  "robots.txt",
  "search",
  "shipping",
  "sitemap.xml",
  "studio",
  "terms",
  "wholesale",
]);

function getSlugCurrent(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || !("current" in value)) {
    return undefined;
  }

  const current = value.current;

  return typeof current === "string" ? current.trim() : undefined;
}

export const page = defineType({
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      options: { source: "title" },
      title: "Slug",
      type: "slug",
      validation: (rule) =>
        rule.required().custom((value) => {
          const slug = getSlugCurrent(value);

          if (!slug) {
            return "Slug is required.";
          }

          if (reservedPageSlugs.has(slug)) {
            return `"${slug}" is reserved for an application route.`;
          }

          return true;
        }),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageBuilder",
      of: pageBuilderArray,
      options: pageBuilderOptions,
      title: "Page builder",
      type: "array",
      validation: (rule) => rule.required().min(1).custom(validateSingleHeroFilm),
    }),
  ],
  icon: DocumentIcon,
  name: "page",
  preview: {
    select: { slug: "slug.current", title: "title" },
    prepare({ slug, title }) {
      return {
        media: DocumentIcon,
        subtitle: slug ? `/${slug}` : "No slug",
        title: title || "Untitled page",
      };
    },
  },
  title: "Page",
  type: "document",
});
