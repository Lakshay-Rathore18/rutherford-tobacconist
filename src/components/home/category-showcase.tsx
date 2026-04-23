"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/products";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { MotionReveal } from "@/components/primitives/motion-reveal";

export function CategoryShowcase() {
  return (
    <section
      aria-labelledby="categories-title"
      className="relative py-20 md:py-28 bg-[var(--color-ink)]/30"
    >
      <BrassDivider className="opacity-50" />
      <div className="container mx-auto max-w-7xl px-6 pt-20">
        <MotionReveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.4em] text-[0.7rem] text-[var(--color-brass-highlight)]">
            The Cabinet
          </p>
          <h2
            id="categories-title"
            aria-label="Three drawers, well kept."
            className="mt-4 font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl tracking-[0.04em] text-[var(--color-parchment)]"
          >
            <span aria-hidden="true">Three drawers,</span>
            <br aria-hidden="true" />
            <span aria-hidden="true" className="italic font-[family-name:var(--font-cormorant)] text-[var(--color-brass-highlight)] tracking-normal">
              well kept.
            </span>
          </h2>
          <p className="mt-5 font-[family-name:var(--font-cormorant)] italic text-lg text-[var(--color-parchment-dim)]">
            Cigarettes from the standards to the heritage filters.
            Vapes selected for service life. Loose leaf, blended in-house and
            sold by the pouch or the kilo.
          </p>
        </MotionReveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {CATEGORIES.map((cat, i) => (
            <CategoryDrawer key={cat.slug} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryDrawer({
  category,
  index,
}: {
  category: { slug: string; title: string; blurb: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/${category.slug}`}
        className="group relative block aspect-[3/4] bg-[var(--color-oak-medium)] border border-[var(--color-brass)]/20 overflow-hidden transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:border-[var(--color-brass-highlight)] focus-visible:ring-2 focus-visible:ring-[var(--color-brass-highlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]"
      >
        {/* Brass handle on top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-20 h-3 bg-[var(--color-brass)] rounded-b-md transition-all duration-500 group-hover:h-5 group-hover:w-24 group-hover:bg-[var(--color-brass-highlight)]" />

        {/* Wood grain background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 30%, rgba(212,167,106,0.12), transparent 70%), linear-gradient(180deg, #2C1E15 0%, #1A120B 100%)",
          }}
        />

        {/* Inner brass border */}
        <div className="absolute inset-6 border border-[var(--color-brass)]/15 transition-colors duration-500 group-hover:border-[var(--color-brass)]/40" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-8 z-10">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.65rem] text-[var(--color-brass-highlight)]">
            Drawer · 0{index + 1}
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl tracking-[0.04em] text-[var(--color-parchment)] leading-[1.05]">
            {category.title}
          </h3>
          <p className="mt-4 font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)] leading-relaxed">
            {category.blurb}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.24em] text-[0.7rem] text-[var(--color-brass-highlight)]">
            View shelf
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M2 8h12M9 3l5 5-5 5" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
