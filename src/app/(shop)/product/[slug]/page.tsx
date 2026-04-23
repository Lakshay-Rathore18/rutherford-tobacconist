import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, PRODUCTS, CATEGORIES } from "@/lib/products";
import { ProductDetail } from "@/components/shop/product-detail";
import { JsonLd } from "@/components/seo/json-ld";
import {
  productSchema,
  productPageSchema,
  breadcrumbSchema,
} from "@/components/seo/schemas";
import { SITE_URL, canonical } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return { title: "Not found" };

  const fullName = `${p.brand} ${p.name}`;
  const url = canonical(`/product/${p.slug}`);
  const imageUrl = `${SITE_URL}${p.imageUrl}`;

  return {
    title: fullName,
    description: p.description,
    keywords: [
      fullName,
      p.brand,
      p.category,
      ...(p.tastingNotes ?? []),
      ...(p.origin ? [p.origin] : []),
    ],
    alternates: { canonical: url },
    openGraph: {
      title: fullName,
      description: p.description,
      url,
      type: "website",
      images: [{ url: imageUrl, alt: fullName }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullName,
      description: p.description,
      images: [imageUrl],
    },
    other: {
      "product:price:amount": p.priceUSD.toFixed(2),
      "product:price:currency": "USD",
      "product:brand": p.brand,
      "product:category": p.category,
      "product:availability":
        p.stock > 0 ? "in stock" : "out of stock",
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug, 3);
  const cat = CATEGORIES.find((c) => c.slug === product.category);

  return (
    <>
      <JsonLd
        id={`ld-product-${product.slug}`}
        data={[productPageSchema(product), productSchema(product)]}
      />
      <JsonLd
        id={`ld-product-crumbs-${product.slug}`}
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          ...(cat
            ? [{ name: cat.title, path: `/${cat.slug}` }]
            : []),
          {
            name: `${product.brand} ${product.name}`,
            path: `/product/${product.slug}`,
          },
        ])}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
