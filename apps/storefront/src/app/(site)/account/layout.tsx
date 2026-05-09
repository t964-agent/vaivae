import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Container, Stack } from "@/components/ui";
import { getCurrentCustomer } from "@/medusa/customer";

type AccountLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: {
    default: "Account",
    template: "%s | Account",
  },
};

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/login?next=/account");
  }

  return (
    <Container asChild variant="wide">
      <section className="pt-28 pb-20 md:pt-36 md:pb-28" aria-labelledby="account-heading">
        <Stack gap={12}>
          <Stack className="max-w-4xl" gap={6}>
            <SectionEyebrow>Account</SectionEyebrow>
            <SectionHeading as="h1" id="account-heading">
              A quieter <em>return</em>.
            </SectionHeading>
            <SectionBody>
              Review orders, care for saved addresses, and keep a considered list of pieces.
            </SectionBody>
          </Stack>

          <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
            <AccountNav
              customer={{
                firstName: customer.first_name ?? null,
                lastName: customer.last_name ?? null,
              }}
            />
            <div className="min-w-0">{children}</div>
          </div>
        </Stack>
      </section>
    </Container>
  );
}
