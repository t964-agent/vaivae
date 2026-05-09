"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { getPublicEnv } from "@/lib/env";

const newsletterActionSchema = z.object({
  consent: z.literal(true, { error: "Please confirm you want to receive the editorial." }),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export type NewsletterActionResult = { ok: true } | { error: string; ok: false };

function getValidationMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check your email and consent.";
}

function getMedusaBaseUrl(): string {
  return getPublicEnv().NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/+$/, "");
}

async function postNewsletterSubscription(input: { email: string; consent: true }): Promise<void> {
  const { NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY } = getPublicEnv();
  const response = await fetch(`${getMedusaBaseUrl()}/store/newsletter`, {
    body: JSON.stringify({
      consent: input.consent,
      email: input.email,
      source: "site-footer",
    }),
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-publishable-api-key": NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Newsletter subscription request failed.");
  }
}

export async function subscribeNewsletterAction(input: unknown): Promise<NewsletterActionResult> {
  const parsed = newsletterActionSchema.safeParse(input);

  if (!parsed.success) {
    return { error: getValidationMessage(parsed.error), ok: false };
  }

  try {
    Sentry.addBreadcrumb({
      category: "newsletter",
      data: {
        consent: parsed.data.consent,
        source: "site-footer",
      },
      level: "info",
      message: "Newsletter subscription intent captured.",
    });

    await postNewsletterSubscription(parsed.data);

    return { ok: true };
  } catch {
    return { error: "Unable to receive your request. Try again in a moment.", ok: false };
  }
}
