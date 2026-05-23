import { ImagesIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { hasImageAsset } from "../pageBuilder/common";

const aspectRatioOptions = [
  { title: "16 / 10 landscape", value: "16/10" },
  { title: "4 / 5 portrait", value: "4/5" },
  { title: "3 / 4 portrait", value: "3/4" },
  { title: "1 / 1 square", value: "1/1" },
];

export const collection = defineType({
  fields: [
    defineField({
      group: "content",
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      group: "content",
      name: "slug",
      options: {
        source: "title",
        isUnique: (slug, context) => context.defaultIsUnique(slug, context),
      },
      title: "Slug",
      type: "slug",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "Opening copy for the collection hero.",
      fields: [
        defineField({
          initialValue: "Collection",
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
        }),
        defineField({
          description: "Large hero headline. Falls back to the document title if empty.",
          name: "headline",
          title: "Headline",
          type: "string",
        }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "string",
        }),
      ],
      group: "content",
      initialValue: { eyebrow: "Collection" },
      name: "hero",
      title: "Hero",
      type: "object",
    }),
    defineField({
      description: "The editorial statement block between the hero and runway frames.",
      fields: [
        defineField({
          description: "One paragraph per item. The storefront owns typography and spacing.",
          name: "paragraphs",
          of: [defineArrayMember({ rows: 3, type: "text" })],
          title: "Paragraphs",
          type: "array",
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: "closingQuote",
          title: "Closing quote",
          type: "string",
        }),
        defineField({
          name: "closingLine",
          title: "Closing line",
          type: "string",
        }),
      ],
      group: "content",
      name: "statement",
      title: "Statement",
      type: "object",
    }),
    defineField({
      description:
        "Editorial runway sequence. The storefront keeps the cadence; editors manage image, caption, and crop intent.",
      group: "runway",
      name: "runwayFrames",
      of: [
        defineArrayMember({
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "vaivaeImage",
              validation: (rule) =>
                rule.custom((value) =>
                  hasImageAsset(value) ? true : "A runway image is required.",
                ),
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
            defineField({
              initialValue: "4/5",
              name: "aspectRatio",
              options: {
                layout: "radio",
                list: aspectRatioOptions,
              },
              title: "Aspect ratio",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          name: "runwayFrame",
          preview: {
            select: {
              aspectRatio: "aspectRatio",
              caption: "caption",
              image: "image",
            },
            prepare({ aspectRatio, caption, image }) {
              return {
                media: image || ImagesIcon,
                subtitle: aspectRatio ? `Aspect ${aspectRatio}` : "Runway frame",
                title: caption || "Runway frame",
              };
            },
          },
          title: "Runway frame",
          type: "object",
        }),
      ],
      title: "Runway frames",
      type: "array",
      validation: (rule) => rule.required().min(3).max(20),
    }),
    defineField({
      group: "runway",
      name: "credits",
      title: "Credits",
      type: "string",
    }),
    defineField({ group: "seo", name: "seo", title: "SEO", type: "seo" }),
    defineField({
      group: "seo",
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  groups: [
    { default: true, name: "content", title: "Content" },
    { name: "runway", title: "Runway" },
    { name: "seo", title: "SEO" },
  ],
  icon: ImagesIcon,
  name: "collection",
  orderings: [
    {
      by: [{ direction: "desc", field: "publishedAt" }],
      name: "publishedAtDesc",
      title: "Published newest first",
    },
  ],
  preview: {
    select: {
      firstFrame: "runwayFrames.0.image",
      publishedAt: "publishedAt",
      slug: "slug.current",
      title: "title",
    },
    prepare({ firstFrame, publishedAt, slug, title }) {
      const subtitle = slug
        ? `/collections/${slug}`
        : publishedAt
          ? `Published ${publishedAt}`
          : "Collection";

      return {
        media: firstFrame || ImagesIcon,
        subtitle,
        title: title || "Collection",
      };
    },
  },
  title: "Collection",
  type: "document",
});
