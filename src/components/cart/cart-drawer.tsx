"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { CartItem } from "./cart-item";
import { formatPriceUSD } from "@/lib/orders";
import { BrassDivider } from "@/components/primitives/brass-divider";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const close = useCart((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const itemsTotal = useCart((s) => s.subtotalUSD());
  const bulkDiscount = useCart((s) => s.bulkDiscountUSD());
  const subtotal = useCart((s) => s.discountedSubtotalUSD());
  const belowMin = useCart((s) => s.belowCigaretteMinimum());
  const shortfall = useCart((s) => s.cigaretteShortfall());
  const count = items.reduce((sum, it) => sum + it.qty, 0);

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? null : close())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[var(--color-oak-medium)] border-l border-[var(--color-brass)]/30 text-[var(--color-parchment)] p-0 flex flex-col"
        aria-describedby="cart-desc"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[var(--color-brass)]/15">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.65rem] text-[var(--color-brass-highlight)]">
            Your selection
          </p>
          <SheetTitle className="font-[family-name:var(--font-cinzel)] text-2xl tracking-[0.06em] text-[var(--color-parchment)]">
            The Counter
          </SheetTitle>
          <SheetDescription
            id="cart-desc"
            className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)]"
          >
            Review your selection before proceeding to checkout.
          </SheetDescription>
          <p className="sr-only">
            {count} {count === 1 ? "item" : "items"} in cart.
          </p>
        </SheetHeader>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul>
                {items.map((it) => (
                  <CartItem
                    key={`${it.productId}-${it.variantSize ?? "base"}-${it.flavour ?? "none"}`}
                    item={it}
                  />
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6 pt-4 border-t border-[var(--color-brass)]/15 bg-[var(--color-ink)]/30 space-y-4">
              {bulkDiscount > 0 && (
                <div
                  aria-live="polite"
                  className="flex items-baseline justify-between text-[var(--color-brass-highlight)]"
                >
                  <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem]">
                    Bulk discount
                  </span>
                  <span className="font-[family-name:var(--font-cinzel)] text-lg tabular-nums">
                    −{formatPriceUSD(bulkDiscount)}
                  </span>
                </div>
              )}
              {bulkDiscount > 0 && (
                <div className="flex items-baseline justify-between text-[var(--color-parchment-deep)]">
                  <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem]">
                    Item total
                  </span>
                  <span className="font-[family-name:var(--font-libre-caslon)] tabular-nums text-sm line-through">
                    {formatPriceUSD(itemsTotal)}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-parchment-dim)]">
                  Subtotal
                </span>
                <span className="font-[family-name:var(--font-cinzel)] text-2xl tabular-nums text-[var(--color-parchment)]">
                  {formatPriceUSD(subtotal)}
                </span>
              </div>
              <p className="font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-parchment-deep)]">
                Cash on delivery. Your driver will confirm by phone.
              </p>
              {belowMin && (
                <div
                  role="status"
                  aria-live="polite"
                  className="border border-[var(--color-oxblood)]/45 bg-[var(--color-oxblood)]/10 px-4 py-3 text-sm font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment)]"
                >
                  Cigarettes ship in pairs. Add{" "}
                  <span className="font-[family-name:var(--font-libre-caslon)] not-italic uppercase tracking-[0.18em] text-[0.78em] text-[var(--color-brass-highlight)]">
                    {shortfall} more pack{shortfall === 1 ? "" : "s"}
                  </span>{" "}
                  — any brand counts toward the minimum of 2.
                </div>
              )}
              <BrassDivider className="opacity-40" />
              {belowMin ? (
                <Link
                  href="/cigarettes"
                  onClick={close}
                  className="block w-full text-center border border-[var(--color-brass)]/40 hover:border-[var(--color-brass-highlight)] text-[var(--color-parchment)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-sm py-3.5 transition-colors duration-200"
                >
                  Browse cigarettes
                </Link>
              ) : (
                <Link
                  href="/checkout"
                  onClick={close}
                  className="block w-full text-center bg-[var(--color-brass)] hover:bg-[var(--color-brass-highlight)] text-[var(--color-oak-deep)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-sm py-3.5 transition-colors duration-200"
                >
                  Proceed to checkout
                </Link>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
      <div className="w-20 h-20 mb-5 rounded-full border border-[var(--color-brass)]/30 flex items-center justify-center text-[var(--color-brass-highlight)]/60">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M3.5 5.5h2l2.2 11.2a1.5 1.5 0 0 0 1.47 1.2h8.66a1.5 1.5 0 0 0 1.48-1.27L20.5 8.5H7" />
          <circle cx="9.5" cy="20" r="1.2" />
          <circle cx="17.5" cy="20" r="1.2" />
        </svg>
      </div>
      <p className="font-[family-name:var(--font-cinzel)] text-xl tracking-[0.06em] text-[var(--color-parchment)]">
        The humidor is empty.
      </p>
      <p className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)] mt-2 max-w-xs">
        Browse the shelves at the counter — we&rsquo;ll wrap your selection here.
      </p>
      <Link
        href="/cigarettes"
        className="mt-6 inline-block font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-brass-highlight)] brass-underline"
      >
        Browse the shop
      </Link>
    </div>
  );
}
