"use client";

import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";

export type VisuallyHiddenProps = ComponentPropsWithoutRef<typeof VisuallyHiddenPrimitive.Root>;

/** Visually hides content while keeping it available to assistive technology. */
const VisuallyHidden = forwardRef<
  ComponentRef<typeof VisuallyHiddenPrimitive.Root>,
  VisuallyHiddenProps
>(function VisuallyHidden(props, ref) {
  return <VisuallyHiddenPrimitive.Root ref={ref} {...props} />;
});
VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
