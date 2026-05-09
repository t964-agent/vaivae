"use client";

import { EditorialRouteError } from "@/components/editorial/editorial-route-error";

type LookbookDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LookbookDetailError({ error: _error, reset }: LookbookDetailErrorProps) {
  return (
    <EditorialRouteError
      body="Refresh the frame. If the issue remains, this lookbook will return shortly."
      eyebrow="Lookbook"
      reset={reset}
      title="This lookbook is momentarily unavailable."
    />
  );
}
