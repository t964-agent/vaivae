"use client";

import { EditorialRouteError } from "@/components/editorial/editorial-route-error";

type LookbookErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LookbookError({ error: _error, reset }: LookbookErrorProps) {
  return (
    <EditorialRouteError
      body="Refresh the edit. If the issue remains, the lookbooks will return shortly."
      eyebrow="Lookbook"
      reset={reset}
      title="The lookbook archive is momentarily unavailable."
    />
  );
}
