"use client";

import { useCart } from "@/lib/cart-store";
import type { CartItem as CartItemT } from "@/types";
import { formatPriceUSD } from "@/lib/orders";
import { ProductMark } from "@/components/primitives/product-mark";

export function CartItem({ item }: { item: CartItemT }) {
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const key = {
    productId: item.productId,
    variantSize: item.variantSize,
    flavour: item.flavour,
  };

  return (
    <li className="flex gap-4 py-5 border-b border-[var(--color-brass)]/15">
      <div className="w-20 h-20 flex-shrink-0">
        <ProductMark brand={item.brand} name={item.name} slug={item.slug} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.65rem] text-[var(--color-brass-highlight)]">
          {item.brand}
        </p>
        <p className="font-[family-name:var(--font-cinzel)] text-base tracking-[0.04em] text-[var(--color-parchment)] leading-tight mt-0.5">
          {item.name}
        </p>
        {(item.variantSize || item.flavour) && (
          <p className="font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-parchment-deep)] mt-0.5">
            {[item.variantSize, item.flavour].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div
            role="group"
            aria-label={`Quantity for ${item.name}`}
            className="inline-flex items-center border border-[var(--color-brass)]/30"
          >
            <button
              type="button"
              onClick={() => decrement(key)}
              aria-label={`Decrease quantity of ${item.name}`}
              className="w-7 h-7 inline-flex items-center justify-center text-[var(--color-parchment)] hover:bg-[var(--color-brass)]/10 transition-colors"
            >
              −
            </button>
            <span
              aria-hidden="true"
              className="w-8 text-center font-[family-name:var(--font-libre-caslon)] tabular-nums text-sm"
            >
              {item.qty}
            </span>
            <span className="sr-only">Current quantity {item.qty}.</span>
            <button
              type="button"
              onClick={() => increment(key)}
              aria-label={`Increase quantity of ${item.name}`}
              className="w-7 h-7 inline-flex items-center justify-center text-[var(--color-parchment)] hover:bg-[var(--color-brass)]/10 transition-colors"
            >
              +
            </button>
          </div>
          <p className="font-[family-name:var(--font-libre-caslon)] tabular-nums text-[var(--color-parchment)]">
            {formatPriceUSD(item.unitPriceUSD * item.qty)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => remove(key)}
          className="mt-2 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.6rem] text-[var(--color-parchment-deep)] hover:text-[var(--color-oxblood)] transition-colors"
        >
          Remove<span className="sr-only">: {item.name}</span>
        </button>
      </div>
    </li>
  );
}
