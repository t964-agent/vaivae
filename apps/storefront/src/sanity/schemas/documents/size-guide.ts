import { ControlsIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { defineEditorialBodyField } from "../pageBuilder/common";

export const sizeGuide = defineType({
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
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
    defineField({
      name: "description",
      rows: 3,
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "measurements",
      of: [
        defineArrayMember({
          fields: [
            defineField({
              name: "size",
              title: "Size",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "bust",
              title: "Bust",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "waist",
              title: "Waist",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "hips",
              title: "Hips",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "length",
              title: "Length",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "note",
              title: "Note",
              type: "string",
            }),
          ],
          name: "measurement",
          preview: {
            select: {
              hips: "hips",
              size: "size",
              waist: "waist",
            },
            prepare({ hips, size, waist }) {
              return {
                media: ControlsIcon,
                subtitle: [waist, hips].filter(Boolean).join(" / "),
                title: size || "Measurement",
              };
            },
          },
          title: "Measurement",
          type: "object",
        }),
      ],
      title: "Measurements",
      type: "array",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      initialValue: "both",
      name: "unitSystem",
      options: {
        layout: "radio",
        list: [
          { title: "Centimeters", value: "cm" },
          { title: "Inches", value: "in" },
          { title: "Both", value: "both" },
        ],
      },
      title: "Unit system",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineEditorialBodyField({
      description: "Optional fitting tips shown near the measurement table.",
      name: "tipsRichText",
      title: "Fitting tips",
    }),
  ],
  icon: ControlsIcon,
  name: "sizeGuide",
  preview: {
    select: {
      measurements: "measurements",
      name: "name",
    },
    prepare({ measurements, name }) {
      const count = Array.isArray(measurements) ? measurements.length : 0;

      return {
        media: ControlsIcon,
        subtitle: count ? `${count} size${count === 1 ? "" : "s"}` : "No measurements",
        title: name || "Size guide",
      };
    },
  },
  title: "Size guide",
  type: "document",
});
