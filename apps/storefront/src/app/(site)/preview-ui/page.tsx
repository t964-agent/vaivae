import type { Metadata } from "next";

import { PreviewUiShowcase } from "./preview-ui-showcase";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "UI Preview — vaïvae",
};

export default function PreviewUiPage() {
  return <PreviewUiShowcase />;
}
