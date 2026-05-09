import { LinkIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

const INTERNAL_LINK_TYPES = [
  { type: "siteSettings" },
  { type: "navigation" },
  { type: "footer" },
  { type: "homePage" },
  { type: "page" },
  { type: "product" },
];

type LinkParent = {
  type?: string;
};

function getLinkParent(parent: unknown): LinkParent | undefined {
  return parent && typeof parent === "object" ? (parent as LinkParent) : undefined;
}

function hasReference(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    "_ref" in value &&
    typeof value._ref === "string" &&
    value._ref.trim().length > 0
  );
}

function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const link = defineType({
  fields: [
    defineField({
      initialValue: "internal",
      name: "type",
      options: {
        layout: "radio",
        list: [
          { title: "Internal", value: "internal" },
          { title: "External", value: "external" },
        ],
      },
      title: "Type",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "The visible text shown to visitors.",
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
      description: "Choose an existing route-bearing document.",
      hidden: ({ parent }) => getLinkParent(parent)?.type === "external",
      name: "internal",
      options: {
        disableNew: true,
      },
      // Weak references keep navigation/footer from blocking future page archival.
      to: INTERNAL_LINK_TYPES,
      title: "Internal document",
      type: "reference",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (getLinkParent(context.parent)?.type !== "internal") {
            return true;
          }

          return hasReference(value) ? true : "Choose an internal document.";
        }),
      weak: true,
    }),
    defineField({
      hidden: ({ parent }) => getLinkParent(parent)?.type === "internal",
      name: "href",
      title: "External URL",
      type: "url",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (getLinkParent(context.parent)?.type !== "external") {
            return true;
          }

          return isHttpsUrl(value) ? true : "Enter a valid HTTP or HTTPS URL.";
        }),
    }),
    defineField({
      initialValue: false,
      name: "targetBlank",
      title: "Open in new tab",
      type: "boolean",
    }),
  ],
  icon: LinkIcon,
  name: "link",
  preview: {
    select: {
      href: "href",
      internalRef: "internal._ref",
      internalTitle: "internal.siteName",
      internalTitleFallback: "internal.title",
      label: "label",
      targetBlank: "targetBlank",
      type: "type",
    },
    prepare({ href, internalRef, internalTitle, internalTitleFallback, label, targetBlank, type }) {
      const target =
        type === "external" ? href : internalTitle || internalTitleFallback || internalRef;
      const suffix = targetBlank ? " · new tab" : "";

      return {
        media: LinkIcon,
        subtitle: target ? `${type}: ${target}${suffix}` : `${type || "link"}${suffix}`,
        title: label || "Untitled link",
      };
    },
  },
  title: "Link",
  type: "object",
});
