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

const CATEGORY_SLUG = "nicotine-pouches";
const META_DESCRIPTION =
  "Tobacco-free nicotine pouches — Zyn and Velo across mint, menthol, citrus and berry profiles. Phone-order delivery in 1–3 hours. 18+ only.";

export const metadata: Metadata = {
  title: "Nicotine Pouches — Zyn & Velo, Tobacco-Free",
  description: META_DESCRIPTION,
  keywords: [
    "nicotine pouches",
    "Zyn pouches",
    "Velo pouches",
    "tobacco-free nicotine",
    "snus alternative",
    "Australia nicotine pouch delivery",
  ],
  alternates: { canonical: canonical(`/${CATEGORY_SLUG}`) },
  openGraph: {
    title: "Nicotine Pouches — Rutherford Tobacconist",
    description: META_DESCRIPTION,
    url: canonical(`/${CATEGORY_SLUG}`),
    type: "website",
  },
};

export default function NicotinePouchesPage() {
  const products = getProductsByCategory(CATEGORY_SLUG);
  const cat = CATEGORIES.find((c) => c.slug === CATEGORY_SLUG)!;

  return (
    <>
      <JsonLd
        id="ld-nicotine-collection"
        data={collectionPageSchema({
          title: cat.title,
          description: META_DESCRIPTION,
          path: `/${CATEGORY_SLUG}`,
          products,
        })}
      />
      <JsonLd
        id="ld-nicotine-crumbs"
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
