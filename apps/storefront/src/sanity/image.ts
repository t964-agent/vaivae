import imageUrlBuilder, { type SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "./api";

const builder = imageUrlBuilder({ dataset, projectId });

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format");
}
