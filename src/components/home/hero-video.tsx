"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { SmokeShader } from "@/components/ambient/smoke-shader";
import { Magnetic } from "@/components/ambient/magnetic";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Cinematic hero — Atmos.
 *   1. Three.js volumetric smoke shader (SVG fallback under reduced-motion)
 *   2. Cursor-reactive radial light (mounted globally in layout)
 *   3. Magnetic CTAs (10px pull, pointer:fine + no-reduced-motion only)
 *   4. Ambient micro-motion: monogram breathes, eyebrow drifts
 *   5. GSAP scroll-driven content drift on scroll
 *   6. Vignette + grain (grain global)
 */
export function HeroVideo() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const monogramRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (contentRef.current) {
          gsap.to(contentRef.current, {
            yPercent: -22,
            opacity: 0.45,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "60% top",
              scrub: 0.6,
            },
          });
        }
        if (monogramRef.current) {
          gsap.to(monogramRef.current, {
            yPercent: 35,
            opacity: 0.0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "70% top",
              scrub: 0.5,
            },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative h-[100vh] min-h-[760px] w-full overflow-hidden vignette ember-pulses flex items-center justify-center"
    >
      {/* Layer 0 — base oak gradient */}
      <div className="absolute inset-0 hero-bg-fallback" />

      {/* Layer 0b — cinematic background loop (muted, decorative).
          mix-blend-luminosity is broken on iOS Safari for video — switched to
          mix-blend-screen which composites correctly on every mobile browser.
          motion-reduce:hidden was hiding the loop on every iPhone with Reduce
          Motion on (default in Low Power Mode); the loop is soft enough at
          opacity 0.4 that it doesn't trigger motion sensitivity, so we keep
          it visible. preload="auto" starts buffering before hydration so
          playback is instant on first paint. */}
      <video
        aria-hidden="true"
        tabIndex={-1}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        poster="/images/texture/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
      >
        <source src="/video/hero-loop.mp4" type="video/mp4" />
      </video>

      {/* Layer 1 — three.js smoke (with SVG fallback) */}
      <div className="absolute inset-0">
        <SmokeShader />
      </div>

      {/* Layer 2 — Canva monogram, low opacity, breathing */}
      <motion.div
        ref={monogramRef}
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{
          opacity: [0.18, 0.28, 0.18],
          scale: [1, 1.018, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <Image
          src="/images/canva/rutherford-monogram.png"
          alt=""
          width={760}
          height={760}
          priority
          className="w-[60vmin] h-auto max-w-[760px] opacity-60 mix-blend-screen"
        />
      </motion.div>

      {/* Layer 3 — Foreground content */}
      <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: [0.85, 1, 0.85],
            y: 0,
          }}
          transition={{
            opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
          }}
          className="font-[family-name:var(--font-inter)] uppercase tracking-[0.45em] text-[0.92rem] md:text-[1rem] text-[var(--color-accent-amber)]"
        >
          Open after hours
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="my-7 origin-center"
        >
          <BrassDivider className="mx-auto max-w-[80px] opacity-90" />
        </motion.div>

        <motion.h1
          id="hero-title"
          aria-label="Rutherford Tobacconist"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-[family-name:var(--font-fraunces)] text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] leading-[0.92] tracking-[-0.025em] text-[var(--color-text-primary)] font-[700]"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
        >
          <span aria-hidden="true">Rutherford</span>
          <br aria-hidden="true" />
          <span
            aria-hidden="true"
            className="italic font-[family-name:var(--font-cormorant)] text-[var(--color-accent-amber)] font-[500] tracking-[-0.01em]"
          >
            Tobacconist
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 font-[family-name:var(--font-cormorant)] italic text-2xl md:text-[1.85rem] text-[var(--color-text-primary)]/85 max-w-2xl mx-auto leading-[1.45]"
        >
          Smokes, vapes, and loose leaf — at your doorstep, before the kettle boils.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-[family-name:var(--font-inter)] text-lg md:text-xl text-[var(--color-text-muted)]"
        >
          Order between 6 AM and 11 PM. Wrapped by hand, at your door in 1&ndash;3 hours.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Magnetic strength={10}>
            <Link
              href="/cigarettes"
              className="inline-flex items-center justify-center bg-[var(--color-accent-amber)] hover:bg-[var(--color-accent-amber-bright)] text-[var(--color-bg-primary)] font-[family-name:var(--font-inter)] uppercase tracking-[0.3em] text-base px-11 py-[1.1rem] transition-colors duration-300"
            >
              Step inside the shop
            </Link>
          </Magnetic>
          <Magnetic strength={6}>
            <Link
              href="/tobacco-pouches"
              className="inline-flex items-center justify-center text-[var(--color-text-primary)] font-[family-name:var(--font-inter)] uppercase tracking-[0.3em] text-base px-7 py-[1.1rem] brass-underline"
            >
              Tonight&rsquo;s blends
            </Link>
          </Magnetic>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 motion-reduce:hidden"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
          className="font-[family-name:var(--font-inter)] uppercase tracking-[0.45em] text-sm text-[var(--color-accent-amber)]/70"
        >
          Scroll
        </motion.div>
      </motion.div>
    </section>
  );
}
