import { NextResponse, type NextRequest } from "next/server";

const securityHeaders = [
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()"],
  ["Strict-Transport-Security", "max-age=31536000; includeSubDomains"],
] as const;

function uniqueSources(sources: Array<string | null | undefined>): string[] {
  return [...new Set(sources.filter((source): source is string => Boolean(source)))];
}

function getOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function createDirective(name: string, sources: Array<string | null | undefined>): string {
  return `${name} ${uniqueSources(sources).join(" ")}`;
}

function createContentSecurityPolicy(nonce: string, enforce: boolean): string {
  const medusaOrigin = getOrigin(process.env["NEXT_PUBLIC_MEDUSA_BACKEND_URL"]);
  const posthogOrigin = getOrigin(process.env["NEXT_PUBLIC_POSTHOG_HOST"]);
  const sentryOrigin = getOrigin(process.env["NEXT_PUBLIC_SENTRY_DSN"]);

  return [
    createDirective("default-src", ["'self'"]),
    createDirective("script-src", [
      "'self'",
      `'nonce-${nonce}'`,
      "https://app.termly.io",
      "https://js.stripe.com",
      "https://www.googletagmanager.com",
      "https://*.googletagmanager.com",
      "https://static.klaviyo.com",
      "https://*.klaviyo.com",
      "https://app.posthog.com",
      "https://eu.posthog.com",
      "https://*.posthog.com",
      posthogOrigin,
    ]),
    createDirective("script-src-attr", ["'none'"]),
    createDirective("style-src", [
      "'self'",
      "'unsafe-inline'",
      "https://app.termly.io",
      "https://fonts.googleapis.com",
    ]),
    createDirective("img-src", [
      "'self'",
      "data:",
      "blob:",
      "https://cdn.sanity.io",
      "https://image.mux.com",
      "https://*.litix.io",
      "https://app.termly.io",
      "https://q.stripe.com",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://www.googletagmanager.com",
      "https://*.googletagmanager.com",
      "https://static.klaviyo.com",
      "https://*.klaviyo.com",
      "https://app.posthog.com",
      "https://eu.posthog.com",
      "https://*.posthog.com",
      "https://*.vercel.app",
      posthogOrigin,
    ]),
    createDirective("media-src", [
      "'self'",
      "blob:",
      "https://stream.mux.com",
      "https://cdn.mux.com",
      "https://*.mux.com",
      "https://m.sanity-cdn.com",
    ]),
    createDirective("connect-src", [
      "'self'",
      medusaOrigin,
      "https://api.vaivae.com",
      "https://api.sanity.io",
      "https://apicdn.sanity.io",
      "https://*.api.sanity.io",
      "https://*.apicdn.sanity.io",
      "https://api.stripe.com",
      "https://m.stripe.network",
      "https://api.pwnedpasswords.com",
      "https://app.termly.io",
      "https://us.consent.api.termly.io",
      "https://eu.consent.api.termly.io",
      "https://stream.mux.com",
      "https://inferred.litix.io",
      "https://*.mux.com",
      "https://*.litix.io",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://analytics.google.com",
      "https://*.analytics.google.com",
      "https://www.googletagmanager.com",
      "https://*.googletagmanager.com",
      "https://a.klaviyo.com",
      "https://static.klaviyo.com",
      "https://*.klaviyo.com",
      "https://app.posthog.com",
      "https://eu.posthog.com",
      "https://*.posthog.com",
      posthogOrigin,
      "https://vitals.vercel-insights.com",
      "https://va.vercel-scripts.com",
      "https://*.vercel-insights.com",
      "https://*.vercel.app",
      sentryOrigin,
      "https://*.sentry.io",
      "https://*.ingest.sentry.io",
      "https://*.ingest.us.sentry.io",
      "https://*.ingest.de.sentry.io",
    ]),
    createDirective("frame-src", [
      "'self'",
      "https://js.stripe.com",
      "https://hooks.stripe.com",
      "https://app.termly.io",
      "https://player.mux.com",
      "https://www.googletagmanager.com",
    ]),
    createDirective("font-src", ["'self'", "https://fonts.gstatic.com", "data:"]),
    createDirective("worker-src", ["'self'", "blob:"]),
    createDirective("manifest-src", ["'self'"]),
    createDirective("object-src", ["'none'"]),
    createDirective("frame-ancestors", ["'self'"]),
    createDirective("form-action", ["'self'", "https://hooks.stripe.com"]),
    createDirective("base-uri", ["'self'"]),
    ...(enforce ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  return btoa(String.fromCharCode(...bytes));
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const nonce = createNonce();
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  for (const [key, value] of securityHeaders) {
    response.headers.set(key, value);
  }

  const enforceCsp = process.env["CSP_ENFORCE"] === "true";
  const cspHeader = enforceCsp ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
  response.headers.set(cspHeader, createContentSecurityPolicy(nonce, enforceCsp));

  return response;
}

export const config = {
  matcher: [
    {
      missing: [
        { key: "next-router-prefetch", type: "header" },
        { key: "purpose", type: "header", value: "prefetch" },
      ],
      source: "/((?!api/revalidate|api|studio|_next|_vercel|.*\\..*).*)",
    },
  ],
};
