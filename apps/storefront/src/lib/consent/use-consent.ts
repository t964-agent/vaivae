"use client";

import { useEffect, useState } from "react";

export type ConsentState = {
  advertising: boolean;
  analytics: boolean;
  ready: boolean;
};

type TermlyApi = {
  getConsentState?: () => unknown;
  on?: (event: "consent" | "initialized", callback: (data: unknown) => void) => unknown;
};

type WindowWithTermly = Window & {
  Termly?: TermlyApi;
};

const initialConsentState: ConsentState = {
  advertising: false,
  analytics: false,
  ready: false,
};
const deniedReadyConsentState: ConsentState = {
  advertising: false,
  analytics: false,
  ready: true,
};
const termlyBridgeEventName = "termly:event";
const gtmConsentStorageKey = "termly_gtm_template_default_consents";

let hasInstalledTermlyBridge = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTermly(): TermlyApi | undefined {
  return (window as WindowWithTermly).Termly;
}

function normalizeConsent(input: unknown): ConsentState | null {
  if (!isRecord(input)) {
    return null;
  }

  if ("consentState" in input) {
    return normalizeConsent(input["consentState"]);
  }

  if (Array.isArray(input["categories"])) {
    const categories = new Set(
      input["categories"].filter((category): category is string => typeof category === "string"),
    );

    return {
      advertising: categories.has("advertising"),
      analytics: categories.has("analytics"),
      ready: true,
    };
  }

  if (typeof input["analytics"] === "boolean" || typeof input["advertising"] === "boolean") {
    return {
      advertising: input["advertising"] === true,
      analytics: input["analytics"] === true,
      ready: true,
    };
  }

  return null;
}

function readTermlyConsent(): ConsentState | null {
  try {
    return normalizeConsent(getTermly()?.getConsentState?.());
  } catch {
    return null;
  }
}

function readStoredGtmConsent(): ConsentState | null {
  try {
    const rawValue = window.localStorage.getItem(gtmConsentStorageKey);

    if (!rawValue) {
      return null;
    }

    const value = JSON.parse(rawValue) as unknown;

    if (!isRecord(value)) {
      return null;
    }

    const advertisingFields = [
      value["ad_storage"],
      value["ad_user_data"],
      value["ad_personalization"],
    ];
    const hasKnownConsentValue =
      value["analytics_storage"] === "granted" ||
      value["analytics_storage"] === "denied" ||
      advertisingFields.some((field) => field === "granted" || field === "denied");

    if (!hasKnownConsentValue) {
      return null;
    }

    return {
      advertising: advertisingFields.every((field) => field === "granted"),
      analytics: value["analytics_storage"] === "granted",
      ready: true,
    };
  } catch {
    return null;
  }
}

function installTermlyBridge(): void {
  const termly = getTermly();

  if (hasInstalledTermlyBridge || typeof termly?.on !== "function") {
    return;
  }

  hasInstalledTermlyBridge = true;
  termly.on("initialized", () => {
    window.dispatchEvent(new CustomEvent(termlyBridgeEventName));
  });
  termly.on("consent", (data) => {
    window.dispatchEvent(new CustomEvent(termlyBridgeEventName, { detail: data }));
  });
}

export function useConsent(): ConsentState {
  const [consent, setConsent] = useState<ConsentState>(initialConsentState);

  useEffect(() => {
    let disposed = false;

    function refreshConsent(payload?: unknown, readyOnMissing = false): void {
      const nextConsent =
        readTermlyConsent() ?? normalizeConsent(payload) ?? readStoredGtmConsent();

      if (!disposed) {
        setConsent(nextConsent ?? (readyOnMissing ? deniedReadyConsentState : initialConsentState));
      }
    }

    function handleConsentEvent(event: Event): void {
      refreshConsent(event instanceof CustomEvent ? event.detail : undefined, true);
    }

    installTermlyBridge();
    refreshConsent();

    window.addEventListener(termlyBridgeEventName, handleConsentEvent);
    window.addEventListener("Termly.consentSaveDone", handleConsentEvent);
    window.addEventListener("userPrefUpdate", handleConsentEvent);

    const pollInterval = window.setInterval(() => {
      installTermlyBridge();
      refreshConsent();
    }, 250);
    const stopPollingTimeout = window.setTimeout(() => window.clearInterval(pollInterval), 5000);

    return () => {
      disposed = true;
      window.clearInterval(pollInterval);
      window.clearTimeout(stopPollingTimeout);
      window.removeEventListener(termlyBridgeEventName, handleConsentEvent);
      window.removeEventListener("Termly.consentSaveDone", handleConsentEvent);
      window.removeEventListener("userPrefUpdate", handleConsentEvent);
    };
  }, []);

  return consent;
}
