import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { homePageBuilderArray, pageBuilderOptions, validateSingleHeroFilm } from "../pageBuilder";

export const homePage = defineType({
  fields: [
    defineField({
      initialValue: "Home",
      name: "title",
      readOnly: true,
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageBuilder",
      of: homePageBuilderArray,
      options: pageBuilderOptions,
      title: "Page builder",
      type: "array",
      validation: (rule) => rule.required().min(1).custom(validateSingleHeroFilm),
    }),
  ],
  icon: HomeIcon,
  name: "homePage",
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return {
        media: HomeIcon,
        subtitle: "Singleton",
        title: title || "Home",
      };
    },
  },
  title: "Home page",
  type: "document",
});
