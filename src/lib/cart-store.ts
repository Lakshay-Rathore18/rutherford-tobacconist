"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { minQtyFor, bulkDiscountForPacks } from "@/lib/products";

type LineKey = {
  productId: string;
  variantSize?: string;
  flavour?: string;
};

type CartStore = {
  items: CartItem[];
  open: boolean;

  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (key: LineKey) => void;
  setQty: (key: LineKey, qty: number) => void;
  increment: (key: LineKey) => void;
  decrement: (key: LineKey) => void;
  clear: () => void;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  count: () => number;
  /** Raw item total before any discounts. */
  subtotalUSD: () => number;
  /** Total number of cigarette packs across all cigarette lines in cart. */
  cigarettePackCount: () => number;
  /** $5 off for every 10 cigarette packs. Stackable, floored. */
  bulkDiscountUSD: () => number;
  /** subtotalUSD - bulkDiscountUSD, floored at 0. */
  discountedSubtotalUSD: () => number;
};

const sameLine = (a: CartItem, key: LineKey) =>
  a.productId === key.productId &&
  (a.variantSize ?? null) === (key.variantSize ?? null) &&
  (a.flavour ?? null) === (key.flavour ?? null);

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,

      add: (incoming) => {
        const min = minQtyFor(incoming.category);
        const qtyToAdd = Math.max(min, incoming.qty ?? min);
        set((state) => {
          const idx = state.items.findIndex((it) => sameLine(it, incoming));
          if (idx >= 0) {
            const next = [...state.items];
            next[idx] = { ...next[idx], qty: next[idx].qty + qtyToAdd };
            return { items: next };
          }
          return { items: [...state.items, { ...incoming, qty: qtyToAdd }] };
        });
      },

      remove: (key) =>
        set((state) => ({
          items: state.items.filter((it) => !sameLine(it, key)),
        })),

      setQty: (key, qty) =>
        set((state) => ({
          items: state.items.map((it) => {
            if (!sameLine(it, key)) return it;
            const min = minQtyFor(it.category);
            return { ...it, qty: Math.max(min, qty) };
          }),
        })),

      increment: (key) =>
        set((state) => ({
          items: state.items.map((it) =>
            sameLine(it, key) ? { ...it, qty: it.qty + 1 } : it,
          ),
        })),

      /** Decrement respects category min. To remove a line entirely the
       *  user must use the explicit Remove button (so they never
       *  accidentally delete a paired-cigarette line by hammering −). */
      decrement: (key) =>
        set((state) => ({
          items: state.items.map((it) => {
            if (!sameLine(it, key)) return it;
            const min = minQtyFor(it.category);
            return { ...it, qty: Math.max(min, it.qty - 1) };
          }),
        })),

      clear: () => set({ items: [] }),

      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
      toggleCart: () => set((s) => ({ open: !s.open })),

      count: () => get().items.reduce((sum, it) => sum + it.qty, 0),
      subtotalUSD: () =>
        get().items.reduce((sum, it) => sum + it.unitPriceUSD * it.qty, 0),
      cigarettePackCount: () =>
        get()
          .items.filter((it) => it.category === "cigarettes")
          .reduce((sum, it) => sum + it.qty, 0),
      bulkDiscountUSD: () => bulkDiscountForPacks(get().cigarettePackCount()),
      discountedSubtotalUSD: () =>
        Math.max(0, get().subtotalUSD() - get().bulkDiscountUSD()),
    }),
    {
      name: "rt_cart",
      // Bump from v1 → v2: CartItem now carries optional `flavour`.
      // v1 carts hydrate cleanly (undefined flavour on old lines).
      version: 2,
      // Skip automatic rehydration during SSR — CartHydration component
      // calls rehydrate() on mount to avoid server/client HTML mismatch.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
