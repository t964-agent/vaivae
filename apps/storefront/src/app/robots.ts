import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  return (process.env["NEXT_PUBLIC_BASE_URL"]?.trim() || "https://vaivae.com").replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    host: baseUrl,
    rules: [
      {
        allow: "/",
        disallow: [
          "/account/",
          "/checkout/",
          "/api/",
          "/studio/",
          "/preview-ui",
          "/preview-modules",
        ],
        userAgent: "*",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
