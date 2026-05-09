import { PackageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { productStorytellingArray, productStorytellingOptions } from "../pageBuilder";
import { defineEditorialBodyField, hasImageAsset } from "../pageBuilder/common";

function getParentBoolean(parent: unknown, key: string): boolean {
  if (!parent || typeof parent !== "object" || !(key in parent)) {
    return false;
  }

  return (parent as Record<string, unknown>)[key] === true;
}

function isMedusaProductId(value: unknown): boolean {
  return typeof value === "string" && /^prod_/.test(value.trim());
}

export const product = defineType({
  fields: [
    defineField({
      description:
        "Immutable ID synced from Medusa. The Sanity document _id is deterministic from this value.",
      group: "mirror",
      name: "medusaProductId",
      readOnly: true,
      title: "Medusa product ID",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            isMedusaProductId(value)
              ? true
              : "Use the immutable Medusa product id, e.g. prod_01ABC.",
          ),
    }),
    defineField({
      description: "Mirrored from Medusa for editor convenience. Source of truth is Medusa.",
      group: "mirror",
      name: "title",
      readOnly: true,
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "Mirrored from Medusa. Source of truth is Medusa.",
      group: "mirror",
      name: "handle",
      options: { source: "title" },
      readOnly: true,
      title: "Handle",
      type: "slug",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description:
        "Mirrored from Medusa for quick reference; full material breakdown via Materials group below.",
      group: "mirror",
      name: "mirrorMaterials",
      of: [defineArrayMember({ type: "string" })],
      readOnly: true,
      title: "Mirrored materials",
      type: "array",
    }),
    defineField({
      description: "Toggle once editorial fields are filled by the team.",
      group: "editorial",
      initialValue: false,
      name: "editorialReady",
      title: "Editorial ready",
      type: "boolean",
    }),
    defineField({ name: "eyebrow", group: "editorial", title: "Eyebrow", type: "string" }),
    defineField({
      description: "The single-line hook used in cart, mini-PDP, and product cards.",
      group: "editorial",
      name: "oneLineHook",
      title: "One-line hook",
      type: "string",
      validation: (rule) => rule.max(90),
    }),
    defineEditorialBodyField({
      description: "Story-led PDP copy. Use H2-H4, emphasis, blockquote, and links; no H1.",
      group: "editorial",
      name: "narrative",
      title: "Narrative",
    }),
    defineField({
      description:
        "Constrained in-PDP storytelling sections. Commerce facts still come from Medusa.",
      group: "editorial",
      name: "pdpStorytelling",
      of: productStorytellingArray,
      options: productStorytellingOptions,
      title: "PDP storytelling",
      type: "array",
    }),
    defineField({
      description: "Primary PDP editorial image. Required when Editorial ready is enabled.",
      group: "gallery",
      name: "heroImage",
      title: "Hero image",
      type: "vaivaeImage",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!getParentBoolean(context.parent, "editorialReady")) {
            return true;
          }

          return hasImageAsset(value)
            ? true
            : "Hero image is required when Editorial ready is enabled.";
        }),
    }),
    defineField({
      group: "gallery",
      name: "gallery",
      of: [defineArrayMember({ type: "vaivaeImage" })],
      options: { layout: "grid" },
      title: "Gallery",
      type: "array",
      validation: (rule) => rule.max(12),
    }),
    defineField({
      description: "Optional lookbook feature this product appears in.",
      group: "gallery",
      name: "lookbookFeature",
      options: { disableNew: true },
      title: "Lookbook feature",
      to: [{ type: "lookbook" }],
      type: "reference",
      weak: true,
    }),
    defineField({
      fields: [
        defineField({ name: "height", title: "Height", type: "string" }),
        defineField({ name: "wearingSize", title: "Wearing size", type: "string" }),
        defineField({ name: "notes", rows: 3, title: "Notes", type: "text" }),
      ],
      group: "specs",
      name: "modelSpecs",
      title: "Model specs",
      type: "object",
    }),
    defineField({
      group: "specs",
      name: "materials",
      of: [
        defineArrayMember({
          options: { disableNew: true },
          to: [{ type: "material" }],
          type: "reference",
          weak: true,
        }),
      ],
      title: "Materials",
      type: "array",
      validation: (rule) => rule.max(6).unique(),
    }),
    defineField({
      group: "specs",
      name: "colorSwatches",
      of: [
        defineArrayMember({
          fields: [
            defineField({
              name: "swatch",
              options: { disableNew: true },
              title: "Swatch",
              to: [{ type: "colorSwatch" }],
              type: "reference",
              validation: (rule) => rule.required(),
              weak: true,
            }),
            defineField({
              description: "Maps swatch to a specific Medusa variant option value.",
              name: "medusaVariantOptionValueId",
              title: "Medusa variant option value ID",
              type: "string",
            }),
          ],
          name: "productColorSwatch",
          preview: {
            select: {
              medusaVariantOptionValueId: "medusaVariantOptionValueId",
              swatchName: "swatch.name",
            },
            prepare({ medusaVariantOptionValueId, swatchName }) {
              return {
                media: PackageIcon,
                subtitle: medusaVariantOptionValueId,
                title: swatchName || "Color swatch",
              };
            },
          },
          title: "Color swatch",
          type: "object",
        }),
      ],
      title: "Color swatches",
      type: "array",
      validation: (rule) => rule.max(8),
    }),
    defineField({
      group: "specs",
      name: "sizeGuide",
      options: { disableNew: true },
      title: "Size guide",
      to: [{ type: "sizeGuide" }],
      type: "reference",
      weak: true,
    }),
    defineEditorialBodyField({
      description:
        "Fit and care notes controlled by Sanity. Operational eligibility remains in Medusa.",
      group: "specs",
      name: "careNotes",
      title: "Care notes",
    }),
    defineField({
      group: "sustainability",
      name: "madeIn",
      title: "Made in",
      type: "string",
    }),
    defineEditorialBodyField({
      description:
        "Editorial sustainability context. Do not author compliance-critical commerce rules here.",
      group: "sustainability",
      name: "sustainabilityNotes",
      title: "Sustainability notes",
    }),
    defineField({
      group: "sustainability",
      name: "certifications",
      of: [
        defineArrayMember({
          options: {
            list: [
              { title: "GOTS", value: "GOTS" },
              { title: "GRS", value: "GRS" },
              { title: "OEKO-TEX", value: "OEKO-TEX" },
              { title: "Fair Trade", value: "Fair Trade" },
              { title: "BCI", value: "BCI" },
            ],
          },
          type: "string",
        }),
      ],
      title: "Certifications",
      type: "array",
      validation: (rule) => rule.unique(),
    }),
    defineField({
      description:
        "Optional product SEO override. If absent, the storefront falls back to defaults.",
      group: "seo",
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  groups: [
    { name: "mirror", title: "Mirror" },
    { default: true, name: "editorial", title: "Editorial" },
    { name: "gallery", title: "Gallery" },
    { name: "specs", title: "Specs" },
    { name: "sustainability", title: "Sustainability" },
    { name: "seo", title: "SEO" },
  ],
  icon: PackageIcon,
  name: "product",
  orderings: [
    {
      by: [{ direction: "asc", field: "title" }],
      name: "titleAsc",
      title: "Title A-Z",
    },
  ],
  preview: {
    select: {
      editorialReady: "editorialReady",
      handle: "handle.current",
      heroImage: "heroImage",
      title: "title",
    },
    prepare({ editorialReady, handle, heroImage, title }) {
      const readyState = editorialReady ? "Editorial ready" : "Needs editorial";

      return {
        media: heroImage || PackageIcon,
        subtitle: handle ? `${handle} · ${readyState}` : readyState,
        title: title || "Synced product",
      };
    },
  },
  title: "Product",
  type: "document",
});
