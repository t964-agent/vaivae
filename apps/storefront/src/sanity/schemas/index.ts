import { colorSwatch } from "./documents/color-swatch";
import { journal } from "./documents/journal";
import { legal } from "./documents/legal";
import { lookbook } from "./documents/lookbook";
import { material } from "./documents/material";
import { page } from "./documents/page";
import { product } from "./documents/product";
import { sizeGuide } from "./documents/size-guide";
import { address } from "./objects/address";
import { cta } from "./objects/cta";
import { vaivaeImage } from "./objects/image";
import { link } from "./objects/link";
import { seo } from "./objects/seo";
import { socialLink } from "./objects/social-link";
import { brandPromise } from "./pageBuilder/modules/brand-promise";
import { ctaSection } from "./pageBuilder/modules/cta-section";
import { editorialExcerpt } from "./pageBuilder/modules/editorial-excerpt";
import { heroFilm } from "./pageBuilder/modules/hero-film";
import { imagePair } from "./pageBuilder/modules/image-pair";
import { journalRail } from "./pageBuilder/modules/journal-rail";
import { lookbookGrid } from "./pageBuilder/modules/lookbook-grid";
import { productRail } from "./pageBuilder/modules/product-rail";
import { quote } from "./pageBuilder/modules/quote";
import { videoChapter } from "./pageBuilder/modules/video-chapter";
import { footer } from "./singletons/footer";
import { homePage } from "./singletons/home-page";
import { navigation } from "./singletons/navigation";
import { siteSettings } from "./singletons/site-settings";

export const schemaTypes = [
  seo,
  link,
  vaivaeImage,
  cta,
  socialLink,
  address,
  siteSettings,
  navigation,
  footer,
  homePage,
  heroFilm,
  brandPromise,
  productRail,
  editorialExcerpt,
  lookbookGrid,
  journalRail,
  imagePair,
  videoChapter,
  quote,
  ctaSection,
  page,
  lookbook,
  journal,
  legal,
  product,
  material,
  colorSwatch,
  sizeGuide,
];
