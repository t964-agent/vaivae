import { ComposeSparklesIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const editorialExcerpt = defineType({
  fields: [
    defineField({
      description: "Agent 8 will retarget this to the journal document type.",
      name: "journalEntry",
      options: { disableNew: true },
      title: "Journal entry",
      to: [{ type: "page" }],
      type: "reference",
      validation: (rule) => rule.required(),
      weak: true,
    }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      description:
        "Override the referenced journal title when this excerpt needs a tighter headline.",
      name: "customHeading",
      title: "Custom heading",
      type: "string",
    }),
    defineField({
      description:
        "Optional quote override. Leave empty to use the referenced journal excerpt later.",
      name: "quote",
      rows: 4,
      title: "Quote",
      type: "text",
      validation: (rule) => rule.max(280),
    }),
    defineField({ name: "cta", title: "CTA", type: "cta" }),
  ],
  icon: ComposeSparklesIcon,
  name: "editorialExcerpt",
  preview: {
    select: {
      customHeading: "customHeading",
      journalTitle: "journalEntry.title",
      quote: "quote",
    },
    prepare({ customHeading, journalTitle, quote }) {
      return {
        media: ComposeSparklesIcon,
        subtitle: quote || "Editorial excerpt",
        title: customHeading || journalTitle || "Journal excerpt",
      };
    },
  },
  title: "Editorial excerpt",
  type: "object",
});
