/**
 * Central SEO / AEO / GEO configuration.
 *
 * Single source of truth for site URL, discoverability defaults, and the
 * factual blocks that power FAQ schema, LLM citations, and structured data.
 *
 * Design constraints:
 *   · No invented provenance (no street address, no establishment year)
 *   · Country-level `areaServed` only — phone is +61 so Australia is truthful
 *   · Every fact here maps to something visible on-page, so schema matches copy
 */

import { BRAND } from "@/lib/brand";

/** Site root — override in production via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000"
);

/** Human-readable site name used across OG, Twitter, and schema. */
export const SITE_NAME = BRAND.name;

/** Locale for OG + <html lang>. */
export const SITE_LOCALE = "en_AU";

/** Default social card (heritage-counter works at ~1200px wide). */
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/images/canva/heritage-counter.png`,
  width: 1200,
  height: 630,
  alt: `${BRAND.name} — ${BRAND.shortTagline}`,
} as const;

/** Secondary social card — monogram fallback. */
export const MONOGRAM_OG_IMAGE = {
  url: `${SITE_URL}/images/canva/rutherford-monogram.png`,
  width: 760,
  height: 760,
  alt: `${BRAND.name} monogram`,
} as const;

/**
 * Operating facts used by FAQ schema, LLM citations, and on-page copy.
 * These strings MUST match what the user reads — changing one means updating
 * the visible component text too (and vice versa).
 */
export const OPERATING_FACTS = {
  openDaily: "6:00 AM – 11:00 PM",
  openDailyMachine: { opens: "06:00", closes: "23:00" },
  deliveryWindow: "1–3 hours",
  afterHoursFallback: "Orders placed after 11 PM are delivered the next morning between 6 and 8 AM.",
  ageMinimum: 18,
  minOrderCigarettes: 2,
  minOrderVapes: 1,
  minOrderPouches: 1,
  paymentMethods: ["Cash on delivery"],
  areaServed: "AU",
  countryOfOrigin: "AU",
} as const;

/**
 * FAQ question/answer pairs — power both on-page FAQ markup (if rendered) and
 * FAQPage JSON-LD schema for AEO. Every answer is a plain-English sentence
 * suitable for a screen reader, an LLM citation, or a featured snippet.
 */
export const FAQ_FACTS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What are Rutherford Tobacconist's opening hours?",
    a: "Rutherford Tobacconist takes phone orders daily between 6:00 AM and 11:00 PM.",
  },
  {
    q: "How fast is delivery?",
    a: "Most orders arrive within 1 to 3 hours of the call. Orders placed after 11 PM are delivered the next morning between 6 and 8 AM.",
  },
  {
    q: "Do I have to verify my age every time?",
    a: "No. Confirm you are 18 or older once on the site — the age gate remembers your verification for future visits.",
  },
  {
    q: "Is there a minimum order quantity?",
    a: "Cigarettes ship in pairs (minimum of 2 per order). Vapes and tobacco pouches can be ordered singly.",
  },
  {
    q: "How do I pay?",
    a: "Cash on delivery. The driver phones from the kerb when they arrive at your door.",
  },
  {
    q: "How do I place an order?",
    a: `Call the counter on ${BRAND.phone}. Our order taker writes down what you need, reads it back, and a driver leaves within the hour.`,
  },
  {
    q: "Do you deliver to my area?",
    a: "Rutherford Tobacconist delivers locally across Australia on an on-call basis between 6 AM and 11 PM.",
  },
] as const;

/**
 * Build a route-specific canonical URL.
 * Usage: `canonical("/cigarettes")` → `"https://site.com/cigarettes"`
 */
export function canonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean === "/" ? "" : clean}`;
}
