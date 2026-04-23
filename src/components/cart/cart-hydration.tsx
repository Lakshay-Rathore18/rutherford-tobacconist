"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/**
 * Rehydrates the Zustand cart-store from localStorage AFTER mount.
 * Pairs with `skipHydration: true` in the store definition. Prevents the
 * server/client HTML mismatch that would otherwise occur when SSR emits
 * an empty cart but the client has items in localStorage.
 */
export function CartHydration() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);
  return null;
}
