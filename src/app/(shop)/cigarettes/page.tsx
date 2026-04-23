import type { Metadata } from "next";
import { CategoryHero } from "@/components/shop/category-hero";
import { ProductGrid } from "@/components/shop/product-grid";
import {
  getProductsByCategory,
  CATEGORIES,
  BULK_DISCOUNT_PACKS,
  BULK_DISCOUNT_USD,
} from "@/lib/products";
import { JsonLd } from "@/components/seo/json-ld";
import {
  collectionPageSchema,
  breadcrumbSchema,
} from "@/components/seo/schemas";
import { canonical } from "@/lib/seo";

const CATEGORY_SLUG = "cigarettes";
const META_DESCRIPTION =
  "Heritage filters, house blends and king-size standards. Phone-order cigarettes delivered in 1–3 hours across Australia. Minimum 2 per order. 18+ only.";

export const metadata: Metadata = {
  title: "Cigarettes — Heritage Filters & House Blends",
  description: META_DESCRIPTION,
  keywords: [
    "cigarettes delivery",
    "king size cigarettes",
    "menthol cigarettes",
    "heritage filter cigarettes",
    "Australia cigarette delivery",
  ],
  alternates: { canonical: canonical(`/${CATEGORY_SLUG}`) },
  openGraph: {
    title: "Cigarettes — Rutherford Tobacconist",
    description: META_DESCRIPTION,
    url: canonical(`/${CATEGORY_SLUG}`),
    type: "website",
  },
};

export default function CigarettesPage() {
  const products = getProductsByCategory(CATEGORY_SLUG);
  const cat = CATEGORIES.find((c) => c.slug === CATEGORY_SLUG)!;

  return (
    <>
      <JsonLd
        id="ld-cigarettes-collection"
        data={collectionPageSchema({
          title: cat.title,
          description: META_DESCRIPTION,
          path: `/${CATEGORY_SLUG}`,
          products,
        })}
      />
      <JsonLd
        id="ld-cigarettes-crumbs"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: cat.title, path: `/${CATEGORY_SLUG}` },
        ])}
      />

      <CategoryHero title={cat.title} blurb={cat.blurb} />

      <aside
        aria-labelledby="bulk-discount-title"
        className="container mx-auto max-w-7xl px-6 -mt-6 mb-10"
      >
        <div className="border border-[var(--color-brass)]/30 bg-[var(--color-ink)]/40 px-6 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p
              id="bulk-discount-title"
              className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.7rem] text-[var(--color-brass-highlight)]"
            >
              The Counter Discount
            </p>
            <p className="mt-2 font-[family-name:var(--font-cormorant)] text-[1.3125rem] leading-snug text-[var(--color-parchment)]">
              ${BULK_DISCOUNT_USD} off every {BULK_DISCOUNT_PACKS} packs &mdash; stacks automatically. The driver hands you the savings at the door.
            </p>
          </div>
          <p className="font-[family-name:var(--font-cinzel)] tabular-nums text-2xl text-[var(--color-brass-highlight)] whitespace-nowrap">
            &minus;${BULK_DISCOUNT_USD} / {BULK_DISCOUNT_PACKS}
          </p>
        </div>
      </aside>

      <section
        aria-label={`${cat.title} catalogue`}
        className="container mx-auto max-w-7xl px-6 pb-24"
      >
        <ProductGrid products={products} />
      </section>
    </>
  );
}
