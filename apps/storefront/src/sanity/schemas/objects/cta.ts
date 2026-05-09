import { ArrowRightIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const cta = defineType({
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            typeof value === "string" && value.trim().length > 0 ? true : "A label is required.",
          ),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "link",
      validation: (rule) => rule.required(),
    }),
    defineField({
      initialValue: "primary",
      name: "style",
      options: {
        layout: "radio",
        list: [
          { title: "Primary", value: "primary" },
          { title: "Ghost", value: "ghost" },
          { title: "Underline", value: "underline" },
        ],
      },
      title: "Style",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  icon: ArrowRightIcon,
  name: "cta",
  preview: {
    select: {
      label: "label",
      style: "style",
    },
    prepare({ label, style }) {
      return {
        media: ArrowRightIcon,
        subtitle: style ? `Style: ${style}` : "",
        title: label || "CTA",
      };
    },
  },
  title: "Call to Action",
  type: "object",
});
