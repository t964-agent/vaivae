"use client";

import * as Sentry from "@sentry/nextjs";
import { useReportWebVitals } from "next/web-vitals";

import { trackWebVital } from "@/lib/analytics/track";

const reportedMetricNames = new Set(["CLS", "INP", "LCP"]);

const reportWebVitals: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  if (!reportedMetricNames.has(metric.name)) {
    return;
  }

  const attributes = {
    id: metric.id,
    name: metric.name,
    navigation_type: metric.navigationType,
    rating: metric.rating,
  };

  if (metric.name === "CLS") {
    Sentry.metrics.distribution("web_vitals.cls", metric.value, { attributes });
  } else {
    Sentry.metrics.distribution(`web_vitals.${metric.name.toLowerCase()}`, metric.value, {
      attributes,
      unit: "millisecond",
    });
  }

  trackWebVital({
    id: metric.id,
    name: metric.name,
    navigationType: metric.navigationType,
    rating: metric.rating,
    value: metric.value,
  });
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);

  return null;
}
