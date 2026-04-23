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

const CATEGORY_SLUG = "tobacco-pouches";
const META_DESCRIPTION =
  "Loose-leaf tobacco pouches — Virginia, Burley, Latakia English mixtures and American light blends. Sold in 100-gram pouches and full kilo bags. 1–3 hour delivery, 18+ only.";

export const metadata: Metadata = {
  title: "Tobacco Pouches — Loose-Leaf Blends & Kilo Bags",
  description: META_DESCRIPTION,
  keywords: [
    "rolling tobacco",
    "pipe tobacco",
    "Virginia tobacco",
    "Latakia English mixture",
    "loose leaf tobacco pouch",
    "100g tobacco pouch",
    "1kg tobacco bag",
    "Australia tobacco delivery",
  ],
  alternates: { canonical: canonical(`/${CATEGORY_SLUG}`) },
  openGraph: {
    title: "Tobacco Pouches — Rutherford Tobacconist",
    description: META_DESCRIPTION,
    url: canonical(`/${CATEGORY_SLUG}`),
    type: "website",
  },
};

export default function TobaccoPouchesPage() {
  const products = getProductsByCategory(CATEGORY_SLUG);
  const cat = CATEGORIES.find((c) => c.slug === CATEGORY_SLUG)!;

  return (
    <>
      <JsonLd
        id="ld-pouches-collection"
        data={collectionPageSchema({
          title: cat.title,
          description: META_DESCRIPTION,
          path: `/${CATEGORY_SLUG}`,
          products,
        })}
      />
      <JsonLd
        id="ld-pouches-crumbs"
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
