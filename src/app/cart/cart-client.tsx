"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { CartItem } from "@/components/cart/cart-item";
import { formatPriceUSD } from "@/lib/orders";
import { BrassDivider } from "@/components/primitives/brass-divider";

export function CartClient() {
  const items = useCart((s) => s.items);
  const itemsTotal = useCart((s) => s.subtotalUSD());
  const bulkDiscount = useCart((s) => s.bulkDiscountUSD());
  const subtotal = useCart((s) => s.discountedSubtotalUSD());
  const belowMin = useCart((s) => s.belowCigaretteMinimum());
  const shortfall = useCart((s) => s.cigaretteShortfall());
  const count = items.reduce((sum, it) => sum + it.qty, 0);

  return (
    <div className="container mx-auto max-w-4xl px-6 py-16 md:py-24">
      <header className="mb-10">
        <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.4em] text-[0.7rem] text-[var(--color-brass-highlight)]">
          The Counter
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl tracking-[0.04em] text-[var(--color-parchment)]">
          Your selection
        </h1>
        <BrassDivider className="mt-5 max-w-[100px] opacity-60" />
        <p className="mt-4 font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)]">
          {count} {count === 1 ? "item" : "items"} on the counter.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-[family-name:var(--font-cinzel)] text-2xl text-[var(--color-parchment)]">
            The humidor is empty.
          </p>
          <p className="mt-3 font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)]">
            Browse the shelves at the counter — we&rsquo;ll wrap your selection.
          </p>
          <Link
            href="/cigarettes"
            className="inline-flex items-center justify-center mt-8 bg-[var(--color-brass)] hover:bg-[var(--color-brass-highlight)] text-[var(--color-oak-deep)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs px-9 py-4"
          >
            Step inside the shop
          </Link>
        </div>
      ) : (
        <>
          <ul className="border-t border-[var(--color-brass)]/20">
            {items.map((it) => (
              <CartItem
                key={`${it.productId}-${it.variantSize ?? "base"}-${it.flavour ?? "none"}`}
                item={it}
              />
            ))}
          </ul>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-6 border-t border-[var(--color-brass)]/30 pt-6">
            <div>
              {bulkDiscount > 0 && (
                <div
                  aria-live="polite"
                  className="flex items-baseline justify-between gap-8 mb-3 text-[var(--color-brass-highlight)]"
                >
                  <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem]">
                    Bulk discount
                  </span>
                  <span className="font-[family-name:var(--font-cinzel)] text-xl tabular-nums">
                    −{formatPriceUSD(bulkDiscount)}
                  </span>
                </div>
              )}
              {bulkDiscount > 0 && (
                <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.6rem] text-[var(--color-parchment-deep)]">
                  Item total <span className="line-through tabular-nums ml-2">{formatPriceUSD(itemsTotal)}</span>
                </p>
              )}
              <p className="mt-1 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-parchment-dim)]">
                Subtotal
              </p>
              <p className="font-[family-name:var(--font-cinzel)] text-3xl tabular-nums text-[var(--color-parchment)]">
                {formatPriceUSD(subtotal)}
              </p>
              <p className="mt-2 font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-parchment-deep)]">
                Cash on delivery. Driver confirms by phone.
              </p>
            </div>
            {belowMin ? (
              <Link
                href="/cigarettes"
                className="inline-flex items-center justify-center border border-[var(--color-brass)]/40 hover:border-[var(--color-brass-highlight)] text-[var(--color-parchment)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs px-9 py-4"
              >
                Browse cigarettes
              </Link>
            ) : (
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center bg-[var(--color-brass)] hover:bg-[var(--color-brass-highlight)] text-[var(--color-oak-deep)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs px-9 py-4 transition-all duration-300 hover:tracking-[0.34em]"
              >
                Proceed to checkout
              </Link>
            )}
          </div>
          {belowMin && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 border border-[var(--color-oxblood)]/45 bg-[var(--color-oxblood)]/10 px-5 py-4 font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment)]"
            >
              Cigarettes ship in pairs. Add{" "}
              <span className="font-[family-name:var(--font-libre-caslon)] not-italic uppercase tracking-[0.18em] text-[0.78em] text-[var(--color-brass-highlight)]">
                {shortfall} more pack{shortfall === 1 ? "" : "s"}
              </span>{" "}
              — any brand counts toward the minimum of 2.
            </div>
          )}
        </>
      )}
    </div>
  );
}
