"use client";

import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastMessage = string;

function withDefaults(options?: ExternalToast): ExternalToast {
  return {
    duration: 4500,
    ...options,
  };
}

/** Opinionated sonner wrapper for storefront client feedback. */
export const toast = {
  success: (message: ToastMessage, options?: ExternalToast) =>
    sonnerToast.success(message, withDefaults(options)),
  error: (message: ToastMessage, options?: ExternalToast) =>
    sonnerToast.error(message, withDefaults(options)),
  info: (message: ToastMessage, options?: ExternalToast) =>
    sonnerToast.info(message, withDefaults(options)),
  warning: (message: ToastMessage, options?: ExternalToast) =>
    sonnerToast.warning(message, withDefaults(options)),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
};
