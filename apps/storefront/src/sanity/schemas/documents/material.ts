import { EarthGlobeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { defineEditorialBodyField } from "../pageBuilder/common";

export const material = defineType({
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "Fiber breakdown, e.g. 92% silk, 8% elastane.",
      name: "composition",
      rows: 3,
      title: "Composition",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "Optional origin note, e.g. Como, Italy.",
      name: "origin",
      title: "Origin",
      type: "string",
    }),
    defineField({
      name: "careInstructions",
      rows: 4,
      title: "Care instructions",
      type: "text",
    }),
    defineEditorialBodyField({
      description: "Narrative material copy used in editorial and PDP contexts.",
      name: "description",
      title: "Description",
    }),
    defineField({
      name: "slug",
      options: {
        source: "name",
        isUnique: (slug, context) => context.defaultIsUnique(slug, context),
      },
      title: "Slug",
      type: "slug",
      validation: (rule) => rule.required(),
    }),
  ],
  icon: EarthGlobeIcon,
  name: "material",
  preview: {
    select: {
      composition: "composition",
      name: "name",
    },
    prepare({ composition, name }) {
      return {
        media: EarthGlobeIcon,
        subtitle: composition,
        title: name || "Material",
      };
    },
  },
  title: "Material",
  type: "document",
});
