"use client";

import { useEffect, useRef } from "react";
import { useCoarsePointer, useReducedMotion } from "@/lib/hooks";

/**
 * Fixed-position radial gradient that tracks the cursor.
 * Pure atmosphere — purely decorative, aria-hidden, pointer-events:none.
 *
 * Disabled by CSS under prefers-reduced-motion and pointer: coarse
 * (see globals.css .cursor-light rule). This component just updates
 * CSS vars on mousemove; CSS does the rest.
 */
export function CursorLight() {
  const ref = useRef<HTMLDivElement | null>(null);
  const coarse = useCoarsePointer();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Feature-gate at runtime so coarse/reduced-motion users get no listener.
    if (coarse || reducedMotion) return;

    let raf = 0;
    let targetX = 50;
    let targetY = 40;
    let currentX = 50;
    let currentY = 40;

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      el.style.setProperty("--cursor-x", `${currentX}%`);
      el.style.setProperty("--cursor-y", `${currentY}%`);
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [coarse, reducedMotion]);

  return <div ref={ref} aria-hidden="true" className="cursor-light" />;
}
