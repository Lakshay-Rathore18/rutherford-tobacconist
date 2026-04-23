import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { ComplianceLine } from "./compliance-line";

export function Footer() {
  return (
    <footer
      className="relative mt-24 bg-[var(--color-ink)]/80"
      aria-labelledby="footer-brand-name"
    >
      <BrassDivider />
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p
              id="footer-brand-name"
              className="font-[family-name:var(--font-cinzel)] text-2xl tracking-[0.18em] text-[var(--color-parchment)]"
            >
              <span className="sr-only">{BRAND.name}</span>
              <span aria-hidden="true">RUTHERFORD</span>
            </p>
            <p
              aria-hidden="true"
              className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-deep)] mt-1"
            >
              Tobacconist
            </p>
            <p className="mt-6 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment-dim)] leading-relaxed max-w-sm text-lg">
              {BRAND.tagline}
            </p>
          </div>

          <div>
            <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.78rem] text-[var(--color-brass-highlight)] mb-4">
              The Shop
            </p>
            <ul className="space-y-2 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment-dim)] text-lg">
              <li>
                <Link href="/cigarettes" className="brass-underline hover:text-[var(--color-parchment)]">
                  Cigarettes
                </Link>
              </li>
              <li>
                <Link href="/vapes" className="brass-underline hover:text-[var(--color-parchment)]">
                  Vapes
                </Link>
              </li>
              <li>
                <Link href="/nicotine-pouches" className="brass-underline hover:text-[var(--color-parchment)]">
                  Nicotine Pouches
                </Link>
              </li>
              <li>
                <Link href="/tobacco-pouches" className="brass-underline hover:text-[var(--color-parchment)]">
                  Tobacco Pouches
                </Link>
              </li>
              <li>
                <Link href="/cart" className="brass-underline hover:text-[var(--color-parchment)]">
                  Your selection
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.78rem] text-[var(--color-brass-highlight)] mb-4">
              Telephone
            </p>
            <p className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-deep)] text-lg">
              <a
                href={`tel:${BRAND.phoneE164}`}
                aria-label={`Call ${BRAND.name} on ${BRAND.phone}`}
                className="hover:text-[var(--color-parchment)] focus-visible:text-[var(--color-parchment)] transition-colors"
              >
                {BRAND.phone}
              </a>
            </p>
            <p
              data-speakable="hours"
              className="mt-4 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment-dim)] leading-relaxed text-base max-w-xs"
            >
              Open 6 AM &ndash; 11 PM. Call to ask about a blend or order
              straight from the shelves above. Deliveries land in 1&ndash;3
              hours; anything placed after 11 PM arrives the next morning
              between 6 &amp; 8 AM.
            </p>
          </div>
        </div>

        <BrassDivider className="my-10 opacity-40" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.2em] text-[0.78rem] text-[var(--color-parchment-deep)]">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p>{BRAND.shortTagline}</p>
        </div>
      </div>

      <ComplianceLine />
    </footer>
  );
}
