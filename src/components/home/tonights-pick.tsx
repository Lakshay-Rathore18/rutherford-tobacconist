"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ProductMark } from "@/components/primitives/product-mark";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { PRODUCTS } from "@/lib/products";
import { formatPriceUSD } from "@/lib/orders";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function TonightsPick() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  // Pick the bestseller pouch as tonight's feature
  const pick =
    PRODUCTS.find((p) => p.bestSeller && p.category === "tobacco-pouches") ??
    PRODUCTS[0];
  const startingPrice = pick.variants?.[0].priceUSD ?? pick.priceUSD;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (imageRef.current) {
          gsap.fromTo(
            imageRef.current,
            { yPercent: 12, scale: 1.05 },
            {
              yPercent: -12,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="tonights-pick-title"
      className="relative py-28 md:py-36 overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">
          {/* Left — image */}
          <div className="relative aspect-[4/5] lg:aspect-square overflow-hidden border border-[var(--color-brass)]/30">
            <div ref={imageRef} className="absolute inset-0">
              <ProductMark
                brand={pick.brand}
                name={pick.name}
                slug={pick.slug}
                ratio="square"
                className="h-full"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 100%, rgba(176,141,87,0.18), transparent 60%)",
                }}
              />
            </div>
            <span
              aria-hidden="true"
              className="absolute top-5 left-5 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.65rem] text-[var(--color-oak-deep)] bg-[var(--color-brass-highlight)] px-3 py-1 z-10"
            >
              Tonight&rsquo;s pick
            </span>
          </div>

          {/* Right — copy */}
          <div className="flex flex-col">
            <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.45em] text-[0.78rem] text-[var(--color-brass-highlight)]">
              From the counter
            </p>
            <h2
              id="tonights-pick-title"
              className="mt-3 font-[family-name:var(--font-cinzel)] text-4xl md:text-6xl leading-[1.05] tracking-[0.04em] text-[var(--color-parchment)]"
            >
              <span className="block">{pick.brand}</span>
              <span className="block italic font-[family-name:var(--font-cormorant)] text-[var(--color-brass-highlight)] tracking-normal">
                {pick.name}
              </span>
            </h2>
            <BrassDivider className="mt-6 max-w-[100px] opacity-70" />

            <p className="mt-7 font-[family-name:var(--font-cormorant)] text-xl leading-[1.7] text-[var(--color-parchment-dim)] max-w-[55ch]">
              {pick.longDescription ?? pick.description}
            </p>

            {pick.tastingNotes && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tasting notes">
                {pick.tastingNotes.map((note) => (
                  <li
                    key={note}
                    className="font-[family-name:var(--font-cormorant)] italic text-base text-[var(--color-parchment-dim)] border border-[var(--color-brass)]/30 px-3 py-1 rounded-sm bg-[var(--color-oak-deep)]/60"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10 flex flex-wrap items-baseline gap-6">
              <p className="font-[family-name:var(--font-cinzel)] text-3xl tabular-nums text-[var(--color-parchment)]">
                {pick.variants ? `From ${formatPriceUSD(startingPrice)}` : formatPriceUSD(startingPrice)}
              </p>
              <Link
                href={`/product/${pick.slug}`}
                className="inline-flex items-center justify-center bg-[var(--color-brass)] hover:bg-[var(--color-brass-highlight)] text-[var(--color-oak-deep)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.3em] text-sm px-9 py-3.5 transition-all duration-300 hover:tracking-[0.36em]"
              >
                Add to your selection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
