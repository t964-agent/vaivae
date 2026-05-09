import { MarkerIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

const requiredString = (label: string) => (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? true : `${label} is required.`;

export const address = defineType({
  fields: [
    defineField({
      name: "line1",
      title: "Line 1",
      type: "string",
      validation: (rule) => rule.required().custom(requiredString("Line 1")),
    }),
    defineField({
      name: "line2",
      title: "Line 2",
      type: "string",
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (rule) => rule.required().custom(requiredString("City")),
    }),
    defineField({
      description: "State, province, or region.",
      name: "region",
      title: "Region",
      type: "string",
      validation: (rule) => rule.required().custom(requiredString("Region")),
    }),
    defineField({
      name: "postalCode",
      title: "Postal code",
      type: "string",
      validation: (rule) => rule.required().custom(requiredString("Postal code")),
    }),
    defineField({
      initialValue: "United States",
      name: "country",
      title: "Country",
      type: "string",
      validation: (rule) => rule.required().custom(requiredString("Country")),
    }),
  ],
  icon: MarkerIcon,
  name: "address",
  preview: {
    select: {
      city: "city",
      line1: "line1",
      postalCode: "postalCode",
      region: "region",
    },
    prepare({ city, line1, postalCode, region }) {
      const location = [city, region, postalCode].filter(Boolean).join(" ");

      return {
        media: MarkerIcon,
        subtitle: location,
        title: line1 || "Address",
      };
    },
  },
  title: "Address",
  type: "object",
});
