import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button, Stack } from "@/components/ui";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  alternates: { canonical: "/login/reset-password" },
  robots: { follow: false, index: false },
  title: "Reset password",
};

function getSearchValue(value: string | string[] | undefined): string | undefined {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue?.trim();

  return normalizedValue || undefined;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = getSearchValue(params["token"]);
  const email = getSearchValue(params["email"]);

  return (
    <AuthShell
      body="Reset links are single-purpose. Choose a new password before returning to sign in."
      eyebrow="Account"
      title="Renew the key."
    >
      {token ? (
        <ResetPasswordForm email={email} token={token} />
      ) : (
        <Stack gap={4}>
          <h2 className="font-display text-3xl leading-none font-light tracking-[-0.05em] text-on-light italic">
            Reset link missing
          </h2>
          <p
            className="border-l border-accent-red pl-3 text-sm leading-6 text-on-light"
            role="alert"
          >
            Request a new reset email and open the link from your inbox.
          </p>
          <Button asChild className="w-fit" variant="underline">
            <Link href="/login/forgot-password">Request a new link</Link>
          </Button>
        </Stack>
      )}
    </AuthShell>
  );
}
