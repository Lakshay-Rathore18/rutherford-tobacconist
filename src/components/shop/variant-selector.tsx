"use client";

import type { Ref } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Variant } from "@/types";
import { formatPriceUSD } from "@/lib/orders";

export function VariantSelector({
  variants,
  value,
  onChange,
  labelId = "variant-label",
  firstItemRef,
  unavailable,
}: {
  variants: Variant[];
  value: string;
  onChange: (size: string) => void;
  labelId?: string;
  /** Ref attached to the first radio — used to seed dialog focus. */
  firstItemRef?: Ref<HTMLButtonElement | null>;
  /** Variant sizes that are currently out of stock. */
  unavailable?: Set<string>;
}) {
  const isOOS = (size: string) => unavailable?.has(size) ?? false;
  return (
    <div>
      <p
        id={labelId}
        className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem] text-[var(--color-brass-highlight)] mb-3"
      >
        Size
      </p>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        aria-labelledby={labelId}
        className="grid grid-cols-2 gap-3"
      >
        {variants.map((v, idx) => {
          const id = `variant-${v.size}`;
          const selected = value === v.size;
          const oos = isOOS(v.size);
          return (
            <div key={v.size} className="relative">
              <RadioGroupItem
                id={id}
                value={v.size}
                ref={idx === 0 ? firstItemRef : undefined}
                aria-disabled={oos || undefined}
                onClick={oos ? (e) => e.preventDefault() : undefined}
                className="sr-only peer"
              />
              <Label
                htmlFor={id}
                className={`flex flex-col items-start border px-4 py-3.5 transition-all duration-200 ${
                  oos
                    ? "border-[var(--color-brass)]/10 bg-[var(--color-oak-deep)]/60 cursor-not-allowed"
                    : selected
                      ? "cursor-pointer border-[var(--color-brass)] bg-[var(--color-brass)]/10 ring-1 ring-[var(--color-brass)]"
                      : "cursor-pointer border-[var(--color-brass)]/20 hover:border-[var(--color-brass)]/50 bg-[var(--color-oak-deep)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  {selected && !oos && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[var(--color-brass-highlight)]"
                    >
                      <path d="M2 8l4 4 8-8" />
                    </svg>
                  )}
                  <span
                    className={`font-[family-name:var(--font-cinzel)] tracking-[0.06em] ${
                      oos
                        ? "text-[var(--color-parchment-dim)] line-through"
                        : "text-[var(--color-parchment)]"
                    }`}
                  >
                    {v.size}
                  </span>
                </span>
                <span className="font-[family-name:var(--font-libre-caslon)] tabular-nums text-[var(--color-parchment-dim)] text-sm mt-1">
                  {oos ? "Out of stock" : formatPriceUSD(v.priceUSD)}
                </span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
