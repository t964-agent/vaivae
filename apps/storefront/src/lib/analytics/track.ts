"use client";

import posthog from "posthog-js";

export type AnalyticsEvent =
  | {
      name: "view_item";
      props: { currency: string; price: number; productId: string; productName: string };
    }
  | {
      name: "add_to_cart";
      props: { currency: string; price: number; quantity: number; variantId: string };
    }
  | { name: "begin_checkout"; props: { cartId: string; currency: string; value: number } }
  | { name: "view_cart"; props: { cartId: string; currency: string; value: number } }
  | { name: "purchase"; props: { currency: string; orderId: string; value: number } };

export type AnalyticsConsent = {
  advertising: boolean;
  analytics: boolean;
};

export type WebVitalMetric = {
  id: string;
  name: string;
  navigationType?: string | undefined;
  rating?: string | undefined;
  value: number;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  klaviyo?: {
    identify?: (profile: { email: string }) => Promise<unknown> | unknown;
    track?: (eventName: string, properties?: Record<string, unknown>) => Promise<unknown> | unknown;
  };
  _learnq?: unknown[];
};

let currentConsent: AnalyticsConsent = { advertising: false, analytics: false };
let postHogReady = false;

function getAnalyticsWindow(): AnalyticsWindow {
  return window as AnalyticsWindow;
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  currentConsent = consent;
  const analyticsWindow = getAnalyticsWindow();

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag =
    analyticsWindow.gtag ??
    ((...args: unknown[]) => {
      analyticsWindow.dataLayer?.push(args);
    });

  analyticsWindow.gtag?.("consent", "update", {
    ad_personalization: consent.advertising ? "granted" : "denied",
    ad_storage: consent.advertising ? "granted" : "denied",
    ad_user_data: consent.advertising ? "granted" : "denied",
    analytics_storage: consent.analytics ? "granted" : "denied",
  });
}

export function setPostHogReady(ready: boolean): void {
  postHogReady = ready;
}

export function track(event: AnalyticsEvent): void {
  if (!currentConsent.analytics) {
    return;
  }

  if (postHogReady) {
    posthog.capture(event.name, event.props);
  }

  if (currentConsent.advertising) {
    getAnalyticsWindow().dataLayer?.push({ event: event.name, ...event.props });
  }
}

export function trackWebVital(metric: WebVitalMetric): void {
  if (!currentConsent.analytics || !postHogReady) {
    return;
  }

  posthog.capture("web_vital", {
    id: metric.id,
    name: metric.name,
    navigation_type: metric.navigationType,
    rating: metric.rating,
    value: metric.value,
  });
}
