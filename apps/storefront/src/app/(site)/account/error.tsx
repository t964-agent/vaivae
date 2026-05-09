"use client";

import { AccountErrorState } from "@/components/account/account-error-state";

type AccountErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AccountError({ reset }: AccountErrorProps) {
  return <AccountErrorState reset={reset} />;
}
