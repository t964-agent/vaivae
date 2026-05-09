import { address } from "./objects/address";
import { cta } from "./objects/cta";
import { vaivaeImage } from "./objects/image";
import { link } from "./objects/link";
import { seo } from "./objects/seo";
import { socialLink } from "./objects/social-link";
import { footer } from "./singletons/footer";
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
];
