import type { StructureResolver } from "sanity/structure";

export const singletonTypes = ["siteSettings"] as const;

const singletonTypeSet = new Set<string>(singletonTypes);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .id("siteSettings")
        .schemaType("siteSettings")
        .title("Site Settings")
        .child(
          S.document().documentId("siteSettings").schemaType("siteSettings").title("Site Settings"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId();

        return id ? !singletonTypeSet.has(id) : true;
      }),
    ]);
