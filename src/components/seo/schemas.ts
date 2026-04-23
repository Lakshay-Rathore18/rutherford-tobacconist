/**
 * Schema.org builders — factory functions that return typed JSON-LD objects.
 *
 * Every builder is pure: takes inputs, returns a plain object, no side effects.
 * The returned object is handed to <JsonLd data={...} /> for server-side inline
 * rendering. Google's Rich Results guidelines + schema.org 14.0 are the targets.
 *
 * AEO/GEO design notes:
 *   · Every fact is also visible on-page, so LLM-crawled schema matches rendered copy
 *   · No invented provenance — we expose only what the founder has confirmed
 *   · `@id` anchors let schemas reference each other (Organization ↔ Product brand)
 */

import { BRAND } from "@/lib/brand";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  OPERATING_FACTS,
  FAQ_FACTS,
  canonical,
} from "@/lib/seo";
import type { Product } from "@/types";

/* ──────────────── Shared ids (for @id cross-references) ──────────────── */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/* ──────────────── Organization / WebSite (root layout) ──────────────── */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: BRAND.shortName,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/canva/rutherford-monogram.png`,
      width: 760,
      height: 760,
    },
    image: DEFAULT_OG_IMAGE.url,
    description: BRAND.tagline,
    slogan: BRAND.shortTagline,
    areaServed: { "@type": "Country", name: "Australia" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BRAND.phoneE164,
      contactType: "sales",
      areaServed: "AU",
      availableLanguage: ["English"],
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: OPERATING_FACTS.openDailyMachine.opens,
        closes: OPERATING_FACTS.openDailyMachine.closes,
      },
    },
  } as const;
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: BRAND.tagline,
    inLanguage: "en-AU",
    publisher: { "@id": ORG_ID },
  } as const;
}

/**
 * Store schema — a non-physical retailer. Uses `areaServed` + operating hours
 * without claiming a street address (keeps faith with "no fake provenance").
 */
export function storeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#store`,
    name: SITE_NAME,
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE.url,
    description: BRAND.tagline,
    telephone: BRAND.phoneE164,
    areaServed: { "@type": "Country", name: "Australia" },
    currenciesAccepted: "USD",
    paymentAccepted: OPERATING_FACTS.paymentMethods.join(", "),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: OPERATING_FACTS.openDailyMachine.opens,
      closes: OPERATING_FACTS.openDailyMachine.closes,
    },
    parentOrganization: { "@id": ORG_ID },
  } as const;
}

/**
 * LocalBusiness — AEO-preferred richer variant of Store. Includes geo-less
 * areaServed + opening hours + priceRange. Honest: no street address (we're
 * phone-order only), so we deliberately omit `address`. Google tolerates
 * LocalBusiness without a postal address when priceRange + areaServed + hours
 * are present.
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    alternateName: BRAND.shortName,
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE.url,
    description: BRAND.tagline,
    telephone: BRAND.phoneE164,
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: OPERATING_FACTS.paymentMethods.join(", "),
    areaServed: { "@type": "Country", name: "Australia" },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: OPERATING_FACTS.openDailyMachine.opens,
      closes: OPERATING_FACTS.openDailyMachine.closes,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BRAND.phoneE164,
      contactType: "sales",
      areaServed: "AU",
      availableLanguage: ["English"],
    },
    parentOrganization: { "@id": ORG_ID },
  } as const;
}

/* ──────────────── FAQ (homepage) ──────────────── */

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_FACTS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  } as const;
}

/**
 * Speakable — hints which parts of the page Google Assistant-style voice
 * surfaces should read aloud. Points at the FAQ block + the "how to order"
 * callouts. CSS selectors mirror the class/id conventions used on the home
 * page; anything not found is silently ignored by the crawler.
 */
export function speakableSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#speakable`,
    url: SITE_URL,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='hours']",
        "[data-speakable='how-to-order']",
        "[data-speakable='delivery']",
      ],
    },
  } as const;
}

/* ──────────────── Breadcrumb ──────────────── */

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: ReadonlyArray<Crumb>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: canonical(c.path),
    })),
  } as const;
}

/* ──────────────── CollectionPage (category pages) ──────────────── */

export function collectionPageSchema(args: {
  title: string;
  description: string;
  path: string;
  products: ReadonlyArray<Product>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonical(args.path)}#collection`,
    url: canonical(args.path),
    name: args.title,
    description: args.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: args.products.length,
      itemListElement: args.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: canonical(`/product/${p.slug}`),
        name: `${p.brand} ${p.name}`,
      })),
    },
  } as const;
}

/* ──────────────── Product (PDP) ──────────────── */

export function productSchema(p: Product) {
  const url = canonical(`/product/${p.slug}`);
  const availability =
    p.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${p.brand} ${p.name}`,
    description: p.longDescription ?? p.description,
    sku: p.id,
    image: `${SITE_URL}${p.imageUrl}`,
    brand: { "@type": "Brand", name: p.brand },
    category: p.category,
    ...(p.origin ? { countryOfOrigin: p.origin } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: p.priceUSD.toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
      eligibleRegion: { "@type": "Country", name: "Australia" },
    },
    ...(p.tastingNotes && p.tastingNotes.length
      ? {
          additionalProperty: p.tastingNotes.map((note) => ({
            "@type": "PropertyValue",
            name: "Tasting note",
            value: note,
          })),
        }
      : {}),
  } as const;
}

/* ──────────────── ItemPage wrapper (for PDP + breadcrumb bundling) ──────────────── */

export function productPageSchema(p: Product) {
  const url = canonical(`/product/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "@id": `${url}#itempage`,
    url,
    name: `${p.brand} ${p.name}`,
    description: p.description,
    inLanguage: "en-AU",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": `${url}#product` },
  } as const;
}
