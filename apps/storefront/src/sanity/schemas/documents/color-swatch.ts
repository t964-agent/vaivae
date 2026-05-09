import { ColorWheelIcon } from "@sanity/icons";
import { createElement } from "react";
import { defineField, defineType } from "sanity";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function isHexColor(value: unknown): boolean {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value.trim());
}

export const colorSwatch = defineType({
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
      description: "Six-digit hex color used for swatch fill, e.g. #C85F3D.",
      name: "hex",
      title: "Hex color",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => (isHexColor(value) ? true : "Use a 6-digit hex value like #C85F3D.")),
    }),
    defineField({
      description: "Optional fabric texture sample for richer swatch rendering.",
      name: "image",
      title: "Texture image",
      type: "vaivaeImage",
    }),
    defineField({
      description: "Text color to use when a label appears over this swatch.",
      initialValue: "light",
      name: "fallbackTextColor",
      options: {
        layout: "radio",
        list: [
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
        ],
      },
      title: "Fallback text color",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  icon: ColorWheelIcon,
  name: "colorSwatch",
  preview: {
    select: {
      hex: "hex",
      name: "name",
    },
    prepare({ hex, name }) {
      const safeColor = isHexColor(hex) ? hex.trim() : "transparent";

      return {
        media: createElement("span", {
          style: {
            background: safeColor,
            border: "1px solid currentColor",
            borderRadius: "999px",
            display: "block",
            height: "100%",
            width: "100%",
          },
        }),
        subtitle: isHexColor(hex) ? hex.trim() : "No hex color",
        title: name || "Color swatch",
      };
    },
  },
  title: "Color swatch",
  type: "document",
});
