"use client";

import { LaunchIcon } from "@sanity/icons";
import type { DocumentActionComponent, DocumentActionDescription } from "sanity";

const medusaBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim().replace(/\/+$/, "");

function buildMedusaAdminProductUrl(productId: string | undefined): string | null {
  const trimmedProductId = productId?.trim();

  if (!medusaBackendUrl || !trimmedProductId) {
    return null;
  }

  return `${medusaBackendUrl}/app/products/${trimmedProductId}`;
}

export const OpenInMedusaAdminAction: DocumentActionComponent = (props) => {
  const url = buildMedusaAdminProductUrl(props.id);
  const disabledReason = props.id
    ? "Set NEXT_PUBLIC_MEDUSA_BACKEND_URL to open this product in Medusa Admin."
    : "Save this product before opening it in Medusa Admin.";

  return {
    disabled: !url,
    icon: LaunchIcon,
    label: "Open in Medusa Admin",
    onHandle: () => {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }

      props.onComplete();
    },
    title: url ? "Opens in a new tab" : disabledReason,
  } satisfies DocumentActionDescription;
};
