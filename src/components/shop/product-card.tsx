"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart-store";
import { formatPriceUSD } from "@/lib/orders";
import { minQtyForProduct, minQtyLabel } from "@/lib/products";
import { ProductMark } from "@/components/primitives/product-mark";
import { TastingNotes } from "./tasting-notes";
import { QuickAddDialog } from "./quick-add-dialog";
import { useStockEntry, useStockAnnounce } from "./stock-provider";
import { isFamilyOutOfStock } from "@/lib/stock";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.openCart);
  const titleId = `prod-${product.id}-title`;

  const basePrice = product.variants?.[0]?.priceUSD ?? product.priceUSD;
  const variantHint = product.variants
    ? `From ${formatPriceUSD(basePrice)}`
    : formatPriceUSD(basePrice);
  const minQty = minQtyForProduct(product);
  const minLabel = minQtyLabel(product.category);

  const hasFlavours = !!product.flavours && product.flavours.length > 0;
  const hasVariants = !!product.variants && product.variants.length > 0;
  const needsChoice = hasFlavours || hasVariants;

  const [dialogOpen, setDialogOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const stockEntry = useStockEntry(product.id);
  const announce = useStockAnnounce();
  const isOOS = isFamilyOutOfStock(stockEntry);
  const oosDescId = `prod-${product.id}-oos`;

  function handleDirectAdd() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      unitPriceUSD: product.priceUSD,
      imageUrl: product.imageUrl,
      qty: minQty,
    });
    const qtyLabel = minQty > 1 ? `${minQty} added to cart` : "Added to cart";
    toast(`${product.brand} ${product.name}`, {
      description: qtyLabel,
      action: {
        label: "View cart",
        onClick: () => openCart(),
      },
    });
  }

  const ctaLabel = needsChoice ? "Choose & add" : "Add to cart";
  const ctaAccessible = needsChoice
    ? hasFlavours && hasVariants
      ? `Choose flavour and size for ${product.brand} ${product.name}`
      : hasFlavours
        ? `Choose flavour for ${product.brand} ${product.name}`
        : `Choose size for ${product.brand} ${product.name}`
    : `Add ${product.brand} ${product.name} to cart`;

  return (
    <>
      <article
        aria-labelledby={titleId}
        className="group relative flex flex-col bg-[var(--color-oak-medium)] border border-[var(--color-brass)]/15 hover:border-[var(--color-brass)]/40 transition-colors duration-300 focus-within:border-[var(--color-brass-highlight)]"
      >
        {/* Best-seller / new badge */}
        {(product.bestSeller || product.newArrival) && !isOOS && (
          <span className="absolute top-3 left-3 z-10 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.55rem] text-[var(--color-oak-deep)] bg-[var(--color-brass)] px-2 py-1">
            {product.bestSeller ? "Counter favourite" : "New in"}
          </span>
        )}

        {isOOS && (
          <span
            id={oosDescId}
            className="absolute top-3 left-3 z-10 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.6rem] text-[var(--color-parchment)] bg-[var(--color-oak-deep)] border border-[var(--color-brass)]/40 px-2 py-1"
          >
            Out of stock
          </span>
        )}

        {/* Decorative product mark — not interactive. The H3 below is the single navigational target. */}
        <div className="relative">
          <ProductMark
            brand={product.brand}
            name={product.name}
            slug={product.slug}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 100%, rgba(212,167,106,0.12), transparent 70%)",
            }}
          />
        </div>

        <div className="flex flex-col flex-1 p-5 md:p-6 space-y-3">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem] text-[var(--color-brass-highlight)]">
            {product.brand}
          </p>
          <h3
            id={titleId}
            className="font-[family-name:var(--font-cinzel)] text-xl tracking-[0.04em] text-[var(--color-parchment)] leading-tight"
          >
            <Link href={`/product/${product.slug}`} className="brass-underline">
              {product.name}
            </Link>
          </h3>
          <p className="font-[family-name:var(--font-cormorant)] italic text-[0.95rem] text-[var(--color-parchment-dim)] leading-relaxed line-clamp-3">
            {product.description}
          </p>

          <TastingNotes notes={product.tastingNotes} className="mt-1" />

          {minLabel && (
            <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.65rem] text-[var(--color-brass-highlight)]/85">
              {minLabel}
            </p>
          )}

          <div className="flex-1" />

          <div className="flex items-baseline justify-between pt-3 mt-auto">
            <p className="font-[family-name:var(--font-cinzel)] text-lg tabular-nums text-[var(--color-parchment)]">
              {variantHint}
            </p>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => {
                if (isOOS) {
                  announce(`${product.brand} ${product.name} is out of stock`);
                  return;
                }
                if (needsChoice) setDialogOpen(true);
                else handleDirectAdd();
              }}
              aria-haspopup={needsChoice && !isOOS ? "dialog" : undefined}
              aria-expanded={needsChoice && !isOOS ? dialogOpen : undefined}
              aria-label={isOOS ? `${product.brand} ${product.name} is out of stock` : ctaAccessible}
              aria-disabled={isOOS || undefined}
              aria-describedby={isOOS ? oosDescId : undefined}
              className={
                isOOS
                  ? "font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-parchment-dim)] cursor-not-allowed line-through"
                  : "font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-brass-highlight)] hover:text-[var(--color-parchment)] brass-underline"
              }
            >
              {isOOS ? "Out of stock" : ctaLabel}
            </button>
          </div>
        </div>
      </article>

      {needsChoice && (
        <QuickAddDialog
          product={product}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
