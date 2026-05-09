import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { defineEditorialBodyField } from "../pageBuilder/common";

const reservedLegalSlugs = new Set(["studio", "cart", "account", "checkout", "api"]);

function getSlugCurrent(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || !("current" in value)) {
    return undefined;
  }

  const current = value.current;

  return typeof current === "string" ? current.trim() : undefined;
}

export const legal = defineType({
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      options: {
        source: "title",
        isUnique: (slug, context) => context.defaultIsUnique(slug, context),
      },
      title: "Slug",
      type: "slug",
      validation: (rule) =>
        rule.required().custom((value) => {
          const slug = getSlugCurrent(value);

          if (!slug) {
            return "Slug is required.";
          }

          if (reservedLegalSlugs.has(slug)) {
            return `"${slug}" is reserved for an application route.`;
          }

          return true;
        }),
    }),
    defineField({
      name: "kind",
      options: {
        layout: "dropdown",
        list: [
          { title: "Privacy", value: "privacy" },
          { title: "Terms", value: "terms" },
          { title: "Returns", value: "returns" },
          { title: "Shipping", value: "shipping" },
          { title: "Accessibility", value: "accessibility" },
          { title: "Cookies", value: "cookies" },
          { title: "Wholesale", value: "wholesale" },
          { title: "Imprint", value: "imprint" },
        ],
      },
      title: "Kind",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineEditorialBodyField({ name: "body", required: true, title: "Body" }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  icon: DocumentIcon,
  name: "legal",
  preview: {
    select: {
      kind: "kind",
      lastUpdated: "lastUpdated",
      title: "title",
    },
    prepare({ kind, lastUpdated, title }) {
      return {
        media: DocumentIcon,
        subtitle: [kind, lastUpdated].filter(Boolean).join(" · "),
        title: title || "Legal page",
      };
    },
  },
  title: "Legal",
  type: "document",
});
