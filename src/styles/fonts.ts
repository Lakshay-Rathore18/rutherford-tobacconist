import { Fraunces, Cormorant_Garamond, Inter } from "next/font/google";

/**
 * Atmos typography — variable fonts, cinematic.
 *
 * Display: Fraunces
 *   Variable serif with heavy weight contrast + opsz axis. Used for all
 *   page H1/H2/H3 and the Rutherford wordmark. Tracking -0.02em handled
 *   per-element in globals.css.
 *
 * Body / UI: Inter
 *   Modern humanist sans for buttons, nav, labels, prices, meta. Tracking
 *   -0.01em handled globally.
 *
 * Editorial italic: Cormorant Garamond
 *   Kept from v1.x for long-form prose italics and pull quotes. Provides
 *   the Garamond ink-trap flourish without the classical-inscription
 *   register of Cinzel.
 *
 * Legacy aliases (--font-cinzel / --font-libre-caslon) are kept in
 * globals.css so existing className usages resolve to the new faces
 * without touching every component.
 */

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
  // Variable font: weight is the wght axis (full 100–900). next/font requires
  // weight to be omitted (or "variable") when other axes are declared.
});

export const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const fontVariables = `${fraunces.variable} ${cormorant.variable} ${inter.variable}`;
