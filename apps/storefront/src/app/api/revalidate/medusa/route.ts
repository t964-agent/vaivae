import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MedusaWebhookPayload = {
  data?: unknown;
  event?: unknown;
  event_name?: unknown;
  id?: unknown;
  product_id?: unknown;
  type?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getEventType(payload: MedusaWebhookPayload): string | undefined {
  return getString(payload.event) ?? getString(payload.type) ?? getString(payload.event_name);
}

function getProductId(payload: MedusaWebhookPayload): string | undefined {
  if (isRecord(payload.data)) {
    return getString(payload.data["product_id"]) ?? getString(payload.data["id"]);
  }

  return getString(payload.product_id) ?? getString(payload.id);
}

function getRevalidationTags(payload: MedusaWebhookPayload): string[] {
  const eventType = getEventType(payload);
  const productId = getProductId(payload);
  const tags = new Set<string>();

  switch (eventType) {
    case "product.created":
    case "product.updated":
    case "product.deleted":
      tags.add("product");
      tags.add("products");

      if (productId) {
        tags.add(`product:${productId}`);
      }

      break;
    case "inventory.changed":
    case "inventory_item.updated":
    case "inventory.updated":
      tags.add("inventory");
      break;
    default:
      break;
  }

  return Array.from(tags);
}

export async function POST(request: NextRequest) {
  const { MEDUSA_REVALIDATE_SECRET } = getServerEnv();

  if (!MEDUSA_REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: "Medusa revalidation secret is not configured" },
      { status: 500 },
    );
  }

  const secret = request.headers.get("x-vaivae-webhook-secret");

  if (secret !== MEDUSA_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid Medusa webhook secret" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Malformed Medusa webhook payload" }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ message: "Malformed Medusa webhook payload" }, { status: 400 });
  }

  const typedPayload: MedusaWebhookPayload = payload;
  const eventType = getEventType(typedPayload);

  if (!eventType) {
    return NextResponse.json(
      { message: "Medusa webhook payload missing event type" },
      { status: 400 },
    );
  }

  const tags = getRevalidationTags(typedPayload);

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ event: eventType, revalidated: tags.length > 0, tags });
}
