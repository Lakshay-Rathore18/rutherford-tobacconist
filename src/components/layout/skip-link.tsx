"use client";

import { handleSkipLink } from "@/components/ambient/lenis-provider";

/**
 * Skip-link client component. Calls Lenis.scrollTo with `immediate: true`
 * (no smooth-scroll for keyboard skip), then focuses #main manually.
 * If Lenis isn't running, falls back to native scrollIntoView.
 */
export function SkipLink() {
  return (
    <a href="#main" onClick={handleSkipLink} className="skip-link">
      Skip to main content
    </a>
  );
}
