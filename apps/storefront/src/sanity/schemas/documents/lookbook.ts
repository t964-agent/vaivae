import { ImagesIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { defineEditorialBodyField, hasImageAsset } from "../pageBuilder/common";

export const lookbook = defineType({
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
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "vaivaeImage",
      validation: (rule) =>
        rule.custom((value) => (hasImageAsset(value) ? true : "Cover image is required.")),
    }),
    defineField({
      fields: [
        defineField({
          name: "muxAssetId",
          title: "Mux asset ID",
          type: "string",
        }),
      ],
      name: "coverVideo",
      title: "Cover video",
      type: "object",
    }),
    defineEditorialBodyField({
      description: "Short visual story or context for the lookbook.",
      name: "description",
      title: "Description",
    }),
    defineField({
      name: "looks",
      of: [
        defineArrayMember({
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "vaivaeImage",
              validation: (rule) =>
                rule.custom((value) => (hasImageAsset(value) ? true : "A look image is required.")),
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
            defineField({
              name: "products",
              of: [
                defineArrayMember({
                  options: { disableNew: true },
                  to: [{ type: "product" }],
                  type: "reference",
                  weak: true,
                }),
              ],
              title: "Products",
              type: "array",
              validation: (rule) => rule.max(4).unique(),
            }),
          ],
          name: "look",
          preview: {
            select: {
              caption: "caption",
              image: "image",
              products: "products",
            },
            prepare({ caption, image, products }) {
              const count = Array.isArray(products) ? products.length : 0;

              return {
                media: image,
                subtitle: count ? `${count} product${count === 1 ? "" : "s"}` : "Look",
                title: caption || "Look",
              };
            },
          },
          title: "Look",
          type: "object",
        }),
      ],
      title: "Looks",
      type: "array",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  icon: ImagesIcon,
  name: "lookbook",
  preview: {
    select: {
      coverImage: "coverImage",
      title: "title",
    },
    prepare({ coverImage, title }) {
      return {
        media: coverImage || ImagesIcon,
        title: title || "Lookbook",
      };
    },
  },
  title: "Lookbook",
  type: "document",
});
