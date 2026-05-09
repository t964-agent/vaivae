import { EditorialNotFoundState } from "@/components/editorial/editorial-route-state";

export default function CapsuleNotFound() {
  return (
    <EditorialNotFoundState
      body="The capsule may be unpublished, renamed, or held for a future drop."
      ctaHref="/capsule"
      ctaLabel="Return to capsules"
      title="This capsule has not opened."
    />
  );
}
