import { LaunchIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { getParentString, hasImageAsset, themeOptions } from "../common";

export const ctaSection = defineType({
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "body", rows: 3, title: "Body", type: "text" }),
    defineField({
      name: "primaryCta",
      title: "Primary CTA",
      type: "cta",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "cta" }),
    defineField({
      fields: [
        defineField({
          initialValue: "solidColor",
          name: "type",
          options: {
            layout: "radio",
            list: [
              { title: "Solid color", value: "solidColor" },
              { title: "Image", value: "image" },
            ],
          },
          title: "Background type",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          hidden: ({ parent }) => getParentString(parent, "type") === "image",
          initialValue: "cream",
          name: "solidColor",
          options: {
            layout: "dropdown",
            list: [
              { title: "Cream", value: "cream" },
              { title: "Oxblood", value: "oxblood" },
              { title: "Ink", value: "ink" },
              { title: "Accent red", value: "accent-red" },
              { title: "Accent orange", value: "accent-orange" },
              { title: "Accent gold", value: "accent-gold" },
            ],
          },
          title: "Solid color",
          type: "string",
        }),
        defineField({
          hidden: ({ parent }) => getParentString(parent, "type") !== "image",
          name: "image",
          title: "Image",
          type: "vaivaeImage",
          validation: (rule) =>
            rule.custom((value, context) => {
              if (getParentString(context.parent, "type") !== "image") {
                return true;
              }

              return hasImageAsset(value) ? true : "Background image is required.";
            }),
        }),
      ],
      name: "background",
      title: "Background",
      type: "object",
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
  ],
  icon: LaunchIcon,
  name: "ctaSection",
  preview: {
    select: { heading: "heading" },
    prepare({ heading }) {
      return {
        media: LaunchIcon,
        subtitle: "CTA section",
        title: heading || "Untitled CTA",
      };
    },
  },
  title: "CTA section",
  type: "object",
});
