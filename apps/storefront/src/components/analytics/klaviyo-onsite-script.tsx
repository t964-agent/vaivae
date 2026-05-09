"use client";

import Script from "next/script";

type KlaviyoOnsiteScriptProps = {
  enabled: boolean;
  nonce?: string | undefined;
};

function getKlaviyoPublicKey(): string | undefined {
  const publicKey = process.env["NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY"]?.trim();

  return publicKey || undefined;
}

export function KlaviyoOnsiteScript({ enabled, nonce }: KlaviyoOnsiteScriptProps) {
  const publicKey = getKlaviyoPublicKey();

  if (!enabled || !publicKey) {
    return null;
  }

  return (
    <>
      <Script id="klaviyo-onsite-stub" nonce={nonce} strategy="afterInteractive">
        {`
          window._learnq = window._learnq || [];
          window.klaviyo = window.klaviyo || [];
        `}
      </Script>
      <Script
        id="klaviyo-onsite"
        nonce={nonce}
        src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${encodeURIComponent(publicKey)}`}
        strategy="afterInteractive"
      />
    </>
  );
}
