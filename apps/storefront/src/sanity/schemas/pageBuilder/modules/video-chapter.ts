import { PlayIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { defineEditorialBodyField, hasImageAsset, themeOptions } from "../common";

export const videoChapter = defineType({
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "muxPlaybackId",
      title: "Mux playback ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "posterImage",
      title: "Poster image",
      type: "vaivaeImage",
      validation: (rule) =>
        rule.custom((value) => (hasImageAsset(value) ? true : "Poster image is required.")),
    }),
    defineEditorialBodyField({ description: "Optional chapter caption." }),
    defineField({
      description:
        "Editorial product hotspots. Commerce data is fetched from Medusa at render time.",
      name: "productHotspots",
      of: [
        defineArrayMember({
          fields: [
            defineField({
              name: "product",
              options: { disableNew: true },
              title: "Product",
              to: [{ type: "product" }],
              type: "reference",
              validation: (rule) => rule.required(),
              weak: true,
            }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({
              description: "Timestamp in seconds from the start of the video.",
              name: "timestampSeconds",
              title: "Timestamp",
              type: "number",
              validation: (rule) => rule.min(0),
            }),
          ],
          name: "productHotspot",
          preview: {
            select: {
              label: "label",
              productTitle: "product.title",
              timestamp: "timestampSeconds",
            },
            prepare({ label, productTitle, timestamp }) {
              return {
                media: PlayIcon,
                subtitle: typeof timestamp === "number" ? `${timestamp}s` : "Product hotspot",
                title: label || productTitle || "Product hotspot",
              };
            },
          },
          title: "Product hotspot",
          type: "object",
        }),
      ],
      title: "Product hotspots",
      type: "array",
      validation: (rule) => rule.max(8),
    }),
    defineField({
      initialValue: "light-text-on-dark",
      name: "theme",
      options: { layout: "radio", list: themeOptions },
      title: "Theme",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  icon: PlayIcon,
  name: "videoChapter",
  preview: {
    select: { heading: "heading", media: "posterImage" },
    prepare({ heading, media }) {
      return {
        media,
        subtitle: "Video chapter",
        title: heading || "Untitled video chapter",
      };
    },
  },
  title: "Video chapter",
  type: "object",
});
