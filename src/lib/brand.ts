/**
 * Brand constants — single source of truth for shop identity.
 * Founder fills [PLACEHOLDER — founder] markers (tracked in PLACEHOLDERS.md).
 *
 * v1.2: dropped `establishedYear`, `address`, `email`, `hours` to remove
 *       fake provenance. Just brand + tagline + phone (founder adds later).
 */

export const BRAND = {
  name: "Rutherford Tobacconist",
  shortName: "Rutherford",
  tagline: "Smokes, vapes & loose leaf — to your door before the kettle boils.",
  shortTagline: "Your tobacconist, after hours.",
  phone: "+61 485 040 007",
  /** E.164 — used for `tel:` href construction */
  phoneE164: "+61485040007",
} as const;

export const COMPLIANCE_LINE =
  "Tobacco products contain nicotine. Nicotine is an addictive chemical. 18+ only.";
