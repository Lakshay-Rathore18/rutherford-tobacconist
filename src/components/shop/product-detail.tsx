"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart-store";
import { formatPriceUSD } from "@/lib/orders";
import { minQtyForProduct, minQtyLabel } from "@/lib/products";
import { ProductMark } from "@/components/primitives/product-mark";
import { TastingNotes } from "./tasting-notes";
import { VariantSelector } from "./variant-selector";
import { FlavourSelector } from "./flavour-selector";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { useStockEntry, useStockAnnounce } from "./stock-provider";
import {
  isFamilyOutOfStock,
  flavourIsAvailable,
  variantIsAvailable,
} from "@/lib/stock";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.openCart);
  const minQty = minQtyForProduct(product);
  const minLabel = minQtyLabel(product.category);

  const hasVariants = !!product.variants && product.variants.length > 0;
  const hasFlavours = !!product.flavours && product.flavours.length > 0;
  const [variantSize, setVariantSize] = useState<string>(
    hasVariants ? product.variants![0].size : "",
  );
  const [flavour, setFlavour] = useState<string>(
    hasFlavours ? product.flavours![0] : "",
  );
  const [qty, setQty] = useState(minQty);

  const stockEntry = useStockEntry(product.id);
  const announce = useStockAnnounce();
  const familyOOS = isFamilyOutOfStock(stockEntry);
  const flavourOK = hasFlavours ? flavourIsAvailable(stockEntry, flavour) : true;
  const variantOK = hasVariants ? variantIsAvailable(stockEntry, variantSize) : true;
  const selectionOOS = familyOOS || !flavourOK || !variantOK;
  const oosDescId = `pdp-${product.id}-oos`;

  const selectedPrice = hasVariants
    ? (product.variants!.find((v) => v.size === variantSize) ?? product.variants![0]).priceUSD
    : product.priceUSD;

  function handleAdd() {
    if (selectionOOS) {
      const msg = familyOOS
        ? `${product.brand} ${product.name} is out of stock`
        : !flavourOK
          ? `${flavour} is out of stock`
          : `${variantSize} is out of stock`;
      announce(msg);
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
    const detail = [hasVariants ? variantSize : null, hasFlavours ? flavour : null]
      .filter(Boolean)
      .join(" · ");
    toast(`${product.brand} ${product.name}`, {
      description: detail ? `${detail} · ${qty} added to cart` : `${qty} added to cart`,
      action: {
        label: "View cart",
        onClick: () => openCart(),
      },
    });
  }

  return (
    <article className="container mx-auto max-w-6xl px-6 py-12 md:py-20">
      <nav aria-label="Breadcrumb" className="mb-10">
        <ol className="flex items-center gap-2 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-parchment-dim)]">
          <li>
            <Link href="/" className="hover:text-[var(--color-brass-highlight)]">
              Counter
            </Link>
          </li>
          <li aria-hidden="true">·</li>
          <li>
            <Link
              href={`/${product.category}`}
              className="hover:text-[var(--color-brass-highlight)]"
            >
              {product.category.replace("-", " ")}
            </Link>
          </li>
          <li aria-hidden="true">·</li>
          <li aria-current="page" className="text-[var(--color-brass-highlight)]">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div className="md:sticky md:top-32 md:self-start">
          <div className="border border-[var(--color-brass)]/20">
            <ProductMark
              brand={product.brand}
              name={product.name}
              slug={product.slug}
              ratio="square"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.7rem] text-[var(--color-brass-highlight)]">
              {product.brand}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl tracking-[0.04em] text-[var(--color-parchment)] leading-[1.1]">
              {product.name}
            </h1>
            {product.origin && (
              <p className="mt-3 font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)]">
                {product.origin}
              </p>
            )}
          </div>

          <BrassDivider className="opacity-50 max-w-[120px]" />

          <p className="font-[family-name:var(--font-cinzel)] text-3xl tabular-nums text-[var(--color-parchment)]">
            {formatPriceUSD(selectedPrice)}
            {hasVariants && (
              <span className="ml-2 font-[family-name:var(--font-cormorant)] italic text-base text-[var(--color-parchment-deep)] tracking-normal">
                · {variantSize}
              </span>
            )}
          </p>

          {familyOOS && (
            <p
              id={oosDescId}
              className="inline-block font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-[0.7rem] text-[var(--color-parchment)] bg-[var(--color-oak-deep)] border border-[var(--color-brass)]/40 px-3 py-1.5"
            >
              Out of stock
            </p>
          )}

          <p className="font-[family-name:var(--font-cormorant)] text-lg leading-[1.7] text-[var(--color-parchment-dim)]">
            {product.longDescription ?? product.description}
          </p>

          <TastingNotes notes={product.tastingNotes} />

          {hasVariants && (
            <VariantSelector
              variants={product.variants!}
              value={variantSize}
              onChange={setVariantSize}
              unavailable={
                new Set(
                  product.variants!
                    .map((v) => v.size)
                    .filter((s) => !variantIsAvailable(stockEntry, s)),
                )
              }
            />
          )}

          {hasFlavours && (
            <FlavourSelector
              flavours={product.flavours!}
              value={flavour}
              onChange={setFlavour}
              unavailable={
                new Set(
                  product.flavours!.filter(
                    (f) => !flavourIsAvailable(stockEntry, f),
                  ),
                )
              }
            />
          )}

          <div>
            <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-brass-highlight)] mb-3">
              Quantity
            </p>
            <div
              role="group"
              aria-label={`Quantity for ${product.name}`}
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
                aria-hidden="true"
                className="w-12 text-center font-[family-name:var(--font-libre-caslon)] tabular-nums text-lg"
              >
                {qty}
              </span>
              <span className="sr-only">{qty}.</span>
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
              <p className="mt-3 font-[family-name:var(--font-cormorant)] italic text-base text-[var(--color-parchment-dim)]">
                {minLabel}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAdd}
              aria-disabled={selectionOOS || undefined}
              aria-describedby={familyOOS ? oosDescId : undefined}
              className={
                selectionOOS
                  ? "inline-flex items-center justify-center bg-[var(--color-oak-deep)] text-[var(--color-parchment-dim)] border border-[var(--color-brass)]/30 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs px-9 py-4 cursor-not-allowed w-full sm:w-auto"
                  : "inline-flex items-center justify-center bg-[var(--color-brass)] hover:bg-[var(--color-brass-highlight)] text-[var(--color-oak-deep)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs px-9 py-4 transition-all duration-300 hover:tracking-[0.34em] w-full sm:w-auto"
              }
            >
              {familyOOS
                ? "Out of stock"
                : !flavourOK
                  ? `${flavour} — unavailable`
                  : !variantOK
                    ? `${variantSize} — unavailable`
                    : "Wrap & add to cart"}
            </button>
          </div>

          <p className="font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-parchment-deep)] pt-3 border-t border-[var(--color-brass)]/15 mt-6">
            Cash on delivery. A driver will telephone to confirm before they
            depart for your address.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24">
          <BrassDivider className="opacity-50 mb-12" />
          <h2
            id="related-title"
            className="font-[family-name:var(--font-cinzel)] text-2xl md:text-3xl tracking-[0.04em] text-[var(--color-parchment)] mb-8 text-center"
          >
            From the same drawer
          </h2>
          <RelatedProducts items={related} />
        </section>
      )}
    </article>
  );
}

function RelatedProducts({ items }: { items: Product[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p) => (
        <li key={p.id}>
          <Link
            href={`/product/${p.slug}`}
            className="block border border-[var(--color-brass)]/15 hover:border-[var(--color-brass)]/40 transition-colors group"
          >
            <ProductMark brand={p.brand} name={p.name} slug={p.slug} />
            <div className="p-4 space-y-1">
              <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.6rem] text-[var(--color-brass-highlight)]">
                {p.brand}
              </p>
              <p className="font-[family-name:var(--font-cinzel)] text-base tracking-[0.04em] text-[var(--color-parchment)] brass-underline">
                {p.name}
              </p>
              <p className="font-[family-name:var(--font-cinzel)] tabular-nums text-[var(--color-parchment-dim)] text-sm">
                {formatPriceUSD(p.variants?.[0].priceUSD ?? p.priceUSD)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
