import { BrandPromise } from "./modules/brand-promise";
import { CtaSection } from "./modules/cta-section";
import { EditorialExcerpt } from "./modules/editorial-excerpt";
import { HeroFilm } from "./modules/hero-film";
import { ImagePair } from "./modules/image-pair";
import { JournalRail } from "./modules/journal-rail";
import { LookbookGrid } from "./modules/lookbook-grid";
import { ProductRail } from "./modules/product-rail";
import { Quote } from "./modules/quote";
import { VideoChapter } from "./modules/video-chapter";
import type { PageBuilderContext, PageBuilderModule } from "./types";

export type PageBuilderProps = {
  context?: PageBuilderContext | undefined;
  modules: PageBuilderModule[] | null | undefined;
};

type ModuleRendererProps = {
  context?: PageBuilderContext | undefined;
  builderModule: PageBuilderModule;
};

function ModuleRenderer({ builderModule, context }: ModuleRendererProps) {
  switch (builderModule._type) {
    case "heroFilm":
      return <HeroFilm data={builderModule} />;
    case "brandPromise":
      return <BrandPromise data={builderModule} />;
    case "productRail":
      return <ProductRail data={builderModule} medusaProducts={context?.medusaProducts} />;
    case "editorialExcerpt":
      return <EditorialExcerpt data={builderModule} />;
    case "lookbookGrid":
      return <LookbookGrid data={builderModule} />;
    case "journalRail":
      return <JournalRail data={builderModule} />;
    case "imagePair":
      return <ImagePair data={builderModule} />;
    case "videoChapter":
      return <VideoChapter data={builderModule} medusaProducts={context?.medusaProducts} />;
    case "quote":
      return <Quote data={builderModule} />;
    case "ctaSection":
      return <CtaSection data={builderModule} />;
    default: {
      const _exhaustive: never = builderModule;

      return _exhaustive;
    }
  }
}

export function PageBuilder({ context, modules }: PageBuilderProps) {
  if (!modules?.length) {
    return null;
  }

  return (
    <>
      {modules.map((builderModule, index) => (
        <ModuleRenderer
          builderModule={builderModule}
          context={context}
          key={builderModule._key ?? index}
        />
      ))}
    </>
  );
}
