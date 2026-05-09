import { PackageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import {
  capsulePageBuilderArray,
  capsulePageBuilderOptions,
  validateSingleHeroFilm,
} from "../pageBuilder";
import { defineEditorialBodyField, hasImageAsset } from "../pageBuilder/common";

export const capsule = defineType({
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
    defineEditorialBodyField({
      description: "Capsule story, context, or seasonal note.",
      name: "description",
      title: "Description",
    }),
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
    defineField({
      name: "pageBuilder",
      of: capsulePageBuilderArray,
      options: capsulePageBuilderOptions,
      title: "Page builder",
      type: "array",
      validation: (rule) => rule.custom(validateSingleHeroFilm),
    }),
    defineField({
      description:
        "Manually curated product order for this capsule. Commerce facts stay in Medusa.",
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
      validation: (rule) => rule.max(24).unique(),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
    defineField({ name: "releaseDate", title: "Release date", type: "datetime" }),
    defineField({ name: "endDate", title: "End date", type: "datetime" }),
  ],
  icon: PackageIcon,
  name: "capsule",
  preview: {
    select: {
      coverImage: "coverImage",
      releaseDate: "releaseDate",
      title: "title",
    },
    prepare({ coverImage, releaseDate, title }) {
      return {
        media: coverImage || PackageIcon,
        subtitle: releaseDate,
        title: title || "Capsule",
      };
    },
  },
  title: "Capsule",
  type: "document",
});
