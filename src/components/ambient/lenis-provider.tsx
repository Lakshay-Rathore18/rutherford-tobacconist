"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Mounts Lenis smooth scroll once. Disables automatically under
 * `prefers-reduced-motion: reduce`. Syncs GSAP ScrollTrigger with Lenis
 * via ScrollTrigger.update on every Lenis raf tick (avoids drift on
 * scrub-linked animations).
 *
 * Exposes `window.__rt_lenis` so the skip link can call `.scrollTo(...)`
 * with `immediate: true` (keyboard users must land on #main instantly).
 */
export function LenisProvider() {
  useEffect(() => {
    if (typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let raf = 0;

    const mount = () => {
      if (mq.matches) return;
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        lerp: 0.1,
      });
      (window as unknown as { __rt_lenis?: Lenis }).__rt_lenis = lenis;

      // Sync GSAP ScrollTrigger on every Lenis frame
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis?.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    };

    const unmount = () => {
      if (lenis) {
        (window as unknown as { __rt_lenis?: Lenis }).__rt_lenis = undefined;
        lenis.destroy();
        lenis = null;
      }
      if (raf) cancelAnimationFrame(raf);
    };

    mount();
    const onChange = () => {
      unmount();
      mount();
    };
    mq.addEventListener("change", onChange);

    return () => {
      mq.removeEventListener("change", onChange);
      unmount();
    };
  }, []);

  return null;
}

/**
 * Skip-link handler: Lenis hijacks anchor scrolling, so the skip link
 * must call `lenis.scrollTo(..., { immediate: true })` AND move focus
 * manually. Returns an onClick that does the right thing whether or
 * not Lenis is running.
 */
export function handleSkipLink(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const target = document.getElementById("main");
  if (!target) return;
  const lenis = (window as unknown as { __rt_lenis?: Lenis }).__rt_lenis;
  if (lenis) {
    lenis.scrollTo(target, { immediate: true });
  } else {
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }
  target.focus({ preventScroll: true });
}
