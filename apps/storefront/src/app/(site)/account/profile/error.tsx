"use client";

import { AccountErrorState } from "@/components/account/account-error-state";

type ProfileErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProfileError({ reset }: ProfileErrorProps) {
  return <AccountErrorState reset={reset} />;
}
