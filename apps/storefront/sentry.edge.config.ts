import * as Sentry from "@sentry/nextjs";

import { scrubSentryBreadcrumb, scrubSentryEvent } from "@/lib/sentry";

const sentryDsn = process.env["SENTRY_DSN"];
const sentryOptions: Parameters<typeof Sentry.init>[0] = {
  beforeBreadcrumb: scrubSentryBreadcrumb,
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryEvent,
  enabled: Boolean(sentryDsn),
  environment:
    process.env["SENTRY_ENVIRONMENT"] ?? process.env["VERCEL_ENV"] ?? process.env["NODE_ENV"],
  release: process.env["SENTRY_RELEASE"],
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
};

if (sentryDsn) {
  sentryOptions.dsn = sentryDsn;
}

Sentry.init(sentryOptions);
