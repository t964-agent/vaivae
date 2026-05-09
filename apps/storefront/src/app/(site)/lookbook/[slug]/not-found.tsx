import { EditorialNotFoundState } from "@/components/editorial/editorial-route-state";

export default function LookbookNotFound() {
  return (
    <EditorialNotFoundState
      body="The lookbook may be unpublished, renamed, or still being prepared for release."
      ctaHref="/lookbook"
      ctaLabel="Return to lookbook"
      title="This lookbook is still in the darkroom."
    />
  );
}
