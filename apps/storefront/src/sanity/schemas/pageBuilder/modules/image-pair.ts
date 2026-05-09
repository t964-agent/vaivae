import { SplitVerticalIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { hasImageAsset, themeOptions } from "../common";

export const imagePair = defineType({
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      name: "leftImage",
      title: "Left image",
      type: "vaivaeImage",
      validation: (rule) =>
        rule.custom((value) => (hasImageAsset(value) ? true : "Left image is required.")),
    }),
    defineField({ name: "leftCaption", title: "Left caption", type: "string" }),
    defineField({
      name: "rightImage",
      title: "Right image",
      type: "vaivaeImage",
      validation: (rule) =>
        rule.custom((value) => (hasImageAsset(value) ? true : "Right image is required.")),
    }),
    defineField({ name: "rightCaption", title: "Right caption", type: "string" }),
    defineField({
      initialValue: "balanced",
      name: "layout",
      options: {
        layout: "radio",
        list: [
          { title: "Balanced", value: "balanced" },
          { title: "Left emphasis", value: "left-emphasis" },
          { title: "Right emphasis", value: "right-emphasis" },
        ],
      },
      title: "Layout",
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
  icon: SplitVerticalIcon,
  name: "imagePair",
  preview: {
    select: { heading: "heading", media: "leftImage" },
    prepare({ heading, media }) {
      return {
        media,
        subtitle: "Image pair",
        title: heading || "Image pair",
      };
    },
  },
  title: "Image pair",
  type: "object",
});
