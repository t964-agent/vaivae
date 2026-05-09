import { ControlsIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(value: unknown): boolean {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

function isRequiredString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export const siteSettings = defineType({
  fields: [
    defineField({
      group: "brand",
      initialValue: "vaïvae",
      name: "siteName",
      title: "Site name",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => (isRequiredString(value) ? true : "Site name is required.")),
    }),
    defineField({
      group: "brand",
      initialValue: "The Living Runway",
      name: "tagline",
      title: "Tagline",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => (isRequiredString(value) ? true : "Tagline is required.")),
    }),
    defineField({
      group: "brand",
      name: "logo",
      title: "Logo",
      type: "vaivaeImage",
    }),
    defineField({
      group: "brand",
      name: "favicon",
      title: "Favicon",
      type: "vaivaeImage",
    }),
    defineField({
      group: "defaultSeo",
      name: "defaultSeo",
      title: "Default SEO",
      type: "seo",
      validation: (rule) => rule.required(),
    }),
    defineField({
      group: "defaults",
      initialValue: "United States",
      name: "defaultRegion",
      title: "Default region",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => (isRequiredString(value) ? true : "Default region is required.")),
    }),
    defineField({
      group: "defaults",
      initialValue: "USD",
      name: "defaultCurrency",
      title: "Default currency",
      type: "string",
      validation: (rule) =>
        rule.required().custom((value) => {
          const currency = typeof value === "string" ? value.trim() : "";

          if (!currency) {
            return "Default currency is required.";
          }

          return /^[A-Z]{3}$/.test(currency) ? true : "Use a three-letter ISO currency code.";
        }),
    }),
    defineField({
      group: "contact",
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => (isEmail(value) ? true : "Enter a valid contact email address.")),
    }),
    defineField({
      group: "contact",
      name: "pressEmail",
      title: "Press email",
      type: "string",
      validation: (rule) =>
        rule.custom((value) =>
          value === undefined || value === null || value === "" || isEmail(value)
            ? true
            : "Enter a valid press email address.",
        ),
    }),
    defineField({
      group: "contact",
      name: "wholesaleEmail",
      title: "Wholesale email",
      type: "string",
      validation: (rule) =>
        rule.custom((value) =>
          value === undefined || value === null || value === "" || isEmail(value)
            ? true
            : "Enter a valid wholesale email address.",
        ),
    }),
    defineField({
      group: "contact",
      name: "address",
      title: "Address",
      type: "address",
    }),
    defineField({
      group: "social",
      name: "socialLinks",
      of: [defineArrayMember({ type: "socialLink" })],
      title: "Social links",
      type: "array",
      validation: (rule) => rule.max(8),
    }),
  ],
  groups: [
    { default: true, name: "brand", title: "Brand" },
    { name: "defaultSeo", title: "Default SEO" },
    { name: "defaults", title: "Defaults" },
    { name: "contact", title: "Contact" },
    { name: "social", title: "Social" },
  ],
  icon: ControlsIcon,
  name: "siteSettings",
  preview: {
    select: {
      logo: "logo",
      siteName: "siteName",
      tagline: "tagline",
    },
    prepare({ logo, siteName, tagline }) {
      return {
        media: logo ?? ControlsIcon,
        subtitle: tagline,
        title: siteName || "Site Settings",
      };
    },
  },
  title: "Site Settings",
  type: "document",
});
