"use client";

import { AccountErrorState } from "@/components/account/account-error-state";

type OrderDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function OrderDetailError({ reset }: OrderDetailErrorProps) {
  return <AccountErrorState reset={reset} />;
}
