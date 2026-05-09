import * as Sentry from "@sentry/nextjs";

import { scrubSentryEvent } from "@/lib/sentry";

const sentryDsn = process.env["NEXT_PUBLIC_SENTRY_DSN"];
const sentryOptions: Parameters<typeof Sentry.init>[0] = {
  beforeSend: scrubSentryEvent,
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,
  tracesSampleRate: 0.1,
};

if (sentryDsn) {
  sentryOptions.dsn = sentryDsn;
}

Sentry.init(sentryOptions);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
