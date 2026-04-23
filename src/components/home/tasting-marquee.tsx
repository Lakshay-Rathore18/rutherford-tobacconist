"use client";

import { useState } from "react";
import { BrassDivider } from "@/components/primitives/brass-divider";

const NOTES = [
  "Cedar",
  "Old leather",
  "Dried fig",
  "Honeyed hay",
  "Black tea",
  "Espresso",
  "White Burley",
  "Bright Virginia",
  "Charred oak",
  "Cool mint",
  "Latakia",
  "Vanilla bean",
  "Toasted nut",
  "Sea spray",
  "Cocoa nib",
  "Pipe tobacco",
];

/**
 * Decorative tasting-notes marquee.
 *
 * a11y plan (from accessibility-lead pre-review):
 *   1. Visible Pause/Play button (satisfies WCAG 2.2.2 unambiguously)
 *   2. Reduced-motion: full stop, render as plain wrapping list
 *   3. Pause on hover + focus-within (extra defence)
 *   4. The moving track is aria-hidden — SR users get the sr-only static <ul>
 *   5. role="region" aria-label on the SR-only list
 */
export function TastingMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <section
      aria-labelledby="marquee-title"
      className="relative py-14 md:py-20 bg-[var(--color-oak-deep)] border-y border-[var(--color-brass)]/15"
    >
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header + pause control */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.45em] text-[0.78rem] text-[var(--color-brass-highlight)]">
              On the shelves tonight
            </p>
            <h2
              id="marquee-title"
              className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl md:text-3xl tracking-[0.04em] text-[var(--color-parchment)]"
            >
              Tasting notes drifting through the cabinet
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused}
            aria-label={paused ? "Play tasting notes" : "Pause tasting notes"}
            className="self-start sm:self-end inline-flex items-center gap-2 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-xs text-[var(--color-brass-highlight)] border border-[var(--color-brass)]/40 hover:border-[var(--color-brass-highlight)] hover:bg-[var(--color-brass)]/5 px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-highlight)] focus:ring-offset-2 focus:ring-offset-[var(--color-oak-deep)]"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              {paused ? (
                <path d="M3 2l11 6-11 6V2z" />
              ) : (
                <>
                  <rect x="3" y="2" width="3.5" height="12" />
                  <rect x="9.5" y="2" width="3.5" height="12" />
                </>
              )}
            </svg>
            <span aria-hidden="true">{paused ? "Play" : "Pause"}</span>
          </button>
        </div>

        <BrassDivider className="opacity-40 mb-8" />

        {/* SR-only static list — what screen reader users actually consume */}
        <div className="sr-only" role="region" aria-label="Tasting notes available across the catalogue">
          <ul>
            {NOTES.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>

        {/* Decorative marquee — aria-hidden, paused on hover/focus-within
            and via the explicit Pause control above */}
        <div
          aria-hidden="true"
          className={`rt-marquee group relative overflow-hidden mask-x-fade ${
            paused ? "rt-marquee-paused" : ""
          }`}
        >
          <div className="rt-marquee-track flex gap-12 will-change-transform">
            {[...NOTES, ...NOTES].map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="font-[family-name:var(--font-cormorant)] italic text-3xl md:text-5xl text-[var(--color-parchment-dim)] whitespace-nowrap flex items-center gap-12"
              >
                {n}
                <span className="text-[var(--color-brass)]/60">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
