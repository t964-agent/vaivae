import { defineArrayMember, defineField } from "sanity";

export const themeOptions = [
  { title: "Light text on dark", value: "light-text-on-dark" },
  { title: "Dark text on light", value: "dark-text-on-light" },
];

export const editorialPortableTextBlock = defineArrayMember({
  lists: [],
  marks: {
    annotations: [
      {
        fields: [
          defineField({
            name: "href",
            title: "URL",
            type: "url",
            validation: (rule) =>
              rule.required().uri({ scheme: ["http", "https", "mailto", "tel"] }),
          }),
        ],
        name: "link",
        title: "Link",
        type: "object",
      },
    ],
    decorators: [{ title: "Emphasis", value: "em" }],
  },
  styles: [
    { title: "Normal", value: "normal" },
    { title: "H2", value: "h2" },
    { title: "H3", value: "h3" },
    { title: "H4", value: "h4" },
    { title: "Blockquote", value: "blockquote" },
    { title: "Pull quote", value: "pullQuote" },
  ],
  type: "block",
});

export const editorialImageBlock = defineArrayMember({ type: "vaivaeImage" });

export function defineEditorialBodyField({
  description,
  group,
  images = false,
  name = "body",
  required = false,
  title = "Body",
}: {
  description?: string;
  group?: string;
  images?: boolean;
  name?: string;
  required?: boolean;
  title?: string;
}) {
  return defineField({
    ...(description ? { description } : {}),
    ...(group ? { group } : {}),
    name,
    of: images ? [editorialPortableTextBlock, editorialImageBlock] : [editorialPortableTextBlock],
    title,
    type: "array",
    validation: (rule) => (required ? rule.required().min(1) : rule),
  });
}

export function getParentString(parent: unknown, key: string): string | undefined {
  if (!parent || typeof parent !== "object" || !(key in parent)) {
    return undefined;
  }

  const record = parent as Record<string, unknown>;
  const value = record[key];

  return typeof value === "string" ? value : undefined;
}

export function hasImageAsset(value: unknown): boolean {
  return Boolean(
    value &&
    typeof value === "object" &&
    "asset" in value &&
    value.asset &&
    typeof value.asset === "object" &&
    "_ref" in value.asset &&
    typeof value.asset._ref === "string" &&
    value.asset._ref.trim().length > 0,
  );
}

export function hasReference(value: unknown): boolean {
  return Boolean(
    value &&
    typeof value === "object" &&
    "_ref" in value &&
    typeof value._ref === "string" &&
    value._ref.trim().length > 0,
  );
}

export function countArrayItems(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}
