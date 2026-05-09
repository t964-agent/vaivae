"use client";

import { Button, Stack } from "@/components/ui";

type AccountErrorStateProps = {
  reset: () => void;
};

export function AccountErrorState({ reset }: AccountErrorStateProps) {
  return (
    <div className="grid min-h-96 place-items-center border border-on-light/10 bg-on-light/[0.025] p-8 text-center">
      <Stack align="center" className="max-w-xl" gap={6}>
        <h2 className="font-display text-5xl leading-none font-light tracking-[-0.05em] text-on-light italic">
          This account view is momentarily unavailable.
        </h2>
        <p className="text-sm leading-6 text-on-light/60">
          Refresh this view. If the issue remains, return to account home.
        </p>
        <Button onClick={reset} type="button" variant="ghost">
          Try again
        </Button>
      </Stack>
    </div>
  );
}
