import { PackageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const product = defineType({
  fields: [
    defineField({
      description:
        "Deterministic ID synced from Medusa. The Sanity document's _id matches this value.",
      group: "medusa",
      name: "medusaProductId",
      readOnly: true,
      title: "Medusa product ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "Mirrored from Medusa for editor convenience. Source of truth is Medusa.",
      group: "medusa",
      name: "title",
      readOnly: true,
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "Mirrored from Medusa.",
      group: "medusa",
      name: "handle",
      options: { source: "title" },
      readOnly: true,
      title: "Handle",
      type: "slug",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "Toggle once editorial fields are filled by the team.",
      group: "editorial",
      initialValue: false,
      name: "editorialReady",
      title: "Editorial ready",
      type: "boolean",
    }),
  ],
  groups: [
    { default: true, name: "medusa", title: "Medusa mirror" },
    { name: "editorial", title: "Editorial" },
  ],
  icon: PackageIcon,
  name: "product",
  preview: {
    select: {
      editorialReady: "editorialReady",
      handle: "handle.current",
      title: "title",
    },
    prepare({ editorialReady, handle, title }) {
      const readyState = editorialReady ? "Editorial ready" : "Needs editorial";

      return {
        media: PackageIcon,
        subtitle: handle ? `${handle} · ${readyState}` : readyState,
        title: title || "Synced product",
      };
    },
  },
  title: "Product",
  type: "document",
});
