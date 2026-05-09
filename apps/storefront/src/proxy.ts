import { NextResponse, type NextRequest } from "next/server";

const securityHeaders = [
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()"],
  ["Strict-Transport-Security", "max-age=31536000; includeSubDomains"],
] as const;

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  return btoa(String.fromCharCode(...bytes));
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", createNonce());

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  for (const [key, value] of securityHeaders) {
    response.headers.set(key, value);
  }

  // TODO(Agent 24): wire full nonce-based CSP once PostHog, Sentry, Sanity, and consent sources are final.
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
