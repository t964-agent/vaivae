"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect, useRef, type ReactNode } from "react";

import { setPostHogReady } from "@/lib/analytics/track";

type PostHogProviderProps = {
  children: ReactNode;
  enabled: boolean;
};

let hasInitializedPostHog = false;

function PostHogPageviews({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !hasInitializedPostHog || !pathname) {
      return;
    }

    const queryString = searchParams.toString();
    const currentUrl = `${window.location.origin}${pathname}${queryString ? `?${queryString}` : ""}`;

    if (lastUrlRef.current === currentUrl) {
      return;
    }

    lastUrlRef.current = currentUrl;
    posthog.capture("$pageview", { $current_url: currentUrl, path: pathname });
  }, [enabled, pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children, enabled }: PostHogProviderProps) {
  useEffect(() => {
    const token = process.env["NEXT_PUBLIC_POSTHOG_KEY"]?.trim();
    const apiHost = process.env["NEXT_PUBLIC_POSTHOG_HOST"]?.trim() || "https://us.i.posthog.com";

    if (!enabled || !token) {
      if (hasInitializedPostHog) {
        posthog.opt_out_capturing();
      }

      setPostHogReady(false);
      return;
    }

    if (!hasInitializedPostHog) {
      posthog.init(token, {
        api_host: apiHost,
        autocapture: false,
        capture_pageleave: false,
        capture_pageview: false,
        disable_session_recording: true,
        loaded: (client) => {
          client.opt_in_capturing();
          setPostHogReady(true);
        },
        opt_out_capturing_by_default: true,
        opt_out_persistence_by_default: true,
        person_profiles: "identified_only",
      });
      hasInitializedPostHog = true;
      return;
    }

    posthog.opt_in_capturing();
    setPostHogReady(true);
  }, [enabled]);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageviews enabled={enabled} />
      </Suspense>
      {children}
    </PHProvider>
  );
}
