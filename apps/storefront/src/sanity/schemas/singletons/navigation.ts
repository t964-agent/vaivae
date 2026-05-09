import { MenuIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

type PromoParent = {
  promoBannerEnabled?: boolean;
};

function getPromoParent(parent: unknown): PromoParent | undefined {
  return parent && typeof parent === "object" ? (parent as PromoParent) : undefined;
}

function isRequiredString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasObjectValue(value: unknown): boolean {
  return value !== null && typeof value === "object";
}

export const navigation = defineType({
  fields: [
    defineField({
      group: "header",
      name: "headerLinks",
      of: [defineArrayMember({ type: "link" })],
      title: "Header links",
      type: "array",
      validation: (rule) => rule.required().min(1).max(6),
    }),
    defineField({
      group: "header",
      name: "secondaryLinks",
      of: [defineArrayMember({ type: "link" })],
      title: "Secondary links",
      type: "array",
      validation: (rule) => rule.max(3),
    }),
    defineField({
      group: "mobileMenu",
      name: "mobileMenuExtras",
      of: [defineArrayMember({ type: "link" })],
      title: "Mobile menu extras",
      type: "array",
    }),
    defineField({
      group: "promoBanner",
      initialValue: false,
      name: "promoBannerEnabled",
      title: "Enable promotional banner",
      type: "boolean",
    }),
    defineField({
      group: "promoBanner",
      hidden: ({ parent }) => getPromoParent(parent)?.promoBannerEnabled !== true,
      name: "promoBannerText",
      title: "Promotional banner text",
      type: "string",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (getPromoParent(context.parent)?.promoBannerEnabled !== true) {
            return true;
          }

          return isRequiredString(value) ? true : "Banner text is required when enabled.";
        }),
    }),
    defineField({
      group: "promoBanner",
      hidden: ({ parent }) => getPromoParent(parent)?.promoBannerEnabled !== true,
      name: "promoBannerLink",
      title: "Promotional banner link",
      type: "link",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (getPromoParent(context.parent)?.promoBannerEnabled !== true) {
            return true;
          }

          return hasObjectValue(value) ? true : "Banner link is required when enabled.";
        }),
    }),
  ],
  groups: [
    { default: true, name: "header", title: "Header" },
    { name: "mobileMenu", title: "Mobile menu" },
    { name: "promoBanner", title: "Promotional banner" },
  ],
  icon: MenuIcon,
  name: "navigation",
  preview: {
    select: {
      promoBannerEnabled: "promoBannerEnabled",
    },
    prepare({ promoBannerEnabled }) {
      return {
        media: MenuIcon,
        subtitle: promoBannerEnabled ? "Promotional banner enabled" : "Header and mobile menu",
        title: "Navigation",
      };
    },
  },
  title: "Navigation",
  type: "document",
});
