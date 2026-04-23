"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart-store";
import { formatPriceUSD } from "@/lib/orders";
import { minQtyForProduct, minQtyLabel } from "@/lib/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { VariantSelector } from "./variant-selector";
import { FlavourSelector } from "./flavour-selector";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { useStockEntry, useStockAnnounce } from "./stock-provider";
import {
  isFamilyOutOfStock,
  flavourIsAvailable,
  variantIsAvailable,
} from "@/lib/stock";

type Props = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element to return focus to after the dialog closes. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};

/**
 * Outer wrapper holds only the Dialog primitives. The body component is
 * conditionally rendered on `open` so its `useState` initializers fire
 * once per open — replaces the previous useEffect-on-open reset and
 * silences `react-hooks/set-state-in-effect`. Keying by product.id also
 * forces a fresh body if the parent swaps products while the dialog
 * happens to be open.
 */
export function QuickAddDialog({
  product,
  open,
  onOpenChange,
  returnFocusRef,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentSlot>
        {open && (
          <QuickAddBody
            key={product.id}
            product={product}
            onClose={() => onOpenChange(false)}
            returnFocusRef={returnFocusRef}
          />
        )}
      </DialogContentSlot>
    </Dialog>
  );
}

/**
 * Thin wrapper so the DialogContent's aria attributes (which need the
 * title/description IDs from inside the body) can be set against the
 * actual content tree without the body needing to thread IDs back up.
 */
function DialogContentSlot({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function QuickAddBody({
  product,
  onClose,
  returnFocusRef,
}: {
  product: Product;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.openCart);

  const hasVariants = !!product.variants && product.variants.length > 0;
  const hasFlavours = !!product.flavours && product.flavours.length > 0;
  const minQty = minQtyForProduct(product);
  const minLabel = minQtyLabel(product.category);

  const titleId = useId();
  const descId = useId();
  const variantLabelId = useId();
  const flavourLabelId = useId();

  const stockEntry = useStockEntry(product.id);
  const announce = useStockAnnounce();

  const unavailableFlavours = hasFlavours
    ? new Set(product.flavours!.filter((f) => !flavourIsAvailable(stockEntry, f)))
    : undefined;
  const unavailableVariants = hasVariants
    ? new Set(
        product.variants!
          .map((v) => v.size)
          .filter((s) => !variantIsAvailable(stockEntry, s)),
      )
    : undefined;

  const firstAvailableVariant = hasVariants
    ? (product.variants!.find((v) => !unavailableVariants!.has(v.size))?.size ??
        product.variants![0].size)
    : "";
  const firstAvailableFlavour = hasFlavours
    ? (product.flavours!.find((f) => !unavailableFlavours!.has(f)) ??
        product.flavours![0])
    : "";

  // useState initializers run exactly once at mount. Since this component
  // mounts on every dialog open (and is keyed by product.id), we always
  // start at the first IN-STOCK option without any useEffect-based reset.
  const [variantSize, setVariantSize] = useState<string>(firstAvailableVariant);
  const [flavour, setFlavour] = useState<string>(firstAvailableFlavour);
  const [qty, setQty] = useState(minQty);

  const selectedPrice = hasVariants
    ? (product.variants!.find((v) => v.size === variantSize) ??
        product.variants![0]).priceUSD
    : product.priceUSD;

  // Seeds initial focus inside the dialog. Attached to the first interactive
  // control (size radio if variants exist, otherwise flavour radio/select).
  const firstFocusRef = useRef<HTMLButtonElement | HTMLSelectElement>(null);

  const familyOOS = isFamilyOutOfStock(stockEntry);
  const flavourOK = hasFlavours ? flavourIsAvailable(stockEntry, flavour) : true;
  const variantOK = hasVariants ? variantIsAvailable(stockEntry, variantSize) : true;
  const selectionOOS = familyOOS || !flavourOK || !variantOK;

  function handleAdd() {
    if (selectionOOS) {
      announce(
        familyOOS
          ? `${product.brand} ${product.name} is out of stock`
          : !flavourOK
            ? `${flavour} is out of stock`
            : `${variantSize} is out of stock`,
      );
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      variantSize: hasVariants ? variantSize : undefined,
      flavour: hasFlavours ? flavour : undefined,
      unitPriceUSD: selectedPrice,
      imageUrl: product.imageUrl,
      qty,
    });

    const detail = [
      hasVariants ? variantSize : null,
      hasFlavours ? flavour : null,
    ]
      .filter(Boolean)
      .join(" · ");
    const qtyLabel = qty > 1 ? `${qty} added to cart` : "Added to cart";

    toast(`${product.brand} ${product.name}`, {
      description: detail ? `${detail} · ${qtyLabel}` : qtyLabel,
      action: {
        label: "View cart",
        onClick: () => openCart(),
      },
    });

    onClose();
    // Return focus to the trigger button on the card (a11y).
    requestAnimationFrame(() => {
      returnFocusRef?.current?.focus();
    });
  }

  return (
    <DialogContent
      aria-labelledby={titleId}
      aria-describedby={descId}
      initialFocus={firstFocusRef}
      showCloseButton={false}
      className="sm:max-w-md max-w-[calc(100%-2rem)] bg-[var(--color-oak-medium)] text-[var(--color-parchment)] ring-1 ring-[var(--color-brass)]/30 p-0 gap-0 overflow-hidden"
    >
      <div className="px-6 pt-6 pb-4">
        <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.65rem] text-[var(--color-brass-highlight)]">
          {product.brand}
        </p>
        <DialogTitle
          id={titleId}
          className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl tracking-[0.04em] text-[var(--color-parchment)] leading-tight"
        >
          {product.name}
        </DialogTitle>
        <DialogDescription
          id={descId}
          className="mt-2 font-[family-name:var(--font-cormorant)] italic text-base text-[var(--color-parchment-dim)]"
        >
          {hasFlavours && hasVariants
            ? "Choose a size and flavour, then add to your cart."
            : hasFlavours
              ? "Choose a flavour, then add to your cart."
              : hasVariants
                ? "Choose a size, then add to your cart."
                : "Confirm and add to your cart."}
        </DialogDescription>
      </div>

      <BrassDivider className="opacity-40 mx-6" />

      <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
        <p className="font-[family-name:var(--font-cinzel)] text-2xl tabular-nums text-[var(--color-parchment)]">
          {formatPriceUSD(selectedPrice)}
          {hasVariants && (
            <span className="ml-2 font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-parchment-deep)] tracking-normal">
              · {variantSize}
            </span>
          )}
        </p>

        {hasVariants && (
          <VariantSelector
            variants={product.variants!}
            value={variantSize}
            onChange={setVariantSize}
            labelId={variantLabelId}
            firstItemRef={firstFocusRef as React.Ref<HTMLButtonElement>}
            unavailable={unavailableVariants}
          />
        )}

        {hasFlavours && (
          <FlavourSelector
            flavours={product.flavours!}
            value={flavour}
            onChange={setFlavour}
            labelId={flavourLabelId}
            firstItemRef={hasVariants ? undefined : firstFocusRef}
            unavailable={unavailableFlavours}
          />
        )}

        <div>
          <p
            id={`${titleId}-qty`}
            className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem] text-[var(--color-brass-highlight)] mb-3"
          >
            Quantity
          </p>
          <div
            role="group"
            aria-labelledby={`${titleId}-qty`}
            className="inline-flex items-center border border-[var(--color-brass)]/30"
          >
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(minQty, q - 1))}
              aria-label={`Decrease quantity of ${product.name}`}
              disabled={qty <= minQty}
              className="w-11 h-11 inline-flex items-center justify-center text-[var(--color-parchment)] hover:bg-[var(--color-brass)]/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Quantity ${qty}`}
              className="w-12 text-center font-[family-name:var(--font-libre-caslon)] tabular-nums text-lg"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label={`Increase quantity of ${product.name}`}
              className="w-11 h-11 inline-flex items-center justify-center text-[var(--color-parchment)] hover:bg-[var(--color-brass)]/10"
            >
              +
            </button>
          </div>
          {minLabel && (
            <p className="mt-2 font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-parchment-dim)]">
              {minLabel}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 py-5 border-t border-[var(--color-brass)]/20 bg-[var(--color-oak-deep)]/50">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 min-h-[44px] inline-flex items-center justify-center font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-parchment-dim)] hover:text-[var(--color-parchment)] border border-[var(--color-brass)]/20 hover:border-[var(--color-brass)]/50 px-4 py-3 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          aria-disabled={selectionOOS || undefined}
          className={
            selectionOOS
              ? "flex-1 min-h-[44px] inline-flex items-center justify-center bg-[var(--color-oak-deep)] text-[var(--color-parchment-dim)] border border-[var(--color-brass)]/30 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs px-5 py-3 cursor-not-allowed"
              : "flex-1 min-h-[44px] inline-flex items-center justify-center bg-[var(--color-brass)] hover:bg-[var(--color-brass-highlight)] text-[var(--color-oak-deep)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs px-5 py-3 transition-all duration-300 hover:tracking-[0.34em]"
          }
        >
          {familyOOS
            ? "Out of stock"
            : !flavourOK
              ? `${flavour} — unavailable`
              : !variantOK
                ? `${variantSize} — unavailable`
                : "Add to cart"}
        </button>
      </div>
    </DialogContent>
  );
}
