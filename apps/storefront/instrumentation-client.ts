import * as Sentry from "@sentry/nextjs";

import { scrubSentryBreadcrumb, scrubSentryEvent } from "@/lib/sentry";

const sentryDsn = process.env["NEXT_PUBLIC_SENTRY_DSN"];
const sentryOptions: Parameters<typeof Sentry.init>[0] = {
  beforeBreadcrumb: scrubSentryBreadcrumb,
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryEvent,
  enabled: Boolean(sentryDsn),
  environment: process.env["NEXT_PUBLIC_VERCEL_ENV"] ?? process.env["NODE_ENV"],
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
};

if (sentryDsn) {
  sentryOptions.dsn = sentryDsn;
}

Sentry.init(sentryOptions);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
