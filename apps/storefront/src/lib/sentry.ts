import * as Sentry from "@sentry/nextjs";
import type { Event } from "@sentry/nextjs";

const piiKeyFragments = [
  "address",
  "authorization",
  "card",
  "cookie",
  "email",
  "name",
  "password",
  "payment",
  "phone",
  "secret",
  "token",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPiiKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return piiKeyFragments.some((fragment) => normalizedKey.includes(fragment));
}

function redactKnownPii(value: unknown, depth = 0): unknown {
  if (depth > 4) {
    return "[Filtered]";
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

export function scrubSentryEvent<TEvent extends Event>(event: TEvent): TEvent {
  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;

    const { headers } = event.request;

    if (headers) {
      for (const key of Object.keys(headers)) {
        if (isPiiKey(key)) {
          headers[key] = "[Filtered]";
        }
      }
    }
  }

  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
  }

  if (event.extra) {
    event.extra = redactKnownPii(event.extra) as Record<string, unknown>;
  }

  return event;
}

export function captureError(error: unknown, context?: Record<string, unknown>): string {
  return Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("vaivae", redactKnownPii(context) as Record<string, unknown>);
    }

    return Sentry.captureException(error);
  });
}
