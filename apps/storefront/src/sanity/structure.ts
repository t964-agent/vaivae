import {
  BookIcon,
  CogIcon,
  ControlsIcon,
  DocumentsIcon,
  MenuIcon,
  PackageIcon,
  StackCompactIcon,
} from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

export const singletonTypes = ["siteSettings", "navigation", "footer"] as const;

const singletonTypeSet = new Set<string>(singletonTypes);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .id("settings")
        .icon(CogIcon)
        .title("Settings")
        .child(
          S.list()
            .id("settingsList")
            .title("Settings")
            .items([
              S.documentListItem({ id: "siteSettings", schemaType: "siteSettings" })
                .icon(ControlsIcon)
                .schemaType("siteSettings")
                .title("Site Settings"),
              S.documentListItem({ id: "navigation", schemaType: "navigation" })
                .icon(MenuIcon)
                .schemaType("navigation")
                .title("Navigation"),
              S.documentListItem({ id: "footer", schemaType: "footer" })
                .icon(StackCompactIcon)
                .schemaType("footer")
                .title("Footer"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .id("pages")
        .icon(DocumentsIcon)
        .title("Pages")
        .child(S.list().id("pagesList").title("Pages").items([])),
      S.listItem()
        .id("editorial")
        .icon(BookIcon)
        .title("Editorial")
        .child(S.list().id("editorialList").title("Editorial").items([])),
      S.listItem()
        .id("catalog")
        .icon(PackageIcon)
        .title("Catalog")
        .child(S.list().id("catalogList").title("Catalog").items([])),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId();

        return id ? !singletonTypeSet.has(id) : true;
      }),
    ]);
