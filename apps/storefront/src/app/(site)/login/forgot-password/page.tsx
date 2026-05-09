import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  alternates: { canonical: "/login/forgot-password" },
  robots: { follow: false, index: false },
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      body="Password reset stays within Medusa-native emailpass auth. If the email exists, Medusa Cloud Emails sends the reset link."
      eyebrow="Account"
      title="Recover access."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
