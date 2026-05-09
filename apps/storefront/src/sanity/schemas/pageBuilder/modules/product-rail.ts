import { PackageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const productRail = defineType({
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({ name: "intro", rows: 3, title: "Intro", type: "text" }),
    defineField({
      initialValue: "carousel",
      name: "layout",
      options: {
        layout: "radio",
        list: [
          { title: "Carousel", value: "carousel" },
          { title: "Grid", value: "grid" },
        ],
      },
      title: "Layout",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      hidden: ({ parent }) =>
        parent && typeof parent === "object" && "layout" in parent && parent.layout !== "grid",
      initialValue: 3,
      name: "columns",
      title: "Grid columns",
      type: "number",
      validation: (rule) => rule.min(2).max(4),
    }),
    defineField({
      initialValue: "standard",
      name: "density",
      options: {
        layout: "radio",
        list: [
          { title: "Compact", value: "compact" },
          { title: "Standard", value: "standard" },
          { title: "Spacious", value: "spacious" },
        ],
      },
      title: "Density",
      type: "string",
    }),
    defineField({
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
      validation: (rule) => rule.required().min(4).max(12).unique(),
    }),
    defineField({ name: "cta", title: "CTA", type: "cta" }),
  ],
  icon: PackageIcon,
  name: "productRail",
  preview: {
    select: { heading: "heading", products: "products" },
    prepare({ heading, products }) {
      const count = Array.isArray(products) ? products.length : 0;

      return {
        media: PackageIcon,
        subtitle: count ? `${count} product${count === 1 ? "" : "s"}` : "Product rail",
        title: heading || "Product rail",
      };
    },
  },
  title: "Product rail",
  type: "object",
});
