"use client";

import { EditorialRouteError } from "@/components/editorial/editorial-route-error";

type CollectionDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CollectionDetailError({ error: _error, reset }: CollectionDetailErrorProps) {
  return (
    <EditorialRouteError
      body="Refresh the page to reload the runway frames."
      eyebrow="Collection"
      reset={reset}
      title="The collection is momentarily unavailable."
    />
  );
}
