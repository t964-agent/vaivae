"use client";

import { EditorialRouteError } from "@/components/editorial/editorial-route-error";

type CapsuleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CapsuleError({ error: _error, reset }: CapsuleErrorProps) {
  return (
    <EditorialRouteError
      body="Refresh the edit. If the issue remains, the capsule archive will return shortly."
      eyebrow="Capsules"
      reset={reset}
      title="The capsule archive is momentarily unavailable."
    />
  );
}
