import type { Metadata } from "next";

import { MarketingPreferencesForm } from "@/components/account/marketing-preferences-form";

export const metadata: Metadata = {
  title: "Marketing preferences",
};

export default function MarketingPreferencesPage() {
  return (
    <section className="border border-on-light/10 bg-on-light/[0.025] p-5 md:p-6">
      <MarketingPreferencesForm initialSubscribed={false} />
    </section>
  );
}
