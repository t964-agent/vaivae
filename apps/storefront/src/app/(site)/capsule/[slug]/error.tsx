"use client";

import { EditorialRouteError } from "@/components/editorial/editorial-route-error";

type CapsuleDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CapsuleDetailError({ error: _error, reset }: CapsuleDetailErrorProps) {
  return (
    <EditorialRouteError
      body="Refresh the landing. If the issue remains, this capsule will return shortly."
      eyebrow="Capsule"
      reset={reset}
      title="This capsule is momentarily unavailable."
    />
  );
}
