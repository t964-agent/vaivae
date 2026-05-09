import { ImageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const vaivaeImage = defineType({
  fields: [
    defineField({
      description: "Required for accessibility and SEO.",
      name: "alt",
      title: "Alt text",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            typeof value === "string" && value.trim().length > 0 ? true : "Alt text is required.",
          ),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
  ],
  icon: ImageIcon,
  name: "vaivaeImage",
  options: {
    hotspot: true,
  },
  preview: {
    select: {
      alt: "alt",
      caption: "caption",
      media: "asset",
    },
    prepare({ alt, caption, media }) {
      return {
        media,
        subtitle: caption,
        title: alt || "Image",
      };
    },
  },
  title: "Image",
  type: "image",
});
