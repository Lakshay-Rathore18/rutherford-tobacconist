import type { Metadata } from "next";
import { CategoryHero } from "@/components/shop/category-hero";
import { ProductGrid } from "@/components/shop/product-grid";
import { getProductsByCategory, CATEGORIES } from "@/lib/products";
import { JsonLd } from "@/components/seo/json-ld";
import {
  collectionPageSchema,
  breadcrumbSchema,
} from "@/components/seo/schemas";
import { canonical } from "@/lib/seo";

const CATEGORY_SLUG = "vapes";
const META_DESCRIPTION =
  "Refillable pod systems, pen-style vapes and tobacco-leaning disposables. Selected for service life and draw, not novelty. 1–3 hour delivery, 18+ only.";

export const metadata: Metadata = {
  title: "Vapes — Refillable Pods, Pens & Disposables",
  description: META_DESCRIPTION,
  keywords: [
    "vape delivery",
    "refillable pod system",
    "disposable vape",
    "tobacco vape",
    "salt nic vape",
    "Australia vape delivery",
  ],
  alternates: { canonical: canonical(`/${CATEGORY_SLUG}`) },
  openGraph: {
    title: "Vapes — Rutherford Tobacconist",
    description: META_DESCRIPTION,
    url: canonical(`/${CATEGORY_SLUG}`),
    type: "website",
  },
};

export default function VapesPage() {
  const products = getProductsByCategory(CATEGORY_SLUG);
  const cat = CATEGORIES.find((c) => c.slug === CATEGORY_SLUG)!;

  return (
    <>
      <JsonLd
        id="ld-vapes-collection"
        data={collectionPageSchema({
          title: cat.title,
          description: META_DESCRIPTION,
          path: `/${CATEGORY_SLUG}`,
          products,
        })}
      />
      <JsonLd
        id="ld-vapes-crumbs"
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: cat.title, path: `/${CATEGORY_SLUG}` },
        ])}
      />

      <CategoryHero title={cat.title} blurb={cat.blurb} />
      <section
        aria-label={`${cat.title} catalogue`}
        className="container mx-auto max-w-7xl px-6 pb-24"
      >
        <ProductGrid products={products} />
      </section>
    </>
  );
}
