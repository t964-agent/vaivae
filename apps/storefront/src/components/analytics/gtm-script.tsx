"use client";

import Script from "next/script";

type AnalyticsScriptProps = {
  enabled?: boolean | undefined;
  nonce?: string | undefined;
};

function getGtmId(): string | undefined {
  const gtmId = process.env["NEXT_PUBLIC_GTM_ID"]?.trim();

  return gtmId || undefined;
}

export function GoogleConsentModeScript({ nonce }: AnalyticsScriptProps) {
  if (!getGtmId()) {
    return null;
  }

  return (
    <Script id="google-consent-mode-default" nonce={nonce} strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500
        });
        gtag('set', 'ads_data_redaction', true);
      `}
    </Script>
  );
}

export function GtmScript({ enabled = false, nonce }: AnalyticsScriptProps) {
  const gtmId = getGtmId();

  if (!enabled || !gtmId) {
    return null;
  }

  return (
    <Script
      id="google-tag-manager"
      nonce={nonce}
      src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`}
      strategy="afterInteractive"
    />
  );
}
