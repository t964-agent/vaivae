import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#efe9df",
    description: "Luxury editorial fashion ecommerce.",
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/icon-192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icon-512.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icon-maskable-512.png",
        type: "image/png",
      },
    ],
    name: "vaïvae — The Living Runway",
    short_name: "vaïvae",
    start_url: "/",
    theme_color: "#1a0a06",
  };
}
