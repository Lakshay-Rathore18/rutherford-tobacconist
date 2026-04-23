"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Magnetic hover wrapper. Primary CTAs translate up to `strength` pixels
 * toward the cursor when hovered. Disabled on coarse pointers AND under
 * prefers-reduced-motion.
 *
 * IMPORTANT (a11y): keyboard focus does NOT trigger translation. On
 * mouseleave we snap back to origin so a subsequent Tab-focus renders
 * the focus ring on the resting position.
 *
 * Applies transform to `transform` — does not move the bounding box in
 * layout, so click detection stays accurate.
 */
export function Magnetic({
  children,
  strength = 10,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
        raf = 0;
      });
    };

    const onLeave = () => {
      el.style.transform = "translate3d(0, 0, 0)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: "inline-block", transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)" }}
    >
      {children}
    </div>
  );
}
