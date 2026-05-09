import { StackCompactIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { hasReference } from "../common";

export const capsuleRail = defineType({
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "heading", title: "Heading", type: "string" }),
    defineField({
      description:
        "Curated capsule page references. Agent 8 will retarget this to the capsule document type.",
      name: "capsules",
      of: [
        defineArrayMember({
          options: { disableNew: true },
          to: [{ type: "page" }],
          type: "reference",
          weak: true,
        }),
      ],
      title: "Capsules",
      type: "array",
      validation: (rule) => rule.required().min(1).max(6).unique(),
    }),
    defineField({ name: "cta", title: "CTA", type: "cta" }),
  ],
  icon: StackCompactIcon,
  name: "capsuleRail",
  preview: {
    select: { capsules: "capsules", heading: "heading" },
    prepare({ capsules, heading }) {
      const count = Array.isArray(capsules) ? capsules.filter(hasReference).length : 0;

      return {
        media: StackCompactIcon,
        subtitle: count ? `${count} capsule${count === 1 ? "" : "s"}` : "Capsule rail",
        title: heading || "Capsule rail",
      };
    },
  },
  title: "Capsule rail",
  type: "object",
});
