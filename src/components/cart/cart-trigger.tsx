"use client";

import { useCart } from "@/lib/cart-store";

export function CartTrigger() {
  const open = useCart((s) => s.openCart);
  const items = useCart((s) => s.items);
  // Derived during render — Zustand uses skipHydration + CartHydration
  // rehydrates after mount, so SSR and first client render both see items=[]
  // (count=0). No mismatch, no need for a mounted flag.
  const count = items.reduce((sum, it) => sum + it.qty, 0);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="group relative inline-flex items-center gap-2.5 px-3 py-2 text-[var(--color-parchment)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.7rem] hover:text-[var(--color-brass-highlight)] transition-colors duration-200 brass-underline"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M3.5 5.5h2l2.2 11.2a1.5 1.5 0 0 0 1.47 1.2h8.66a1.5 1.5 0 0 0 1.48-1.27L20.5 8.5H7" />
        <circle cx="9.5" cy="20" r="1.2" />
        <circle cx="17.5" cy="20" r="1.2" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      <span
        className="ml-0.5 inline-flex items-center justify-center min-w-[1.4rem] h-[1.4rem] px-1.5 rounded-full bg-[var(--color-brass)] text-[var(--color-oak-deep)] text-[0.7rem] font-bold tabular-nums"
        aria-hidden="true"
      >
        {count}
      </span>
    </button>
  );
}
