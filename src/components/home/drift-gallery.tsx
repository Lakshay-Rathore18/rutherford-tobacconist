"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ProductMark } from "@/components/primitives/product-mark";
import { PRODUCTS } from "@/lib/products";
import { BrassDivider } from "@/components/primitives/brass-divider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const SLUGS = [
  "rutherford-reserve-gold",
  "rutherford-vapor-pod",
  "tilbury-hall-dark",
  "westminster-heritage",
  "ash-oak-refillable",
];

export function DriftGallery() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const tiles = SLUGS.map((slug) => PRODUCTS.find((p) => p.slug === slug)).filter(
    (p): p is (typeof PRODUCTS)[number] => Boolean(p),
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Each tile drifts at a slightly different rate for parallax depth
        const tiles = gsap.utils.toArray<HTMLElement>(".rt-drift-tile");
        tiles.forEach((tile, i) => {
          const offset = (i % 3) * 4 + 6; // 6, 10, 14
          gsap.fromTo(
            tile,
            { yPercent: offset },
            {
              yPercent: -offset,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
              },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="drift-title"
      className="relative py-24 md:py-36 overflow-hidden bg-[var(--color-ink)]/30"
    >
      <BrassDivider className="opacity-50" />
      <div className="container mx-auto max-w-7xl px-6 pt-16">
        <div className="text-center mb-14">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.45em] text-[0.78rem] text-[var(--color-brass-highlight)]">
            Drift
          </p>
          <h2
            id="drift-title"
            className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl md:text-5xl tracking-[0.04em] text-[var(--color-parchment)]"
          >
            What&rsquo;s in stock,{" "}
            <span className="italic font-[family-name:var(--font-cormorant)] text-[var(--color-brass-highlight)] tracking-normal">
              by the dozen.
            </span>
          </h2>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
          {tiles.map((p) => (
            <li
              key={p.slug}
              className="rt-drift-tile group relative aspect-[3/4] overflow-hidden border border-[var(--color-brass)]/15 hover:border-[var(--color-brass)]/45 transition-colors"
            >
              <Link
                href={`/product/${p.slug}`}
                className="block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass-highlight)]"
                aria-label={`${p.brand} ${p.name}`}
              >
                <ProductMark
                  brand={p.brand}
                  name={p.name}
                  slug={p.slug}
                  ratio="portrait"
                  className="h-full"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[var(--color-ink)]/95 via-[var(--color-ink)]/60 to-transparent"
                >
                  <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.6rem] text-[var(--color-brass-highlight)]">
                    {p.brand}
                  </p>
                  <p className="font-[family-name:var(--font-cinzel)] text-sm text-[var(--color-parchment)] tracking-[0.04em] truncate">
                    {p.name}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
