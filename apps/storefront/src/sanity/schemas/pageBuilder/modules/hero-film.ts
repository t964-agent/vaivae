import { PlayIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { defineEditorialBodyField, getParentString, hasImageAsset } from "../common";

export const heroFilm = defineType({
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      description: "Use literal <em>...</em> tags for words the renderer should emphasize.",
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subhead",
      rows: 3,
      title: "Subhead",
      type: "text",
    }),
    defineField({
      fields: [
        defineField({
          initialValue: "mux",
          name: "sourceType",
          options: {
            layout: "radio",
            list: [
              { title: "Mux playback ID", value: "mux" },
              { title: "Direct video URL", value: "directUrl" },
              { title: "Poster image only", value: "image" },
            ],
          },
          title: "Source type",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          hidden: ({ parent }) => getParentString(parent, "sourceType") !== "mux",
          name: "muxPlaybackId",
          title: "Mux playback ID",
          type: "string",
          validation: (rule) =>
            rule.custom((value, context) => {
              if (getParentString(context.parent, "sourceType") !== "mux") {
                return true;
              }

              return typeof value === "string" && value.trim().length > 0
                ? true
                : "Mux playback ID is required.";
            }),
        }),
        defineField({
          hidden: ({ parent }) => getParentString(parent, "sourceType") !== "directUrl",
          name: "directUrl",
          title: "Direct video URL",
          type: "url",
          validation: (rule) =>
            rule.custom((value, context) => {
              if (getParentString(context.parent, "sourceType") !== "directUrl") {
                return true;
              }

              return typeof value === "string" && value.trim().length > 0
                ? true
                : "Direct video URL is required.";
            }),
        }),
        defineField({
          description: "Used for first paint, reduced motion, and image-only heroes.",
          name: "posterImage",
          title: "Poster image",
          type: "vaivaeImage",
          validation: (rule) =>
            rule.custom((value) => (hasImageAsset(value) ? true : "Poster image is required.")),
        }),
      ],
      group: "media",
      name: "media",
      options: { columns: 2 },
      title: "Media",
      type: "object",
      validation: (rule) => rule.required(),
    }),
    defineField({
      group: "content",
      name: "cta",
      title: "Primary CTA",
      type: "cta",
    }),
    defineField({
      initialValue: true,
      name: "scrollIndicator",
      title: "Show scroll indicator",
      type: "boolean",
    }),
    defineField({
      description: "Persistent editorial marquee shown over the cinematic home sequence.",
      fields: [
        defineField({
          initialValue: false,
          name: "enabled",
          title: "Enable marquee",
          type: "boolean",
        }),
        defineField({
          hidden: ({ parent }) => {
            const enabled =
              parent && typeof parent === "object"
                ? Boolean((parent as Record<string, unknown>)["enabled"])
                : false;

            return !enabled;
          },
          name: "text",
          title: "Text",
          type: "string",
          validation: (rule) =>
            rule.custom((value, context) => {
              const enabled =
                context.parent && typeof context.parent === "object"
                  ? Boolean((context.parent as Record<string, unknown>)["enabled"])
                  : false;

              if (!enabled) {
                return true;
              }

              return typeof value === "string" && value.trim().length >= 4
                ? true
                : "Marquee text is required.";
            }),
        }),
        defineField({
          initialValue: "·",
          name: "separator",
          title: "Separator",
          type: "string",
        }),
        defineField({
          description: "Seconds per loop.",
          initialValue: 60,
          name: "speed",
          title: "Speed",
          type: "number",
          validation: (rule) => rule.min(20).max(120),
        }),
        defineField({
          initialValue: "left",
          name: "direction",
          options: {
            layout: "radio",
            list: [
              { title: "Left", value: "left" },
              { title: "Right", value: "right" },
            ],
          },
          title: "Direction",
          type: "string",
        }),
      ],
      group: "sequence",
      name: "marquee",
      options: { collapsible: true, collapsed: true },
      title: "Marquee",
      type: "object",
    }),
    defineField({
      description: "Alternating detail beats for the home scrollytelling sequence.",
      group: "sequence",
      name: "chapters",
      of: [
        defineArrayMember({
          fields: [
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({
              name: "heading",
              title: "Heading",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineEditorialBodyField({ required: true }),
            defineField({ name: "note", rows: 2, title: "Note", type: "text" }),
            defineField({ name: "mediaPoster", title: "Poster image", type: "vaivaeImage" }),
            defineField({
              initialValue: "left",
              name: "align",
              options: {
                layout: "radio",
                list: [
                  { title: "Left", value: "left" },
                  { title: "Right", value: "right" },
                ],
              },
              title: "Text alignment",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          name: "heroFilmChapter",
          preview: {
            select: {
              align: "align",
              heading: "heading",
              media: "mediaPoster",
            },
            prepare({ align, heading, media }) {
              return {
                media,
                subtitle: align ? `Chapter · ${align}` : "Chapter",
                title: heading || "Untitled chapter",
              };
            },
          },
          title: "Chapter",
          type: "object",
        }),
      ],
      title: "Scroll chapters",
      type: "array",
      validation: (rule) => rule.min(2).max(8),
    }),
    defineField({
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "body", rows: 3, title: "Body", type: "text" }),
        defineField({ name: "primaryCta", title: "Primary CTA", type: "cta" }),
        defineField({ name: "secondaryCta", title: "Secondary CTA", type: "cta" }),
      ],
      group: "sequence",
      name: "terminalCta",
      options: { collapsible: true, collapsed: true },
      title: "Terminal CTA stack",
      type: "object",
    }),
  ],
  groups: [
    { default: true, name: "content", title: "Content" },
    { name: "media", title: "Media" },
    { name: "sequence", title: "Home sequence" },
  ],
  icon: PlayIcon,
  name: "heroFilm",
  preview: {
    select: {
      heading: "heading",
      media: "media.posterImage",
      sourceType: "media.sourceType",
    },
    prepare({ heading, media, sourceType }) {
      return {
        media,
        subtitle: sourceType ? `Hero film · ${sourceType}` : "Hero film",
        title: heading || "Untitled hero",
      };
    },
  },
  title: "Hero film",
  type: "object",
});
