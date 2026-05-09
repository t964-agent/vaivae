"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useConsent } from "@/lib/consent/use-consent";
import { setAnalyticsConsent } from "@/lib/analytics/track";

import { GtmScript, GoogleConsentModeScript } from "./gtm-script";
import { KlaviyoOnsiteScript } from "./klaviyo-onsite-script";
import { PostHogProvider } from "./posthog-provider";
import { WebVitals } from "./web-vitals";

type AnalyticsProviderProps = {
  children: ReactNode;
  nonce?: string | undefined;
};

function isRestrictedAnalyticsPath(pathname: string | null): boolean {
  return Boolean(
    pathname &&
    (pathname === "/checkout" ||
      pathname.startsWith("/checkout/") ||
      pathname === "/account" ||
      pathname.startsWith("/account/")),
  );
}

export function AnalyticsProvider({ children, nonce }: AnalyticsProviderProps) {
  const consent = useConsent();
  const pathname = usePathname();
  const restrictedPath = isRestrictedAnalyticsPath(pathname);
  const analyticsEnabled = consent.ready && consent.analytics && !restrictedPath;
  const advertisingEnabled = consent.ready && consent.advertising && !restrictedPath;

  useEffect(() => {
    setAnalyticsConsent({ advertising: advertisingEnabled, analytics: analyticsEnabled });
  }, [advertisingEnabled, analyticsEnabled]);

  return (
    <PostHogProvider enabled={analyticsEnabled}>
      {children}
      <GoogleConsentModeScript nonce={nonce} />
      <GtmScript enabled={advertisingEnabled} nonce={nonce} />
      <KlaviyoOnsiteScript enabled={analyticsEnabled} nonce={nonce} />
      <WebVitals />
    </PostHogProvider>
  );
}
