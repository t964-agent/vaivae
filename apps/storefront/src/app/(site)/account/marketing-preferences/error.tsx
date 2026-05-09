"use client";

import { AccountErrorState } from "@/components/account/account-error-state";

type MarketingPreferencesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketingPreferencesError({ reset }: MarketingPreferencesErrorProps) {
  return <AccountErrorState reset={reset} />;
}
