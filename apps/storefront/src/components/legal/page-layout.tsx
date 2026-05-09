import { resolvePageBuilderContext } from "@/components/page-builder/context";
import { PageBuilder } from "@/components/page-builder/page-builder";
import type { PageBuilderModule } from "@/components/page-builder/types";
import type { PageBySlugQueryResult } from "@/sanity/types";

type PageDocument = NonNullable<PageBySlugQueryResult>;

type PageLayoutProps = {
  doc: PageDocument;
};

export async function PageLayout({ doc }: PageLayoutProps) {
  const modules = (doc.pageBuilder ?? []) as PageBuilderModule[];
  const context = await resolvePageBuilderContext(modules);

  return <PageBuilder context={context} modules={modules} />;
}
