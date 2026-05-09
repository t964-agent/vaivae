import { StackCompactIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

function isRequiredString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export const footer = defineType({
  fields: [
    defineField({
      group: "columns",
      name: "columns",
      of: [
        defineArrayMember({
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) =>
                rule
                  .required()
                  .custom((value) =>
                    isRequiredString(value) ? true : "Column title is required.",
                  ),
            }),
            defineField({
              name: "links",
              of: [defineArrayMember({ type: "link" })],
              title: "Links",
              type: "array",
              validation: (rule) => rule.required().min(1).max(8),
            }),
          ],
          name: "footerColumn",
          preview: {
            select: {
              title: "title",
            },
            prepare({ title }) {
              return {
                media: StackCompactIcon,
                title: title || "Footer column",
              };
            },
          },
          title: "Footer column",
          type: "object",
        }),
      ],
      title: "Columns",
      type: "array",
      validation: (rule) => rule.required().min(1).max(4),
    }),
    defineField({
      group: "newsletter",
      initialValue: true,
      name: "newsletterEnabled",
      title: "Enable newsletter",
      type: "boolean",
    }),
    defineField({
      group: "newsletter",
      initialValue: "Stay in the runway",
      name: "newsletterHeading",
      title: "Newsletter heading",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => (isRequiredString(value) ? true : "Newsletter heading is required.")),
    }),
    defineField({
      group: "newsletter",
      name: "newsletterDescription",
      rows: 3,
      title: "Newsletter description",
      type: "text",
    }),
    defineField({
      group: "newsletter",
      initialValue: "Subscribe",
      name: "newsletterCtaLabel",
      title: "Newsletter CTA label",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            isRequiredString(value) ? true : "Newsletter CTA label is required.",
          ),
    }),
    defineField({
      group: "bottom",
      name: "legalLinks",
      of: [defineArrayMember({ type: "link" })],
      title: "Legal links",
      type: "array",
      validation: (rule) => rule.max(6),
    }),
    defineField({
      group: "bottom",
      initialValue: "© {year} vaïvae. All rights reserved.",
      name: "copyrightText",
      title: "Copyright text",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => (isRequiredString(value) ? true : "Copyright text is required.")),
    }),
    defineField({
      group: "bottom",
      name: "paymentMethods",
      of: [
        defineArrayMember({
          options: {
            list: [
              { title: "Visa", value: "visa" },
              { title: "Mastercard", value: "mastercard" },
              { title: "American Express", value: "amex" },
              { title: "Apple Pay", value: "applepay" },
              { title: "Google Pay", value: "googlepay" },
              { title: "PayPal", value: "paypal" },
            ],
          },
          type: "string",
        }),
      ],
      title: "Payment methods",
      type: "array",
      validation: (rule) => rule.unique(),
    }),
  ],
  groups: [
    { default: true, name: "columns", title: "Columns" },
    { name: "newsletter", title: "Newsletter" },
    { name: "bottom", title: "Bottom" },
  ],
  icon: StackCompactIcon,
  name: "footer",
  preview: {
    select: {
      newsletterEnabled: "newsletterEnabled",
    },
    prepare({ newsletterEnabled }) {
      return {
        media: StackCompactIcon,
        subtitle: newsletterEnabled === false ? "Newsletter disabled" : "Newsletter enabled",
        title: "Footer",
      };
    },
  },
  title: "Footer",
  type: "document",
});
