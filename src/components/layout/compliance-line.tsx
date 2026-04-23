import { COMPLIANCE_LINE } from "@/lib/brand";

/**
 * Persistent legal compliance line. Wrapped in <aside aria-label="Health warning">
 * for landmark navigation. Static — no role="alert", no aria-live.
 */
export function ComplianceLine() {
  return (
    <aside
      aria-label="Health warning"
      className="border-t border-[var(--color-brass)]/15 bg-[var(--color-ink)]/60"
    >
      <div className="container mx-auto max-w-7xl px-6 py-4">
        <p className="text-center font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.2em] text-[0.78rem] text-[var(--color-parchment-dim)]">
          {COMPLIANCE_LINE}
        </p>
      </div>
    </aside>
  );
}
