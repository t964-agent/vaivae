import { TextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { defineEditorialBodyField, themeOptions } from "../common";

export const brandPromise = defineType({
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      description: "Large editorial statement. Use literal <em>...</em> tags for emphasized words.",
      name: "statement",
      rows: 4,
      title: "Statement",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineEditorialBodyField({ description: "Optional supporting copy." }),
    defineField({
      initialValue: "narrow",
      name: "width",
      options: {
        layout: "radio",
        list: [
          { title: "Narrow", value: "narrow" },
          { title: "Wide", value: "wide" },
          { title: "Full", value: "full" },
        ],
      },
      title: "Width",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      initialValue: "left",
      name: "alignment",
      options: {
        layout: "radio",
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
        ],
      },
      title: "Alignment",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      initialValue: "dark-text-on-light",
      name: "theme",
      options: { layout: "radio", list: themeOptions },
      title: "Theme",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "cta", title: "CTA", type: "cta" }),
  ],
  icon: TextIcon,
  name: "brandPromise",
  preview: {
    select: { statement: "statement" },
    prepare({ statement }) {
      return {
        media: TextIcon,
        subtitle: "Brand promise",
        title: statement || "Untitled statement",
      };
    },
  },
  title: "Brand promise",
  type: "object",
});
