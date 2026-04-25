"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Video source under /public (e.g. "/video/ambient/cigar-night.mp4"). */
  src: string;
  /**
   * Optional poster image while the video loads. Falls back to the existing
   * hero poster which is dark enough not to flash.
   */
  poster?: string;
  /** Final layer opacity. Default 0.22 — subtle, doesn't fight the foreground. */
  opacity?: number;
  /**
   * CSS mix-blend-mode. `screen` is the safe default for warm clips on the
   * dark oak palette; `luminosity` was tried but breaks on iOS Safari.
   */
  blend?: "screen" | "soft-light" | "overlay" | "normal";
  /** Optional className passthrough for the absolute wrapper. */
  className?: string;
};

/**
 * Decorative ambient video layer for any section. Always `aria-hidden`.
 *
 * Rules:
 *   · Respects `prefers-reduced-motion` — under reduced motion we render the
 *     poster as a static image instead of the looping video. Honors WCAG
 *     2.2.2 (Pause Stop Hide) without needing a user-visible pause button.
 *   · Lazy mounts on first IntersectionObserver hit so off-screen sections
 *     don't pay the network or decode cost.
 *   · No audio, no PiP, no remote playback. Decorative only.
 *
 * Usage:
 *   <section className="relative ...">
 *     <AmbientBackdrop src="/video/ambient/cigar-night.mp4" opacity={0.22} />
 *     ...rest of section
 *   </section>
 */
export function AmbientBackdrop({
  src,
  poster,
  opacity = 0.22,
  blend = "screen",
  className = "",
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || shouldMount) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setShouldMount(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [shouldMount]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity, mixBlendMode: blend }}
    >
      {shouldMount &&
        (reducedMotion ? (
          poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
            />
          ) : null
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            poster={poster}
            tabIndex={-1}
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          >
            <source src={src} type="video/mp4" />
          </video>
        ))}
    </div>
  );
}
