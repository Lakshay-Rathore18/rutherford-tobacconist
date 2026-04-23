import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Page not found — ${BRAND.name}`,
  description:
    "We couldn't find that page. Browse the catalogue or call the counter.",
  alternates: { canonical: canonical("/") },
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section
      aria-labelledby="nf-title"
      className="min-h-[70vh] grid place-items-center px-6 py-24 text-center"
    >
      <div className="max-w-[65ch]">
        <p className="font-[family-name:var(--font-cormorant)] text-[var(--color-accent-amber)] uppercase tracking-[0.32em] text-sm">
          404
        </p>
        <h1
          id="nf-title"
          className="font-[family-name:var(--font-fraunces)] text-4xl md:text-6xl mt-4 text-[var(--color-text-primary)]"
        >
          Page not found
        </h1>
        <p className="mt-6 text-[1.05rem] md:text-[1.15rem] text-[var(--color-text-muted)] leading-relaxed">
          That shelf is empty. The page you were looking for has been moved,
          retired, or never existed. The counter is still open — browse the
          catalogue or call us direct.
        </p>

        <div
          role="group"
          aria-label="What you can do next"
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-sm bg-[var(--color-accent-amber)] text-[var(--color-bg-base)] font-medium hover:bg-[var(--color-accent-amber)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] transition"
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
      </div>
    </section>
  );
}
