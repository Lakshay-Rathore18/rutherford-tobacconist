# Rutherford Tobacconist

A premium e-commerce site for a heritage tobacconist. Old-world gentleman's-club aesthetic — deep oak, aged brass, parchment, Cinzel + Cormorant Garamond serifs.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (27 routes prerendered)
npm run start        # serve the production build
```

## What's inside

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui (base-ui) · Framer Motion · GSAP · Zustand (persisted) · Sonner.
- **Catalogue:** 6 cigarettes, 6 vapes, 4 tobacco pouches (each pouch in 100g + 1kg).
- **Routes:**
  - `/` — landing (hero, heritage, three-drawer category showcase, craft story, seal)
  - `/cigarettes`, `/vapes`, `/tobacco-pouches` — category pages
  - `/product/[slug]` — product detail with variant + quantity selectors
  - `/cart`, `/checkout`, `/order-confirmation/[id]`
  - `/about`, `/contact`
  - `/sitemap.xml`, `/robots.txt`
- **Age gate:** 18+ permanent localStorage. Verified once, never re-prompted unless storage is cleared. Checkout DOB re-verify always runs (compliance teeth).
- **Payment:** cash on delivery only (v1). No card details collected.
- **Audit trail:** every order writes to localStorage `rt_orders` with hashed DOB. Schema is forward-compatible with a Supabase migration in v2.

## Project layout

```
src/
├── app/                       Next.js routes (incl. sitemap.ts, robots.ts)
├── components/
│   ├── ui/                    shadcn primitives (Dialog, Sheet, RadioGroup, etc.)
│   ├── layout/                age-gate, header, footer, compliance, grain
│   ├── home/                  hero, heritage, category showcase, craft story, seal
│   ├── shop/                  product card, grid, detail, variant selector, tasting notes
│   ├── cart/                  drawer, item, trigger, hydration, checkout form
│   └── primitives/            brass divider, serif heading, motion reveal, product mark
├── lib/                       brand, products, age-verification, cart-store, orders, motion
├── styles/                    fonts.ts (Cinzel · Cormorant Garamond · Libre Caslon Text)
├── types/                     domain types
└── app/globals.css            Tailwind v4 @theme tokens, grain, vignette, brass divider, etc.
```

## Founder input still needed

See [`PLACEHOLDERS.md`](./PLACEHOLDERS.md) — every `[PLACEHOLDER — founder]` marker in the codebase, by file path. Brand year, address, phone, email, hours, real product photos, and the optional hero stock video are all listed there.

## Accessibility

The build follows WCAG 2.2 AA. The full pattern reference is in [`docs/A11Y-BRIEF.md`](./docs/A11Y-BRIEF.md), and the post-implementation audit punch list is in [`docs/A11Y-AUDIT-LIVE.md`](./docs/A11Y-AUDIT-LIVE.md). Tested with VoiceOver, NVDA, and keyboard-only.

## Compliance

The footer carries the persistent legal line (`Tobacco products contain nicotine. Nicotine is an addictive chemical. 18+ only.`) wrapped in `<aside aria-label="Health warning">` per landmark conventions. The age gate is `<dialog>` with focus trap; the checkout form re-verifies DOB on every order and stores only a SHA-256 hash of `${dob}:${orderId}`.

## Deferred to later sprints

Real Supabase backend · payment processor · admin dashboard · voice agent · driver dispatch · email/SMS confirmations · multi-language · POS sync · Heygen-generated hero video.

## Stop the dev server

`Ctrl+C` in the terminal where `npm run dev` is running.
