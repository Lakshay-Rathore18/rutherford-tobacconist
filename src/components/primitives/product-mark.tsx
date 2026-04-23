"use client";

import { useMemo } from "react";

/**
 * Generated SVG product mark — used until founder swaps in real product photos.
 * Each product gets a deterministic-from-slug brass crest on oak background.
 * Reads as intentional, not "missing image".
 */

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h << 5) - h + slug.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const GLYPHS = ["✦", "✧", "❖", "✺", "✹", "✸", "❉", "❋", "✿", "❀"];

export function ProductMark({
  brand,
  name,
  slug,
  className,
  ratio = "square",
}: {
  brand: string;
  name: string;
  slug: string;
  className?: string;
  ratio?: "square" | "portrait" | "wide";
}) {
  const initials = useMemo(() => {
    const first = brand?.[0] ?? "R";
    const second = name?.[0] ?? "T";
    return `${first}${second}`.toUpperCase();
  }, [brand, name]);

  const glyph = useMemo(() => GLYPHS[hashSlug(slug) % GLYPHS.length], [slug]);
  const rotation = useMemo(() => (hashSlug(slug + "rot") % 30) - 15, [slug]);

  const aspect =
    ratio === "portrait" ? "aspect-[3/4]" : ratio === "wide" ? "aspect-[16/9]" : "aspect-square";

  return (
    <div
      className={`relative overflow-hidden ${aspect} bg-[var(--color-oak-medium)] ${className ?? ""}`}
      aria-hidden="true"
    >
      {/* Subtle radial spotlight from upper-left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 25%, rgba(212,167,106,0.18), transparent 70%), radial-gradient(40% 35% at 70% 80%, rgba(176,141,87,0.07), transparent 70%)",
        }}
      />
      {/* Hairline brass border inset */}
      <div className="absolute inset-3 border border-[var(--color-brass)]/25 pointer-events-none" />
      <div className="absolute inset-4 border border-[var(--color-brass)]/12 pointer-events-none" />

      {/* Glyph cluster */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span
          className="text-[var(--color-brass)]/50 text-3xl"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {glyph}
        </span>
        <span className="font-[family-name:var(--font-cinzel)] tracking-[0.32em] text-[var(--color-brass-highlight)] text-xl md:text-2xl">
          {initials}
        </span>
        <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-[0.55rem] text-[var(--color-parchment-deep)]">
          Rutherford Counter
        </span>
      </div>
    </div>
  );
}
