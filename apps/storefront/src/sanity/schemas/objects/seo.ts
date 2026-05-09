import { SearchIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const seo = defineType({
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.max(60).warning("SEO titles should stay under 60 characters."),
    }),
    defineField({
      name: "description",
      rows: 3,
      title: "Description",
      type: "text",
      validation: (rule) =>
        rule.max(160).warning("SEO descriptions should stay under 160 characters."),
    }),
    defineField({
      initialValue: false,
      name: "noindex",
      title: "No index",
      type: "boolean",
    }),
    defineField({
      description: "Fallback social image for Open Graph and sharing surfaces.",
      name: "ogImage",
      title: "Open Graph image",
      type: "vaivaeImage",
    }),
    defineField({
      name: "keywords",
      of: [defineArrayMember({ type: "string" })],
      title: "Keywords",
      type: "array",
    }),
  ],
  icon: SearchIcon,
  name: "seo",
  preview: {
    select: {
      description: "description",
      image: "ogImage",
      title: "title",
    },
    prepare({ description, image, title }) {
      return {
        media: image ?? SearchIcon,
        subtitle: description,
        title: title || "SEO",
      };
    },
  },
  title: "SEO",
  type: "object",
});
