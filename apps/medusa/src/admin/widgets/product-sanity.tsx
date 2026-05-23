import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminProduct, DetailWidgetProps } from "@medusajs/types";
import { Badge, Button, Container, Text, toast } from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { sdk } from "../lib/client";

type DriftField = "title" | "handle" | "mirrorMaterials";

type SanitySyncDrift = {
  field: DriftField;
  medusa: unknown;
  sanity: unknown;
};

type SanitySyncStatus = {
  productId: string;
  medusa: {
    title: string | null;
    handle: string | null;
    materials: string[];
  };
  sanity: {
    title: string | null;
    handle: string | null;
    mirrorMaterials: string[];
    exists: boolean;
  };
  inSync: boolean;
  drift: SanitySyncDrift[];
};

type StatusBadgeConfig = {
  color: "green" | "orange" | "grey";
  label: string;
};

const studioBaseUrl = normalizeBaseUrl(import.meta.env.VITE_SANITY_STUDIO_URL);

function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed.replace(/\/+$/, "") : null;
}

function getStatusQueryKey(productId: string): ["sanity-sync-status", string] {
  return ["sanity-sync-status", productId];
}

function getStatusBadge(status: SanitySyncStatus): StatusBadgeConfig {
  if (!status.sanity.exists) {
    return { color: "grey", label: "Not mirrored yet" };
  }

  if (status.inSync) {
    return { color: "green", label: "In sync" };
  }

  return { color: "orange", label: "Drifted" };
}

function getFieldLabel(field: DriftField): string {
  switch (field) {
    case "handle":
      return "Handle";
    case "mirrorMaterials":
      return "Materials";
    case "title":
      return "Title";
  }
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    const items = value.filter((item): item is string => typeof item === "string");

    return items.length > 0 ? items.join(", ") : "None";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed || "Not set";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "Not set";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Try again or check the Medusa logs.";
}

function buildStudioProductUrl(productId: string): string | null {
  if (!studioBaseUrl) {
    return null;
  }

  return `${studioBaseUrl}/intent/edit/id=${encodeURIComponent(productId)};type=product/`;
}

function DriftComparison({ drift }: { drift: SanitySyncDrift[] }) {
  return (
    <div className="flex flex-col gap-y-2">
      <Text size="small" leading="compact" weight="plus">
        Drifted fields
      </Text>
      <div className="rounded-rounded border-ui-border-base overflow-hidden border">
        <div className="bg-ui-bg-subtle grid grid-cols-[0.8fr_1fr_1fr] gap-x-2 px-3 py-2">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Field
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Medusa
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Sanity
          </Text>
        </div>
        {drift.map((item) => (
          <div
            key={item.field}
            className="border-ui-border-base grid grid-cols-[0.8fr_1fr_1fr] gap-x-2 border-t px-3 py-2"
          >
            <Text size="small" leading="compact" weight="plus">
              {getFieldLabel(item.field)}
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle break-words">
              {formatValue(item.medusa)}
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle break-words">
              {formatValue(item.sanity)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

const ProductSanityWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const productId = data.id;
  const queryClient = useQueryClient();
  const statusQueryKey = getStatusQueryKey(productId);
  const studioProductUrl = buildStudioProductUrl(productId);

  const statusQuery = useQuery({
    queryFn: () => sdk.client.fetch<SanitySyncStatus>(`/admin/sanity/status/${productId}`),
    queryKey: statusQueryKey,
  });

  const resyncMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/sanity/resync/${productId}`, {
        method: "POST",
      }),
    onError: (error) => {
      toast.error("Sanity resync failed", {
        description: getErrorMessage(error),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: statusQueryKey });
      toast.success("Sanity resync complete");
    },
  });

  const status = statusQuery.data;
  const badge = status ? getStatusBadge(status) : null;
  const drift = status?.sanity.exists && !status.inSync ? status.drift : [];

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-x-3 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Sanity sync
        </Text>
        {badge ? (
          <Badge size="2xsmall" color={badge.color} rounded="full">
            {badge.label}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-col gap-y-4 px-6 py-4">
        {statusQuery.isLoading ? (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Loading sync status...
          </Text>
        ) : null}

        {statusQuery.isError ? (
          <Text size="small" leading="compact" className="text-ui-fg-error">
            Unable to load Sanity sync status.
          </Text>
        ) : null}

        {drift.length > 0 ? <DriftComparison drift={drift} /> : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            isLoading={resyncMutation.isPending}
            disabled={resyncMutation.isPending}
            onClick={() => resyncMutation.mutate()}
          >
            Resync now
          </Button>
          {studioProductUrl ? (
            <Button size="small" variant="transparent" asChild>
              <a href={studioProductUrl} target="_blank" rel="noreferrer">
                Open in Sanity Studio
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
});

export default ProductSanityWidget;
