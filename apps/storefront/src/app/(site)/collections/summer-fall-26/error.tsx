"use client";

import { EditorialRouteError } from "@/components/editorial/editorial-route-error";

type SummerFall26ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function SummerFall26Error({ reset }: SummerFall26ErrorProps) {
  return (
    <EditorialRouteError
      body="Refresh the page to reload the runway frames."
      eyebrow="Collection"
      reset={reset}
      title="The collection is momentarily unavailable."
    />
  );
}
