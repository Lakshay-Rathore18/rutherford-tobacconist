"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const h1Ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    // Log on server (sent to Next's logger in dev, surfaced to platform in prod).
    console.error("[route-error]", error.digest ?? error.message);
    h1Ref.current?.focus();
  }, [error]);

  return (
    <section
      aria-labelledby="err-title"
      className="min-h-[70vh] grid place-items-center px-6 py-24 text-center"
    >
      <div className="max-w-[65ch]">
        <p className="font-[family-name:var(--font-cormorant)] text-[var(--color-accent-amber)] uppercase tracking-[0.32em] text-sm">
          Something gave way
        </p>
        <h1
          id="err-title"
          ref={h1Ref}
          tabIndex={-1}
          className="font-[family-name:var(--font-fraunces)] text-4xl md:text-6xl mt-4 text-[var(--color-text-primary)] outline-none"
        >
          Something went wrong
        </h1>
        <p className="mt-6 text-[1.05rem] md:text-[1.15rem] text-[var(--color-text-muted)] leading-relaxed">
          We hit a snag loading that section. The counter is still open — try
          again, go back home, or telephone us direct.
        </p>

        <div
          role="group"
          aria-label="Recovery options"
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-sm bg-[var(--color-accent-amber)] text-[var(--color-bg-base)] font-medium hover:bg-[var(--color-accent-amber)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-sm border border-[var(--color-accent-amber)]/40 text-[var(--color-text-primary)] hover:border-[var(--color-accent-amber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] transition"
          >
            Back to the counter
          </Link>
          <a
            href={`tel:${BRAND.phoneE164}`}
            aria-label={`Call ${BRAND.name} on ${BRAND.phoneE164.split("").join(" ")}`}
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-sm border border-[var(--color-accent-amber)]/40 text-[var(--color-text-primary)] hover:border-[var(--color-accent-amber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] transition"
          >
            Call {BRAND.phone}
          </a>
        </div>

        <details className="mt-10 text-[var(--color-text-muted)] text-sm">
          <summary className="cursor-pointer inline-flex min-h-[44px] items-center rounded-sm px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]">
            Reference code (for support)
          </summary>
          <code className="block mt-3 font-mono text-xs">
            {error.digest ?? "unavailable"}
          </code>
        </details>
      </div>
    </section>
  );
}
