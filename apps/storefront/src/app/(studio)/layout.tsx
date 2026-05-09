import type { ReactNode } from "react";

export { metadata, viewport } from "next-sanity/studio";

type StudioLayoutProps = {
  children: ReactNode;
};

export default function StudioLayout({ children }: StudioLayoutProps) {
  return children;
}
