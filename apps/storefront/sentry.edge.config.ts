import * as Sentry from "@sentry/nextjs";

import { scrubSentryEvent } from "@/lib/sentry";

const sentryDsn = process.env["SENTRY_DSN"];
const sentryOptions: Parameters<typeof Sentry.init>[0] = {
  beforeSend: scrubSentryEvent,
  tracesSampleRate: 0.1,
};

if (sentryDsn) {
  sentryOptions.dsn = sentryDsn;
}

Sentry.init(sentryOptions);
