"use client";

import { AccountErrorState } from "@/components/account/account-error-state";

type WishlistErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function WishlistError({ reset }: WishlistErrorProps) {
  return <AccountErrorState reset={reset} />;
}
