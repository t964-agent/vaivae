import { BlockquoteIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const quote = defineType({
  fields: [
    defineField({
      name: "quote",
      rows: 4,
      title: "Quote",
      type: "text",
      validation: (rule) => rule.required().max(280),
    }),
    defineField({ name: "attribution", title: "Attribution", type: "string" }),
    defineField({ name: "source", title: "Source", type: "string" }),
    defineField({
      initialValue: "pull",
      name: "style",
      options: {
        layout: "radio",
        list: [
          { title: "Pull quote", value: "pull" },
          { title: "Press", value: "press" },
        ],
      },
      title: "Style",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  icon: BlockquoteIcon,
  name: "quote",
  preview: {
    select: { attribution: "attribution", quote: "quote" },
    prepare({ attribution, quote }) {
      const title =
        typeof quote === "string" && quote.length > 60 ? `${quote.slice(0, 57)}...` : quote;

      return {
        media: BlockquoteIcon,
        subtitle: attribution || "Quote",
        title: title || "Untitled quote",
      };
    },
  },
  title: "Quote",
  type: "object",
});
