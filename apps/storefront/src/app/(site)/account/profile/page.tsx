import type { Metadata } from "next";

import { PasswordForm, ProfileForm } from "@/components/account/profile-forms";
import { Stack } from "@/components/ui";
import { getCurrentCustomer } from "@/medusa/customer";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const customer = await getCurrentCustomer();

  return (
    <Stack gap={10}>
      <section className="border border-on-light/10 bg-on-light/[0.025] p-5 md:p-6">
        <ProfileForm
          customer={{
            email: customer?.email ?? "",
            firstName: customer?.first_name ?? "",
            lastName: customer?.last_name ?? "",
            phone: customer?.phone ?? "",
          }}
        />
      </section>
      <section className="border border-on-light/10 bg-on-light/[0.025] p-5 md:p-6">
        <PasswordForm />
      </section>
    </Stack>
  );
}
