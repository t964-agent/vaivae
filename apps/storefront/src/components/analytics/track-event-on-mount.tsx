"use client";

import { useEffect, useRef } from "react";

import { track, type AnalyticsEvent } from "@/lib/analytics/track";

type TrackEventOnMountProps = {
  event: AnalyticsEvent;
};

export function TrackEventOnMount({ event }: TrackEventOnMountProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    track(event);
  }, [event]);

  return null;
}
