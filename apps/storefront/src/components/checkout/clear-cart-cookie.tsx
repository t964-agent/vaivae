"use client";

import { useEffect } from "react";

import { dispatchCartUpdated } from "@/lib/cart-events";
import { clearCartCookieAction } from "@/medusa/actions";

export function ClearCartCookie() {
  useEffect(() => {
    void clearCartCookieAction().then((result) => {
      if (result.ok) {
        dispatchCartUpdated(null);
      }
    });
  }, []);

  return null;
}
