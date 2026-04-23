/**
 * Always-on parchment grain overlay. Fixed, pointer-events:none, z-index 1.
 * Sits below content (z-10+) but above body background.
 */
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
