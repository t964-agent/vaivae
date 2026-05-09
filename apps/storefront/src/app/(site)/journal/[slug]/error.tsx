"use client";

import { EditorialRouteError } from "@/components/editorial/editorial-route-error";

type JournalEntryErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function JournalEntryError({ error: _error, reset }: JournalEntryErrorProps) {
  return (
    <EditorialRouteError
      body="Refresh the page. If the issue remains, this note will return shortly."
      eyebrow="Journal"
      reset={reset}
      title="This journal entry is momentarily unavailable."
    />
  );
}
