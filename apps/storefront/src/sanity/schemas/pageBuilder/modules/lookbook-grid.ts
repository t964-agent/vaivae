import { ImagesIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const lookbookGrid = defineType({
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      description: "Agent 8 will retarget this to the lookbook document type.",
      name: "lookbookEntry",
      options: { disableNew: true },
      title: "Lookbook",
      to: [{ type: "page" }],
      type: "reference",
      weak: true,
    }),
    defineField({
      description:
        "Curated visual override for this grid. Agent 8 will add full lookbook editorial fields.",
      name: "images",
      of: [defineArrayMember({ type: "vaivaeImage" })],
      options: { layout: "grid" },
      title: "Images",
      type: "array",
      validation: (rule) => rule.min(2).max(8),
    }),
    defineField({
      initialValue: "grid",
      name: "layout",
      options: {
        layout: "radio",
        list: [
          { title: "Grid", value: "grid" },
          { title: "Scroll", value: "scroll" },
        ],
      },
      title: "Layout",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "cta", title: "CTA", type: "cta" }),
  ],
  icon: ImagesIcon,
  name: "lookbookGrid",
  preview: {
    select: { heading: "heading", image: "images.0", lookbookTitle: "lookbookEntry.title" },
    prepare({ heading, image, lookbookTitle }) {
      return {
        media: image || ImagesIcon,
        subtitle: lookbookTitle || "Lookbook grid",
        title: heading || "Lookbook grid",
      };
    },
  },
  title: "Lookbook grid",
  type: "object",
});
