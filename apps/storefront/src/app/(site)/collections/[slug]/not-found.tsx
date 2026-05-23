import { EditorialNotFoundState } from "@/components/editorial/editorial-route-state";

export default function CollectionNotFound() {
  return (
    <EditorialNotFoundState
      body="The collection may be unpublished, renamed, or held for a later release."
      ctaHref="/"
      ctaLabel="Return home"
      eyebrow="Collection"
      title="This collection has not been placed."
    />
  );
}
