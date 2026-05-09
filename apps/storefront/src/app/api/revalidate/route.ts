import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";

type SanityWebhookPayload = {
  _id?: unknown;
  _type?: unknown;
  slug?: unknown;
};

type RevalidationDocument = {
  id?: string;
  slug?: string;
  type: string;
};

const tagsByDocumentType: Record<string, readonly string[]> = {
  footer: ["footer"],
  navigation: ["navigation"],
  siteSettings: ["site-settings"],
};

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getSlug(value: unknown): string | undefined {
  if (typeof value === "string") {
    return getString(value);
  }

  if (value && typeof value === "object" && "current" in value) {
    return getString(value.current);
  }

  return undefined;
}

function getRevalidationTags(type: string): readonly string[] {
  return tagsByDocumentType[type] ?? [];
}

function getDocument(payload: SanityWebhookPayload): RevalidationDocument | undefined {
  const type = getString(payload._type);

  if (!type) {
    return undefined;
  }

  const document: RevalidationDocument = { type };
  const id = getString(payload._id);
  const slug = getSlug(payload.slug);

  if (id) {
    document.id = id;
  }

  if (slug) {
    document.slug = slug;
  }

  return document;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("sanity-webhook-signature");

  if (!signature) {
    return NextResponse.json({ message: "Missing Sanity webhook signature" }, { status: 401 });
  }

  const { SANITY_REVALIDATE_SECRET } = getServerEnv();

  try {
    const { body, isValidSignature } = await parseBody<SanityWebhookPayload>(
      request,
      SANITY_REVALIDATE_SECRET,
      true,
    );

    if (isValidSignature !== true) {
      return NextResponse.json({ message: "Invalid Sanity webhook signature" }, { status: 401 });
    }

    if (!body) {
      return NextResponse.json({ message: "Malformed Sanity webhook payload" }, { status: 400 });
    }

    const document = getDocument(body);

    if (!document) {
      return NextResponse.json(
        { message: "Sanity webhook payload missing _type" },
        { status: 400 },
      );
    }

    const tags = getRevalidationTags(document.type);

    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }

    return NextResponse.json({
      document,
      revalidated: tags.length > 0,
      tags,
    });
  } catch {
    return NextResponse.json({ message: "Malformed Sanity webhook payload" }, { status: 400 });
  }
}
