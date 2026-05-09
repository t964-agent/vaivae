import type { Breadcrumb, Event } from "@sentry/node";
import type * as SentryNode from "@sentry/node";

import type { MedusaEnv } from "./env";

const Sentry = require("@sentry/node") as typeof SentryNode;
const { env } = require("./env") as { env: MedusaEnv };

const piiKeyFragments = [
  "address",
  "authorization",
  "billing",
  "card",
  "client_secret",
  "cookie",
  "cvv",
  "cvc",
  "email",
  "expiry",
  "name",
  "password",
  "payment",
  "phone",
  "secret",
  "shipping",
  "token",
] as const;

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phonePattern = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g;
const cardPattern = /\b(?:\d[ -]*?){13,19}\b/g;
const bearerTokenPattern = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const stripeSecretPattern =
  /\b(?:pi|seti|cs|sk|rk)_(?:live|test)_[A-Za-z0-9_]+(?:_secret_[A-Za-z0-9_]+)?\b/g;

let hasInitializedSentry = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPiiKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return piiKeyFragments.some((fragment) => normalizedKey.includes(fragment));
}

function redactString(value: string): string {
  const withoutQuery = value.replace(/https?:\/\/[^\s?#]+[^\s]*/gi, (urlValue) => {
    try {
      const url = new URL(urlValue);

      return `${url.origin}${url.pathname}`;
    } catch {
      return "[Filtered]";
    }
  });

  return withoutQuery
    .replace(emailPattern, "[Filtered]")
    .replace(phonePattern, "[Filtered]")
    .replace(cardPattern, "[Filtered]")
    .replace(bearerTokenPattern, "Bearer [Filtered]")
    .replace(stripeSecretPattern, "[Filtered]");
}

function redactKnownPii(value: unknown, depth = 0): unknown {
  if (depth > 6) {
    return "[Filtered]";
  }

  if (typeof value === "string") {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactKnownPii(item, depth + 1));
  }

  if (!isRecord(value)) {
    return value;
  }

  const redacted: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(value)) {
    redacted[key] = isPiiKey(key) ? "[Filtered]" : redactKnownPii(child, depth + 1);
  }

  return redacted;
}

function scrubUrl(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);

    return `${url.origin}${url.pathname}`;
  } catch {
    return redactString(value.split("?")[0] ?? value);
  }
}

function keepUserIdOnly(user: Event["user"]): Event["user"] {
  if (!user?.id) {
    return undefined;
  }

  return { id: String(user.id) };
}

function scrubSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  const scrubbed: Breadcrumb = { ...breadcrumb };

  if (breadcrumb.data) {
    scrubbed.data = redactKnownPii(breadcrumb.data) as NonNullable<Breadcrumb["data"]>;
  } else {
    delete scrubbed.data;
  }

  if (breadcrumb.message) {
    scrubbed.message = redactString(breadcrumb.message);
  } else {
    delete scrubbed.message;
  }

  return scrubbed;
}

function scrubSentryEvent<TEvent extends Event>(event: TEvent): TEvent {
  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.query_string;
    const scrubbedUrl = scrubUrl(event.request.url);

    if (scrubbedUrl) {
      event.request.url = scrubbedUrl;
    } else {
      delete event.request.url;
    }

    if (event.request.headers) {
      event.request.headers = redactKnownPii(event.request.headers) as Record<string, string>;
    }
  }

  const scrubbedUser = keepUserIdOnly(event.user);

  if (scrubbedUser) {
    event.user = scrubbedUser;
  } else {
    delete event.user;
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs
      .map((breadcrumb) => scrubSentryBreadcrumb(breadcrumb))
      .filter((breadcrumb): breadcrumb is Breadcrumb => breadcrumb !== null);
  }

  if (event.contexts) {
    event.contexts = redactKnownPii(event.contexts) as NonNullable<Event["contexts"]>;
  }

  if (event.extra) {
    event.extra = redactKnownPii(event.extra) as Record<string, unknown>;
  }

  if (event.tags) {
    event.tags = redactKnownPii(event.tags) as Record<string, string>;
  }

  if (event.transaction) {
    event.transaction = redactString(event.transaction);
  }

  return event;
}

function initializeSentry(): void {
  if (hasInitializedSentry) {
    return;
  }

  hasInitializedSentry = true;

  Sentry.init({
    beforeBreadcrumb: scrubSentryBreadcrumb,
    beforeSend: scrubSentryEvent,
    beforeSendTransaction: scrubSentryEvent,
    dsn: env.SENTRY_DSN,
    enabled: Boolean(env.SENTRY_DSN),
    environment: env.SENTRY_ENVIRONMENT ?? process.env["NODE_ENV"] ?? "development",
    release: env.SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
  });
}

module.exports = {
  initializeSentry,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
};
