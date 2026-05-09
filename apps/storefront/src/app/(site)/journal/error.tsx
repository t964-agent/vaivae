"use client";

import { EditorialRouteError } from "@/components/editorial/editorial-route-error";

type JournalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function JournalError({ error: _error, reset }: JournalErrorProps) {
  return (
    <EditorialRouteError
      body="Refresh the notes. If the issue remains, the journal will return shortly."
      eyebrow="Field Notes"
      reset={reset}
      title="The journal is momentarily unavailable."
    />
  );
}
