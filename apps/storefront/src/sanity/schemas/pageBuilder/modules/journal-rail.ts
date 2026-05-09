import { BookIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { getParentString } from "../common";

export const journalRail = defineType({
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      initialValue: "recent",
      name: "mode",
      options: {
        layout: "radio",
        list: [
          { title: "Recent", value: "recent" },
          { title: "Curated", value: "curated" },
        ],
      },
      title: "Mode",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      hidden: ({ parent }) => getParentString(parent, "mode") !== "curated",
      name: "entries",
      of: [
        defineArrayMember({
          options: { disableNew: true },
          to: [{ type: "page" }],
          type: "reference",
          weak: true,
        }),
      ],
      title: "Journal entries",
      type: "array",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (getParentString(context.parent, "mode") !== "curated") {
            return true;
          }

          return Array.isArray(value) && value.length > 0 && value.length <= 6
            ? true
            : "Choose 1-6 journal entries.";
        }),
    }),
    defineField({
      hidden: ({ parent }) => getParentString(parent, "mode") !== "recent",
      initialValue: 3,
      name: "limit",
      title: "Number of recent entries",
      type: "number",
      validation: (rule) => rule.min(1).max(6),
    }),
    defineField({ name: "cta", title: "CTA", type: "cta" }),
  ],
  icon: BookIcon,
  name: "journalRail",
  preview: {
    select: { heading: "heading", mode: "mode" },
    prepare({ heading, mode }) {
      return {
        media: BookIcon,
        subtitle: mode ? `Journal rail · ${mode}` : "Journal rail",
        title: heading || "Journal rail",
      };
    },
  },
  title: "Journal rail",
  type: "object",
});
