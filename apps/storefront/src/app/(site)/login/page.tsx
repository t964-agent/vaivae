import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeAuthRedirect } from "@/lib/auth/redirect";
import { isAuthenticated } from "@/medusa/customer";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  alternates: { canonical: "/login" },
  robots: { follow: false, index: false },
  title: "Sign in",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeAuthRedirect(params["next"]);

  if (await isAuthenticated()) {
    redirect(nextPath);
  }

  return (
    <AuthShell
      body="Authentication is optional in Phase 1. Sign in when you want saved addresses, order history, and wishlist continuity."
      eyebrow="Account"
      title="A quieter return."
    >
      <LoginForm nextPath={nextPath} resetSuccess={params["reset"] === "success"} />
    </AuthShell>
  );
}
