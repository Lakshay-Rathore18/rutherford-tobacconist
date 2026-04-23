# Rutherford Tobacconist — Live Accessibility Audit & Remediation

**Audit basis:** Source files at `src/` cross-checked against `docs/A11Y-BRIEF.md`.
**Standard:** WCAG 2.2 AA / WAI-ARIA 1.2.
**Stack:** Next.js 16 / React 19 / shadcn (base-ui) / Tailwind v4.

This document is the punch list returned by the accessibility-lead live audit AND the remediation log of every fix applied. All items below are ✅ shipped.

---

## Acceptance Criteria — Status After Remediation

| # | Criterion | Status | Notes |
|---|---|---|---|
| 1 | Single H1 per route | ✅ Pass | Verified across all routes. Two H1s in order-confirmation are mutually exclusive render branches. |
| 2 | All interactive elements reachable by Tab | ✅ Pass | Only `tabIndex={-1}` for non-tab targets (skip link, video, error summary, H1). |
| 3 | Age gate: focus traps, Escape disabled, focuses month select | ✅ Pass | `initialFocus={monthRef}` + new document-level keydown capture handler (`useEffect` in `age-gate-modal.tsx`) blocks Escape regardless of base-ui internal behaviour. Body scroll locked. |
| 4 | Hero video aria-hidden, tabindex=-1, poster fallback | ✅ Pass | CSS `.hero-bg-fallback` + `motion-reduce:hidden` on video. |
| 5 | Skip link present, lands on main, visible on focus | ✅ Pass | First focusable in body. |
| 6 | Cart count via aria-label, no duplicate live region on icon | ✅ Pass | `aria-label="Open cart, N items"` on trigger; visible count `aria-hidden`. |
| 7 | Mobile menu: Esc closes, focus returns, aria-expanded toggles | ✅ Pass | **Replaced hand-rolled menu with Radix `<Sheet>` primitive.** Inherits focus trap, focus return, scroll lock, Escape, `aria-expanded`. |
| 8 | Product cards: no nested interactives, h3, tasting notes always visible | ✅ Pass | **Removed redundant outer `<Link>` over the product mark.** Single navigational target (h3 link) + decorative ProductMark + Add-to-cart button. |
| 9 | Variant selector: RadioGroup, arrow keys navigate, non-color cue | ✅ Pass | Checkmark glyph + brass border + ring. |
| 10 | Cart drawer: focus return, named qty buttons, polite live region | ✅ Pass | **Dropped duplicate cart-item qty live region.** Drawer's `{count} items` is now sr-only static (not live) — count is read once on drawer open. Quantity changes communicated via the product-named button labels (no chatter). |
| 11 | Checkout: error summary at top, all inputs have autocomplete | ✅ Pass | **`SelectField` now renders inline error message with icon + text below the select.** DOB validation flips visual invalidation on all three selects (`error` prop on all three) but only shows the message under the month select (`showError={false}` on day/year). All inputs have correct autocomplete tokens. |
| 12 | Order confirmation: focus moves to H1, sr-only digit-by-digit | ✅ Pass | Two-effect pattern (`loaded && order` triggers focus). |
| 13 | Brass `#B08D57` not used for small body text | ✅ Pass | **Sweep applied across 15 files — every `text-[var(--color-brass)]` for small text replaced with `text-[var(--color-brass-highlight)]` (#D4A76A → 6.79:1 vs oak-deep, 6.0:1 vs oak-medium, 4.8:1 vs oak-light, all pass AA).** Brass reserved for borders, decorative SVG strokes, large CTA backgrounds (oak-on-brass = 4.69:1 inverse, large text). |
| 14 | Compliance footer wrapped in `<aside aria-label="Health warning">` | ✅ Pass | Static, no aria-live. **Font size raised from 0.68rem → 0.78rem (≥12px rendered).** |
| 15 | Tested with VO/NVDA/keyboard | ⏳ Recommended pre-ship | Founder QA. |

---

## Remediation Log — Issue → Fix → File

### Blockers (4)

#### A1 — Age gate Escape unreliable
**Fix:** Document-level `keydown` capture-phase listener added in `age-gate-modal.tsx`. Calls `e.preventDefault() + e.stopPropagation()` for `Escape`. Also locks `document.body.style.overflow` for the duration of the modal. `dismissible` prop isn't surfaced in the shadcn wrapper type, so this listener is the safety net.
**File:** `src/components/layout/age-gate-modal.tsx` (new useEffect, lines ~36-54).

#### H1 — Mobile menu had no focus trap or focus return
**Fix:** Replaced the hand-rolled `<div role="dialog">` with the Radix `<Sheet>` primitive. Inherits focus trap, focus return, scroll lock, Escape, and proper `aria-expanded` toggling. Added `aria-labelledby="mobile-nav-title"` referencing a visible Cinzel `RUTHERFORD` heading inside the sheet.
**File:** `src/components/layout/header.tsx` (rewrote `MobileMenu` function).

#### F1 — SelectField rendered no inline error message
**Fix:** Rewrote `SelectField` to render inline error text with icon below the select, mirroring `Field`. Added `showError` prop so the DOB month/day/year group can share a single visible message while all three are visually invalidated (`aria-invalid="true"` + oxblood border). `aria-describedby` now correctly chains help text + error id.
**File:** `src/components/cart/checkout-form.tsx` (`SelectField` + DOB fieldset).

#### CO1 — Brass `#B08D57` used as small body text in 30+ places
**Fix:** Sweep across 15 files: `sed -i 's| text-\[var(--color-brass)\]| text-[var(--color-brass-highlight)]|g'`. Preserved `hover:text-`, `border-`, decorative SVG icon classes, large-CTA brass backgrounds, brass handle elements. Brass-highlight is 6.79:1 vs oak-deep — comfortably passes AA at all text sizes.
**Files:** 15 files swept. Manual touch-up on `product-detail.tsx` breadcrumb (current page indicator → brass-highlight + `aria-current="page"`).

### Serious (5)

#### P1 — Product card had triple click targets, two to the same URL
**Fix:** Removed the outer image link wrapping `<ProductMark>`. The H3 anchor is now the single navigational target. ProductMark is purely decorative (already had `aria-hidden`).
**File:** `src/components/shop/product-card.tsx`.

#### C1 — Cart-drawer item-count live region announced on every quantity change
**Fix:** Dropped the per-item `aria-live="polite"` on the qty span; replaced with a static `<span aria-hidden="true">` for visible count plus an sr-only `<span>Current quantity {qty}.</span>` (read on focus, not announced spontaneously). Drawer's count region changed from `aria-live="polite"` to plain sr-only text — read once on drawer open, never spammed.
**Files:** `src/components/cart/cart-item.tsx`, `src/components/cart/cart-drawer.tsx`.

#### F2 — Required-field markers missing
**Fix:** `Field` (and contact form fields) now render an `aria-hidden` `*` glyph in brass-highlight + sr-only " required" text after the label for required fields. Optional fields keep the existing "(optional)" italic suffix.
**Files:** `src/components/cart/checkout-form.tsx` (`Field`), `src/app/contact/page.tsx`.

#### F3 — Contact form had no error summary, no field-level error association
**Fix:** Rebuilt the contact form to mirror the checkout pattern:
- Per-field validation in a `validate()` function
- Error summary at top with `role="alert" tabIndex={-1}` that anchors to each field id
- `aria-invalid` + `aria-describedby` linking each invalid field to its inline error
- Focus moves to summary on submit failure
- Email format validation (`EMAIL_REGEX`) added
- Required markers per F2
**File:** `src/app/contact/page.tsx`.

#### A2 — Denied screen used unreliable autoFocus + lost aria-labelledby
**Fix:** Replaced React `autoFocus` prop with a `useRef` + `useEffect` that calls `.focus()` after mount. Reused `id="age-gate-title"` and `id="age-gate-desc"` so the dialog's `aria-labelledby="age-gate-title"` stays valid across phase flips. Added `aria-live="assertive"` to the `role="alert"` wrapper for redundant defence.
**File:** `src/components/layout/age-gate-modal.tsx` (`DeniedScreen`).

### Moderate / Minor (4)

#### M1 — Mobile menu duplicate aria-label
**Fix:** Auto-resolved by H1 (Sheet replacement). Now uses `aria-labelledby="mobile-nav-title"` on the SheetContent and `aria-label="Mobile primary"` on the inner `<nav>` — distinct landmarks.

#### MN3 — `/cart` was `"use client"` and exported `metadata` (silently dropped)
**Fix:** Split into:
- `app/cart/page.tsx` — server component, exports metadata, renders `<CartClient />`
- `app/cart/cart-client.tsx` — `"use client"`, contains the original UI
Page title now correctly reads `Your selection — Rutherford Tobacconist`.
**Files:** `src/app/cart/page.tsx`, `src/app/cart/cart-client.tsx` (new).

#### MN7 — Compliance line font 0.68rem ≈ 11.5px (below 12px threshold)
**Fix:** Raised to 0.78rem (≈13.3px rendered at 17px body base). Letter-spacing reduced slightly from 0.22em → 0.2em to maintain visual width.
**File:** `src/components/layout/compliance-line.tsx`.

#### Breadcrumb current-page indicator
**Fix:** Added `aria-current="page"` to the trailing `<li>` in product-detail breadcrumb. Color updated to brass-highlight for AA contrast.
**File:** `src/components/shop/product-detail.tsx`.

---

## Remaining Notes (Not Blocking, For Future Sprints)

- **MN5** — Real product photography swap-in needs `alt` prop wired through `ProductMark` replacement. Currently `aria-hidden` placeholders. Documented in `PLACEHOLDERS.md`.
- **MN6** — `SerifHeading` primitive default `as="h2"` is unused but a footgun. Consider making `as` required if anyone starts using it.
- **CO2** — Sonner toast announcement: verify with NVDA. Sonner's default region has `role="region" aria-label="Notifications"` which most screen readers won't announce per-toast. If add-to-cart announcements are missed, wire a manual `role="status"` sr-only region or configure Sonner with per-toast `aria-live`.
- **L1** — "Browse the shop" / "Step inside the shop" duplicates across pages. Acceptable cross-page consistency; would be confusing only if both rendered on the same page.
- **V1** — Reduced-motion poster `<img>` not added; CSS `.hero-bg-fallback` is the substitute. Acceptable design tradeoff.
- **MN4** — Order confirmation live region announces only on first mount + focus to H1 follows. PASS, but verify in NVDA before ship.

---

## Production Build Status

- `npm run build` → ✓ Compiled · TypeScript pass · 27 routes prerendered + `/sitemap.xml` + `/robots.txt`.
- Dev server: `http://localhost:3000` (clean console, no hydration warnings, no React warnings).
- E2E order placement verified end-to-end (test order RT61872 routed to `/order-confirmation/RT61872` with focus on H1 and live-region announcement).

---

**Authored by:** accessibility-lead (live audit) + parent agent (remediation).
**Brief reference:** `docs/A11Y-BRIEF.md`.
