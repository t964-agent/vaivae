import { BookIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { defineEditorialBodyField, hasImageAsset } from "../pageBuilder/common";

export const journal = defineType({
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
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "vaivaeImage",
      validation: (rule) =>
        rule.custom((value) => (hasImageAsset(value) ? true : "Cover image is required.")),
    }),
    defineField({
      name: "excerpt",
      rows: 3,
      title: "Excerpt",
      type: "text",
      validation: (rule) => rule.required().max(280),
    }),
    defineEditorialBodyField({
      images: true,
      name: "body",
      required: true,
      title: "Body",
    }),
    defineField({
      name: "tags",
      of: [defineArrayMember({ type: "string" })],
      title: "Tags",
      type: "array",
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "relatedProducts",
      of: [
        defineArrayMember({
          options: { disableNew: true },
          to: [{ type: "product" }],
          type: "reference",
          weak: true,
        }),
      ],
      title: "Related products",
      type: "array",
      validation: (rule) => rule.max(4).unique(),
    }),
    defineField({
      name: "relatedLookbooks",
      of: [
        defineArrayMember({
          options: { disableNew: true },
          to: [{ type: "lookbook" }],
          type: "reference",
          weak: true,
        }),
      ],
      title: "Related lookbooks",
      type: "array",
      validation: (rule) => rule.max(2).unique(),
    }),
    defineField({
      initialValue: "vaïvae editorial",
      name: "author",
      title: "Author",
      type: "string",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  icon: BookIcon,
  name: "journal",
  preview: {
    select: {
      coverImage: "coverImage",
      title: "title",
    },
    prepare({ coverImage, title }) {
      return {
        media: coverImage || BookIcon,
        title: title || "Journal entry",
      };
    },
  },
  title: "Journal",
  type: "document",
});
