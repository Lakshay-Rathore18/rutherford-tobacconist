"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BrassDivider } from "@/components/primitives/brass-divider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const STEPS = [
  {
    n: "01",
    title: "Step inside",
    body: "Browse the shelves the way you would in person — three drawers, no upsells, prices on the tag.",
    glyph: "✦",
  },
  {
    n: "02",
    title: "We wrap by hand",
    body: "Cigarettes in a brass-tied bundle. Pouches sealed in waxed paper. Vape pods boxed and ribboned.",
    glyph: "❖",
  },
  {
    n: "03",
    title: "A driver knocks",
    body: "Cash at the door. The driver phones from the kerb. Most orders arrive inside 1\u20133 hours; anything placed after 11 PM lands the next morning, 6\u20138 AM.",
    glyph: "❉",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Cards begin visible (final state in DOM); ScrollTrigger only adds
        // the "rise from below + fade in" entrance. If JS / GSAP fails,
        // content is already readable.
        gsap.fromTo(
          ".rt-step-card",
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: [0.16, 1, 0.3, 1] as unknown as string,
            duration: 0.9,
            stagger: 0.18,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          },
        );
        // Subtle parallax on the brass connector
        gsap.fromTo(
          ".rt-step-connector",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              end: "bottom 60%",
              scrub: 0.8,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-it-works-title"
      className="relative py-28 md:py-36 bg-[var(--color-ink)]/40 overflow-hidden"
    >
      <BrassDivider className="opacity-60" />

      <div className="container mx-auto max-w-6xl px-6 pt-20">
        <div className="text-center mb-16">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.45em] text-[0.78rem] text-[var(--color-brass-highlight)]">
            How it works
          </p>
          <h2
            id="how-it-works-title"
            aria-label="Three steps. Tonight."
            className="mt-4 font-[family-name:var(--font-cinzel)] text-4xl md:text-6xl tracking-[0.04em] text-[var(--color-parchment)]"
          >
            <span aria-hidden="true">Three steps.</span>{" "}
            <span
              aria-hidden="true"
              className="italic font-[family-name:var(--font-cormorant)] text-[var(--color-brass-highlight)] tracking-normal"
            >
              Tonight.
            </span>
          </h2>
          <BrassDivider className="mt-8 mx-auto max-w-[80px]" />
          <p className="mt-6 font-[family-name:var(--font-cormorant)] italic text-xl text-[var(--color-parchment-dim)] max-w-2xl mx-auto leading-relaxed">
            From your laptop to your door without a card form, a queue at
            the till, or a marketing email asking for your loyalty.
          </p>
        </div>

        {/* Brass connector line — purely decorative */}
        <div
          aria-hidden="true"
          className="rt-step-connector hidden md:block absolute left-1/2 -translate-x-1/2 top-[19rem] w-[80%] max-w-5xl h-px bg-gradient-to-r from-transparent via-[var(--color-brass)]/60 to-transparent origin-left"
        />

        <ol className="grid md:grid-cols-3 gap-6 lg:gap-10 relative z-10">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rt-step-card relative bg-[var(--color-oak-medium)] border border-[var(--color-brass)]/25 p-8 md:p-10 flex flex-col items-start"
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-60"
                style={{
                  background:
                    "radial-gradient(60% 50% at 30% 20%, rgba(212,167,106,0.10), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <span
                    aria-hidden="true"
                    className="font-[family-name:var(--font-cinzel)] text-5xl text-[var(--color-brass-highlight)]/80 tabular-nums leading-none"
                  >
                    {s.n}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-2xl text-[var(--color-brass-highlight)]/60"
                  >
                    {s.glyph}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-cinzel)] text-2xl md:text-3xl tracking-[0.05em] text-[var(--color-parchment)]">
                  {s.title}
                </h3>
                <p className="mt-4 font-[family-name:var(--font-cormorant)] text-lg text-[var(--color-parchment-dim)] leading-[1.7] max-w-[40ch]">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
