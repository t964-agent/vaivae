import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      rows: 3,
      title: "Description",
      type: "text",
    }),
  ],
  icon: CogIcon,
  name: "siteSettings",
  preview: {
    select: {
      description: "description",
      title: "title",
    },
  },
  title: "Site Settings",
  type: "document",
});
