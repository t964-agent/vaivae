"use client";

import { AccountErrorState } from "@/components/account/account-error-state";

type OrdersErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function OrdersError({ reset }: OrdersErrorProps) {
  return <AccountErrorState reset={reset} />;
}
