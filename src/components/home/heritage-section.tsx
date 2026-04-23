"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { MotionReveal } from "@/components/primitives/motion-reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function HeritageSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (cardRef.current) {
          gsap.fromTo(
            cardRef.current,
            { yPercent: 6 },
            {
              yPercent: -6,
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
        if (portraitRef.current) {
          gsap.fromTo(
            portraitRef.current,
            { yPercent: -8, scale: 1.04 },
            {
              yPercent: 8,
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
      aria-labelledby="heritage-title"
      className="relative py-28 md:py-36 overflow-hidden"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          <MotionReveal className="relative">
            <div
              ref={cardRef}
              className="relative bg-[var(--color-oak-medium)] border border-[var(--color-brass)]/20 p-10 md:p-14"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 20%, rgba(244,233,208,0.04), transparent 60%)",
                }}
              />
              <div className="relative">
                <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.4em] text-[0.78rem] text-[var(--color-brass-highlight)] mb-3">
                  A note from the counter
                </p>
                <BrassDivider className="max-w-[80px] opacity-70" />
                <h2
                  id="heritage-title"
                  aria-label="Pour. Pack. Press send."
                  className="mt-6 font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl tracking-[0.04em] text-[var(--color-parchment)] leading-[1.1]"
                >
                  <span aria-hidden="true">Pour.</span>{" "}
                  <span aria-hidden="true">Pack.</span>
                  <br aria-hidden="true" />
                  <span aria-hidden="true" className="text-[var(--color-brass-highlight)]">
                    Press send.
                  </span>
                </h2>
                <p className="mt-7 font-[family-name:var(--font-cormorant)] text-xl leading-[1.7] text-[var(--color-parchment-dim)] max-w-[60ch]">
                  This shop runs after the high-street counters close. We
                  take orders the way a good butcher takes them — written
                  down, packed by hand, double-checked, sealed in waxed
                  paper. No subscriptions, no auto-renewals, no nonsense.
                </p>
                <p className="mt-5 font-[family-name:var(--font-cormorant)] italic text-xl text-[var(--color-parchment-deep)] max-w-[60ch]">
                  You order. We wrap. A driver knocks. That&rsquo;s the
                  whole machinery.
                </p>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.15} className="relative aspect-[3/4] md:aspect-[4/5]">
            <div
              ref={portraitRef}
              className="relative w-full h-full bg-[var(--color-bg-surface)] overflow-hidden border border-[var(--color-accent-amber)]/25"
            >
              <Image
                src="/images/canva/heritage-counter.png"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              {/* Vignette overlay to deepen edges + tint warm */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(75% 60% at 50% 35%, transparent 30%, rgba(14,11,9,0.35) 70%, rgba(14,11,9,0.7) 100%)",
                }}
              />
              <div className="absolute inset-5 border border-[var(--color-accent-amber)]/20 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <p className="font-[family-name:var(--font-inter)] uppercase tracking-[0.32em] text-sm text-[var(--color-accent-amber)]">
                  By hand
                </p>
                <p className="font-[family-name:var(--font-cormorant)] italic text-base text-[var(--color-text-primary)]/70">
                  Counter scene · etched
                </p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
