import { EditorialNotFoundState } from "@/components/editorial/editorial-route-state";

export default function JournalEntryNotFound() {
  return (
    <EditorialNotFoundState
      body="The note may be unpublished, renamed, or held for a later release."
      ctaHref="/journal"
      ctaLabel="Return to journal"
      title="This field note has not been placed."
    />
  );
}
