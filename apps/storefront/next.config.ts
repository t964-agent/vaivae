import { withSentryConfig, type SentryBuildOptions } from "@sentry/nextjs";
import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
] as const;

const nextConfig: NextConfig = {
  headers: async () => [
    {
      headers: [...securityHeaders],
      source: "/:path*",
    },
  ],
  images: {
    remotePatterns: [
      {
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
        protocol: "https",
      },
      {
        hostname: "image.mux.com",
        pathname: "/**",
        protocol: "https",
      },
    ],
  },
  reactCompiler: {
    compilationMode: "annotation",
  },
  typedRoutes: true,
};

const sentryAuthToken = process.env["SENTRY_AUTH_TOKEN"];
const shouldUploadSourcemaps = process.env["NODE_ENV"] === "production" && Boolean(sentryAuthToken);

const sentryBuildOptions: SentryBuildOptions = {
  project: process.env["SENTRY_PROJECT"] ?? "vaivae-storefront",
  silent: !process.env["CI"],
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
    disable: !shouldUploadSourcemaps,
  },
  telemetry: false,
};

const sentryOrg = process.env["SENTRY_ORG"];

if (sentryOrg) {
  sentryBuildOptions.org = sentryOrg;
}

if (sentryAuthToken) {
  sentryBuildOptions.authToken = sentryAuthToken;
}

export default withSentryConfig(nextConfig, sentryBuildOptions);
