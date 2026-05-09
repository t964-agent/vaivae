"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

const newsletterActionSchema = z.object({
  consent: z.literal(true, { error: "Please confirm you want to receive the editorial." }),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export type NewsletterActionResult = { ok: true } | { error: string; ok: false };

function getValidationMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check your email and consent.";
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

    // Klaviyo wiring and durable consent storage are intentionally deferred to Agent 23.
    return { ok: true };
  } catch {
    return { error: "Unable to receive your request. Try again in a moment.", ok: false };
  }
}
