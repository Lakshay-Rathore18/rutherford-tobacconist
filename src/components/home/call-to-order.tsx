"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BRAND } from "@/lib/brand";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { Magnetic } from "@/components/ambient/magnetic";
import { AmbientBackdrop } from "@/components/ambient/ambient-backdrop";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Call-to-Order section. Introduces the voice-ordering path:
 *   1. Verify your age once on the site (the age gate)
 *   2. Then order by phone — our order-taker writes it down
 *   3. Driver leaves within the hour
 *
 * Visuals keep the Atmos 10/10 format:
 *   · Ambient ember pulses + film grain (from globals)
 *   · Big Fraunces phone number · subtle scroll parallax
 *   · Magnetic tel: CTA · cursor-reactive light (global)
 *   · Breathing scale on the phone glyph
 *   · Scroll-driven rotation on the glowing brass orbit ring
 *
 * a11y:
 *   · Phone number rendered as `<a href="tel:...">` with an aria-label
 *     that spells digits group-by-group for screen readers
 *   · Decorative SVG marked aria-hidden
 *   · Reduced-motion: all framer + gsap effects collapse automatically
 */
export function CallToOrder() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const numberRef = useRef<HTMLAnchorElement | null>(null);
  const orbitRef = useRef<SVGSVGElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (numberRef.current) {
          gsap.fromTo(
            numberRef.current,
            { yPercent: 10 },
            {
              yPercent: -10,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        }
        if (orbitRef.current) {
          gsap.to(orbitRef.current, {
            rotation: 360,
            transformOrigin: "50% 50%",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
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
      aria-labelledby="call-to-order-title"
      className="relative py-32 md:py-44 overflow-hidden bg-[var(--color-bg-primary)] ember-pulses"
    >
      {/* Ambient — slow elegant pour behind the call-to-order. The motion
          mirrors the act of pouring an order out to the customer. Decorative,
          opacity-clamped so the orbit + phone number stay sovereign. */}
      <AmbientBackdrop
        src="/video/ambient/whiskey-pour.mp4"
        opacity={0.12}
        blend="screen"
      />

      {/* Decorative orbit + brass glow */}
      <svg
        ref={orbitRef}
        aria-hidden="true"
        viewBox="0 0 800 800"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vmin] h-[120vmin] max-w-[1100px] max-h-[1100px] opacity-[0.22] pointer-events-none"
      >
        <defs>
          <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(200,137,63,0.35)" />
            <stop offset="55%" stopColor="rgba(200,137,63,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <circle cx="400" cy="400" r="360" fill="url(#orbit-glow)" />
        <circle cx="400" cy="400" r="320" fill="none" stroke="rgba(200,137,63,0.35)" strokeWidth="0.6" />
        <circle cx="400" cy="400" r="260" fill="none" stroke="rgba(200,137,63,0.25)" strokeWidth="0.6" strokeDasharray="2 8" />
        <circle cx="400" cy="400" r="200" fill="none" stroke="rgba(224,163,88,0.35)" strokeWidth="0.6" />
        {/* Satellite dots on the outer ring */}
        <circle cx="760" cy="400" r="5" fill="#E0A358" />
        <circle cx="400" cy="80"  r="3" fill="#C8893F" />
        <circle cx="140" cy="520" r="4" fill="#8B3A1F" />
      </svg>

      <div className="container mx-auto max-w-5xl px-6 relative z-10">
        <div className="text-center">
          {/* Ambient breathing phone glyph */}
          <motion.div
            aria-hidden="true"
            animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border border-[var(--color-accent-amber)]/40 bg-[var(--color-bg-surface)]/60 backdrop-blur-sm text-[var(--color-accent-amber)] shadow-[0_0_40px_rgba(200,137,63,0.25)]"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </motion.div>

          <p className="mt-9 font-[family-name:var(--font-inter)] uppercase tracking-[0.45em] text-[0.85rem] md:text-sm text-[var(--color-accent-amber)]">
            Skip the form · call the counter
          </p>
          <BrassDivider className="mt-6 mx-auto max-w-[90px] opacity-80" />

          <h2
            id="call-to-order-title"
            className="mt-8 font-[family-name:var(--font-fraunces)] text-[2.6rem] md:text-[4.4rem] lg:text-[5rem] leading-[1.02] tracking-[-0.025em] text-[var(--color-text-primary)] max-w-4xl mx-auto"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Verify once.{" "}
            <span className="italic font-[family-name:var(--font-cormorant)] text-[var(--color-accent-amber)]">
              Then just call.
            </span>
          </h2>

          <p
            data-speakable="how-to-order"
            className="mt-8 font-[family-name:var(--font-cormorant)] italic text-xl md:text-2xl text-[var(--color-text-primary)]/85 max-w-2xl mx-auto leading-[1.5]"
          >
            Confirm your age on the site once. Every order after that is a
            phone call. Our order-taker writes it down, reads it back, and
            a driver leaves within the hour.
          </p>

          {/* The number — scroll-parallaxed, magnetic tel link */}
          <div className="mt-14 md:mt-20 flex flex-col items-center gap-6">
            <Magnetic strength={10}>
              <a
                ref={numberRef}
                href={`tel:${BRAND.phoneE164}`}
                aria-label={`Call the Rutherford order taker on ${spokenDigits(BRAND.phone)}`}
                className="group inline-flex items-baseline gap-3 md:gap-5 font-[family-name:var(--font-fraunces)] text-[2.4rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] leading-none tracking-[-0.02em] text-[var(--color-text-primary)] hover:text-[var(--color-accent-amber)] transition-colors duration-500 tabular-nums focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-accent-amber)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg-primary)] rounded-sm"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                <span
                  aria-hidden="true"
                  className="text-[var(--color-accent-amber)] group-hover:text-[var(--color-accent-amber-bright)] transition-colors"
                >
                  +61
                </span>
                <span aria-hidden="true">485 040 007</span>
              </a>
            </Magnetic>

            <Magnetic strength={8}>
              <a
                href={`tel:${BRAND.phoneE164}`}
                className="inline-flex items-center gap-3 bg-[var(--color-accent-amber)] hover:bg-[var(--color-accent-amber-bright)] text-[var(--color-bg-primary)] font-[family-name:var(--font-inter)] uppercase tracking-[0.3em] text-base px-10 py-[1.15rem] transition-colors duration-300"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.26-1.26a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Place order by phone
              </a>
            </Magnetic>

            <p
              data-speakable="delivery"
              className="mt-3 font-[family-name:var(--font-cormorant)] italic text-lg text-[var(--color-text-muted)] max-w-xl"
            >
              Open 6 AM &ndash; 11 PM. Deliveries in 1&ndash;3 hours.
              Orders placed after 11 PM land the next morning between 6 and 8 AM.
              Toll charges apply from overseas. For age-verification, open the
              site once &mdash; the age gate confirms you&rsquo;re 18+ and
              remembers for next time.
            </p>
          </div>

          {/* Three-step mini-steps under the number */}
          <ol className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto text-left">
            {[
              {
                n: "01",
                t: "Verify once",
                b: "The age gate opens on your first visit. DOB in, 18+ confirmed, done.",
              },
              {
                n: "02",
                t: "Ring the counter",
                b: "Tell our order-taker what you\u2019re after. They read the list back to you.",
              },
              {
                n: "03",
                t: "Door, in 1\u20133 hours",
                b: "Cash on arrival. Driver phones from the kerb. Orders after 11 PM arrive the next morning, 6\u20138 AM.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="relative bg-[var(--color-bg-surface)]/70 border border-[var(--color-accent-amber)]/20 p-6 md:p-7"
              >
                <span
                  aria-hidden="true"
                  className="font-[family-name:var(--font-fraunces)] text-3xl text-[var(--color-accent-amber)]/80 tabular-nums"
                >
                  {s.n}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-fraunces)] text-2xl tracking-[-0.015em] text-[var(--color-text-primary)]">
                  {s.t}
                </h3>
                <p className="mt-2 font-[family-name:var(--font-cormorant)] text-lg leading-[1.55] text-[var(--color-text-primary)]/75">
                  {s.b}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Render a spoken form of a phone string for screen readers:
 * "+61 485 040 007" → "plus six one four eight five zero four zero zero zero seven"
 * Modern SRs handle E.164 OK, but spelled form guarantees correct digit flow.
 */
const WORD: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
};
function spokenDigits(phone: string): string {
  const parts: string[] = [];
  for (const ch of phone) {
    if (ch === "+") parts.push("plus");
    else if (/\d/.test(ch)) parts.push(WORD[ch] ?? ch);
  }
  return parts.join(" ");
}
