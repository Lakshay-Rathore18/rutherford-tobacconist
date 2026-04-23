"use client";

import type { Ref } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const RADIO_THRESHOLD = 12;

export function FlavourSelector({
  flavours,
  value,
  onChange,
  labelId = "flavour-label",
  firstItemRef,
  unavailable,
}: {
  flavours: string[];
  value: string;
  onChange: (flavour: string) => void;
  labelId?: string;
  /** Ref attached to the first interactive control — used to seed dialog focus. */
  firstItemRef?: Ref<HTMLButtonElement | HTMLSelectElement | null>;
  /** Flavours that are currently out of stock (by display name). */
  unavailable?: Set<string>;
}) {
  const useSelect = flavours.length > RADIO_THRESHOLD;
  const isOOS = (f: string) => unavailable?.has(f) ?? false;

  return (
    <div>
      <p
        id={labelId}
        className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem] text-[var(--color-brass-highlight)] mb-3"
      >
        Flavour
      </p>

      {useSelect ? (
        <>
          <label htmlFor="flavour-select" className="sr-only">
            Flavour
          </label>
          <select
            id="flavour-select"
            name="flavour"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-labelledby={labelId}
            ref={firstItemRef as Ref<HTMLSelectElement>}
            className="w-full bg-[var(--color-oak-deep)] border border-[var(--color-brass)]/30 px-4 py-3 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment)] focus:outline-none focus:border-[var(--color-brass-highlight)] focus:ring-2 focus:ring-[var(--color-brass-highlight)]/30"
          >
            {flavours.map((f) => (
              <option key={f} value={f} disabled={isOOS(f)}>
                {isOOS(f) ? `${f} — out of stock` : f}
              </option>
            ))}
          </select>
        </>
      ) : (
        <RadioGroup
          value={value}
          onValueChange={onChange}
          aria-labelledby={labelId}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
        >
          {flavours.map((f, idx) => {
            const id = `flavour-${f.replace(/\s+/g, "-").toLowerCase()}`;
            const selected = value === f;
            const oos = isOOS(f);
            return (
              <div key={f} className="relative">
                <RadioGroupItem
                  id={id}
                  value={f}
                  ref={idx === 0 ? (firstItemRef as Ref<HTMLButtonElement>) : undefined}
                  aria-disabled={oos || undefined}
                  onClick={oos ? (e) => e.preventDefault() : undefined}
                  className="sr-only peer"
                />
                <Label
                  htmlFor={id}
                  className={`flex items-center gap-2 border px-3.5 py-3 transition-all duration-200 ${
                    oos
                      ? "border-[var(--color-brass)]/10 bg-[var(--color-oak-deep)]/60 cursor-not-allowed"
                      : selected
                        ? "cursor-pointer border-[var(--color-brass)] bg-[var(--color-brass)]/10 ring-1 ring-[var(--color-brass)]"
                        : "cursor-pointer border-[var(--color-brass)]/20 hover:border-[var(--color-brass)]/50 bg-[var(--color-oak-deep)]"
                  }`}
                >
                  {selected && !oos && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[var(--color-brass-highlight)] flex-shrink-0"
                    >
                      <path d="M2 8l4 4 8-8" />
                    </svg>
                  )}
                  <span
                    className={`font-[family-name:var(--font-cormorant)] leading-tight ${
                      oos
                        ? "text-[var(--color-parchment-dim)] line-through"
                        : "text-[var(--color-parchment)]"
                    }`}
                  >
                    {f}
                    {oos && (
                      <span className="ml-2 not-italic tracking-[0.18em] uppercase text-[0.55rem] text-[var(--color-parchment-dim)]">
                        — out of stock
                      </span>
                    )}
                  </span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      )}
    </div>
  );
}
