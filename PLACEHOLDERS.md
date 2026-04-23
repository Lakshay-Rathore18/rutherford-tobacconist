# PLACEHOLDERS — Founder Input Required

Every item below uses `[PLACEHOLDER — founder]` markers in the codebase. Search for that string to find each instance.

## Brand & Provenance

- **Established year** — used in heritage section, footer, About copy, seal mark.
  - `src/lib/brand.ts` → `ESTABLISHED_YEAR`
  - Default fallback: `1907` (Dunhill-era reference; replace with actual)

- **Founder / family name** for About page — currently "the Rutherford family"
  - `src/app/about/page.tsx`

- **Tagline** — currently "Established craft. Curated leaf."
  - `src/lib/brand.ts` → `TAGLINE`

## Contact

- **Shop street address** — currently `[PLACEHOLDER — founder]`
  - `src/lib/brand.ts` → `ADDRESS`
  - Used in: footer, contact page, order confirmation copy

- **Phone number** — currently `[PLACEHOLDER — founder]`
  - `src/lib/brand.ts` → `PHONE`

- **Email** — currently `hello@rutherford-tobacconist.[PLACEHOLDER]`
  - `src/lib/brand.ts` → `EMAIL`

- **Trading hours** — currently placeholder block on Contact page
  - `src/app/contact/page.tsx`

## Product Catalog

The seed catalog in `src/lib/products.ts` uses **realistic placeholder names** (Dunhill, Davidoff, Marlboro, etc.) and **stable Unsplash imagery** for v1. Before launch:

- Replace product photography with actual shop inventory photos (target: 1200×1200 jpg, neutral oak background)
- Confirm pricing in USD
- Confirm stock counts
- Add or remove SKUs

## Visual Assets

- **Logo wordmark SVG** — currently typeset Cinzel "RUTHERFORD" placeholder
  - `public/seal/rutherford-seal.svg`

- **Hero video** — v1 ships a real Pexels-sourced cinematic whisky-pour MP4 at `public/video/hero-loop.mp4` (1280×720, H.264, ~6 MB, audio stripped per WCAG 1.2.2 — see `docs/A11Y-AUDIT-LIVE.md`). Poster at `public/images/texture/hero-poster.jpg`.
  - **To swap with a Heygen-generated narrator clip:**
    1. Sign up at https://app.heygen.com and copy your API key + an avatar UUID + a voice UUID.
    2. Fill `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID` in `.env.local`.
    3. Edit `SCRIPT_TEXT` at the top of `scripts/generate-heygen-hero.mjs` if you want a different narration.
    4. Run `node scripts/generate-heygen-hero.mjs`. It calls Heygen, polls until done, downloads the MP4, **strips the audio track via ffmpeg** (avoids WCAG 1.2.2 captions obligation), regenerates the poster, and replaces both files in place.
  - **License note for the bundled stock loop:** Pexels free commercial use, no attribution required (`https://www.pexels.com/video/close-up-of-whiskey-being-poured-into-glass-31123699/`).

- **Heritage section portrait** — placeholder Unsplash image of pipe + leaf on wood
  - `public/images/heritage-portrait.jpg`

## Compliance

- **Minimum age: 18** (founder-locked). `MIN_AGE` constant in `src/lib/age-verification.ts`.
- **Persistence: permanent** localStorage (founder-locked). No auto-expiry. Customer must clear browser storage to re-verify.
- **Health warning copy** — currently "Tobacco products contain nicotine. Nicotine is an addictive chemical. 18+ only." Confirm wording matches your jurisdiction's required statement.
- **Checkout DOB re-verify** — runs on every order regardless of age-gate status. Audit record stores SHA-256 hash of `${dob}:${orderId}` (never plaintext).

## SMS Order Confirmation (Twilio) — wired in v1, awaiting credentials

Order confirmation SMS is fully integrated. Without credentials it is silently skipped (orders still place; the confirmation page just doesn't show the "We've sent a message…" line).

**To enable:**
1. Sign up at https://www.twilio.com/console.
2. Copy `Account SID`, `Auth Token`, and a sending phone number (E.164 format, e.g. `+15551234567`).
3. Fill `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_FROM_NUMBER=+15551234567
   SMS_NOTIFICATIONS_ENABLED=true
   ```
4. Restart the dev server.

The endpoint is at `POST /api/notify-order` (server-side only). Failure is logged on the server but never shown to the user — the order still completes. The order confirmation page only renders the SMS-sent line when Twilio actually confirmed dispatch (`smsStatus === "sent"` on the audit record).

## Deferred to Later Sprints (founder-locked v2 scope)

- Real Supabase / database (v1 uses localStorage; audit schema is forward-compatible)
- Payment processor integration (v1 is COD only)
- Admin dashboard for order management
- Voice agent integration (driver dispatch, customer callbacks)
- Driver dispatch view
- **Email order confirmations (SMTP) — deferred. SMS via Twilio ships in v1.**
- Multi-language support
- ~~Inventory sync with POS~~ — **founder-locked: NOT planned. Founder updates inventory manually via Retool dashboard.**
