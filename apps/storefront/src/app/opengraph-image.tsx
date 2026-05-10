import { ImageResponse } from "next/og";

import { createBrandOgImage } from "@/lib/seo/og";

export const alt = "vaïvae — The Living Runway";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    createBrandOgImage({
      eyebrow: "Luxury editorial fashion",
      subtitle: "The Living Runway",
      title: "vaïvae",
    }),
    size,
  );
}
