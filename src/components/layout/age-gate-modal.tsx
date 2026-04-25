"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { isAtLeastAge, MIN_AGE, setVerified } from "@/lib/age-verification";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { BRAND } from "@/lib/brand";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

type Phase = "form" | "denied";

export function AgeGateModal({ onVerified }: { onVerified: () => void }) {
  const monthRef = useRef<HTMLSelectElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("form");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Freeze body scroll while the gate is up. Escape blocking is now handled
  // by base-ui's `dismissible={false}` on the Dialog Root (no more global
  // capture-phase listener that hijacked Escape across the whole document).
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!month || !day || !year) {
      setError("Please enter your full date of birth.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    const dob = {
      year: Number.parseInt(year, 10),
      month: Number.parseInt(month, 10),
      day: Number.parseInt(day, 10),
    };

    if (!isAtLeastAge(dob, MIN_AGE)) {
      // Calendar-impossible date OR under MIN_AGE.
      const todayMinusMin = new Date();
      todayMinusMin.setFullYear(todayMinusMin.getFullYear() - MIN_AGE);
      const birth = new Date(dob.year, dob.month - 1, dob.day);
      if (
        birth.getFullYear() !== dob.year ||
        birth.getMonth() !== dob.month - 1 ||
        birth.getDate() !== dob.day
      ) {
        setError("That doesn't look like a valid date. Please check and try again.");
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }
      setPhase("denied");
      return;
    }

    setVerified();
    onVerified();
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="w-[92vw] max-w-[92vw] sm:w-full sm:max-w-lg border border-[var(--color-brass)]/40 bg-[var(--color-oak-medium)] text-[var(--color-parchment)] p-0 gap-0 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        showCloseButton={false}
        aria-describedby="age-gate-desc"
        initialFocus={phase === "form" ? monthRef : undefined}
      >
        <div className="px-6 sm:px-8 pt-7 sm:pt-8 pb-2 text-center">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.65rem] sm:tracking-[0.4em] sm:text-[0.7rem] text-[var(--color-brass-highlight)] mb-3 break-words">
            {BRAND.name}
          </p>
          <BrassDivider className="mx-auto max-w-[140px]" />
        </div>

        {phase === "form" ? (
          <form onSubmit={handleSubmit} noValidate className="px-6 sm:px-8 pb-7 sm:pb-8 pt-4 space-y-6">
            <div className="text-center space-y-3">
              <DialogTitle
                className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl tracking-[0.04em] sm:tracking-[0.06em]"
                id="age-gate-title"
              >
                Verify your age
              </DialogTitle>
              <DialogDescription
                id="age-gate-desc"
                className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)] text-base leading-relaxed"
              >
                You must be {MIN_AGE} or older to enter {BRAND.name}.
              </DialogDescription>
            </div>

            <fieldset className="space-y-3">
              <legend className="sr-only">Date of birth (required)</legend>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3">
                <div>
                  <label
                    htmlFor="age-gate-month"
                    className="block font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.65rem] text-[var(--color-parchment-dim)] mb-1.5"
                  >
                    Month
                  </label>
                  <select
                    ref={monthRef}
                    id="age-gate-month"
                    name="bday-month"
                    autoComplete="bday-month"
                    required
                    aria-invalid={!!error}
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-[var(--color-oak-deep)] border border-[var(--color-brass)]/30 px-3 py-2.5 font-[family-name:var(--font-libre-caslon)] text-[var(--color-parchment)] focus:outline-none focus:border-[var(--color-brass-highlight)] focus:ring-2 focus:ring-[var(--color-brass-highlight)]/30"
                  >
                    <option value="">—</option>
                    {MONTHS.map((label, i) => (
                      <option key={label} value={i + 1}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="age-gate-day"
                    className="block font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.65rem] text-[var(--color-parchment-dim)] mb-1.5"
                  >
                    Day
                  </label>
                  <select
                    id="age-gate-day"
                    name="bday-day"
                    autoComplete="bday-day"
                    required
                    aria-invalid={!!error}
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full bg-[var(--color-oak-deep)] border border-[var(--color-brass)]/30 px-3 py-2.5 font-[family-name:var(--font-libre-caslon)] text-[var(--color-parchment)] focus:outline-none focus:border-[var(--color-brass-highlight)] focus:ring-2 focus:ring-[var(--color-brass-highlight)]/30"
                  >
                    <option value="">—</option>
                    {DAY_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="age-gate-year"
                    className="block font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.65rem] text-[var(--color-parchment-dim)] mb-1.5"
                  >
                    Year
                  </label>
                  <select
                    id="age-gate-year"
                    name="bday-year"
                    autoComplete="bday-year"
                    required
                    aria-invalid={!!error}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-[var(--color-oak-deep)] border border-[var(--color-brass)]/30 px-3 py-2.5 font-[family-name:var(--font-libre-caslon)] text-[var(--color-parchment)] focus:outline-none focus:border-[var(--color-brass-highlight)] focus:ring-2 focus:ring-[var(--color-brass-highlight)]/30"
                  >
                    <option value="">—</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error && (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-oxblood)] bg-[var(--color-oxblood)]/10 border border-[var(--color-oxblood)]/30 px-3 py-2 text-sm"
                >
                  {error}
                </div>
              )}
            </fieldset>

            <button
              type="submit"
              className="w-full bg-[var(--color-brass)] hover:bg-[var(--color-brass-highlight)] text-[var(--color-oak-deep)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-sm py-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brass-highlight)] focus:ring-offset-2 focus:ring-offset-[var(--color-oak-medium)]"
            >
              Enter the shop
            </button>

            <p className="font-[family-name:var(--font-cormorant)] italic text-center text-xs text-[var(--color-parchment-deep)]">
              By entering, you confirm you are of legal age in your jurisdiction
              to purchase tobacco products.
            </p>
          </form>
        ) : (
          <DeniedScreen />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeniedScreen() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="px-8 pb-8 pt-4 text-center space-y-4" role="alert" aria-live="assertive">
      <DialogTitle
        ref={headingRef}
        /* Reuse the same id as the form heading so the dialog's
         * aria-labelledby="age-gate-title" stays valid across phase flips. */
        id="age-gate-title"
        tabIndex={-1}
        className="font-[family-name:var(--font-cinzel)] text-3xl tracking-[0.06em] outline-none"
      >
        We&rsquo;re sorry
      </DialogTitle>
      <DialogDescription
        id="age-gate-desc"
        className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)] text-base leading-relaxed"
      >
        You must be {MIN_AGE} or older to enter {BRAND.name}.
        <br />
        Please return when of legal age.
      </DialogDescription>
      <div className="pt-2">
        <BrassDivider className="mx-auto max-w-[100px]" />
      </div>
    </div>
  );
}
