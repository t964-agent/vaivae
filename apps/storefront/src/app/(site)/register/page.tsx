import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSafeAuthRedirect } from "@/lib/auth/redirect";
import { isAuthenticated } from "@/medusa/customer";

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  alternates: { canonical: "/register" },
  robots: { follow: false, index: false },
  title: "Create account",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = getSafeAuthRedirect(params["next"]);

  if (await isAuthenticated()) {
    redirect(nextPath);
  }

  return (
    <AuthShell
      body="Guest checkout remains primary. Create an account only if saved addresses, history, and wishlist continuity are useful."
      eyebrow="Account"
      title="Keep the thread."
    >
      <RegisterForm nextPath={nextPath} />
    </AuthShell>
  );
}
