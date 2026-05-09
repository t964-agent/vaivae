"use client";

import { AccountErrorState } from "@/components/account/account-error-state";

type AddressesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AddressesError({ reset }: AddressesErrorProps) {
  return <AccountErrorState reset={reset} />;
}
