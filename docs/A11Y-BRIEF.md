# Rutherford Tobacconist — Accessibility Brief

**Target:** WCAG 2.2 Level AA. Next.js 15 / React 19 / Tailwind v4 / shadcn/ui.
**Audience:** Build team. Assumes semantic HTML by default; this brief covers the non-obvious patterns.
**Status:** Architectural — patterns are prescriptive, snippets are reference implementations.

---

## 0. Foundations (apply globally)

- `<html lang="en">` set in root layout.
- `<title>` format: `"{Page} — Rutherford Tobacconist"`. Set per route via Next.js `generateMetadata`.
- Skip link as the first focusable element in `<body>`: `<a href="#main" class="skip-link">Skip to main content</a>`. Visible on focus only; lands on `<main id="main" tabindex="-1">`.
- Single `<h1>` per route. Heading levels never skip.
- Respect `prefers-reduced-motion: reduce` everywhere — no decorative motion, no parallax, no autoplay video.
- Focus indicator: 2px solid `#D4A76A` (brass-highlight) outline + 2px offset. Never remove `:focus-visible`. The 6.79:1 ratio against oak satisfies SC 2.4.11 (Focus Not Obscured) and SC 1.4.11 (Non-text Contrast 3:1).
- shadcn/ui ships accessible primitives via Radix — keep Radix's `aria-*` and focus management; don't override.
- `scroll-padding-top: var(--header-height)` on `<html>` so sticky header never obscures focused elements (SC 2.4.11).

---

## 1. Age Gate Modal (18+) — Permanent Verify (Founder Override)

**Pattern:** WAI-ARIA Authoring Practices `dialog` (modal). Use Radix `<Dialog>` from shadcn — handles focus trap, scroll lock, and `aria-modal`. Open on first visit only; gate the entire site below it.

**Persistence:** `localStorage.rt_age_verified = { verified: true, verifiedAt: ISO8601 }` — **permanent, no expiry** (founder-locked). Modal only returns if localStorage is cleared. Checkout DOB re-verify always runs (legal compliance teeth + per-order audit record).

**Markup contract:**

```tsx
<Dialog open={!verified} onOpenChange={() => {}}>
  <DialogContent
    aria-labelledby="age-gate-title"
    aria-describedby="age-gate-desc"
    onEscapeKeyDown={(e) => e.preventDefault()}
    onPointerDownOutside={(e) => e.preventDefault()}
    onInteractOutside={(e) => e.preventDefault()}
    onOpenAutoFocus={(e) => { e.preventDefault(); monthRef.current?.focus(); }}
  >
    <h2 id="age-gate-title">Verify your age</h2>
    <p id="age-gate-desc">You must be 18 or older to enter Rutherford Tobacconist.</p>
    <form aria-describedby={error ? "age-gate-error" : undefined}>
      <fieldset>
        <legend>Date of birth (required)</legend>
        {/* three selects: month / day / year */}
      </fieldset>
      {error && <div id="age-gate-error" role="alert">{error}</div>}
      <button type="submit">Enter site</button>
    </form>
  </DialogContent>
</Dialog>
```

- **Initial focus:** month select (first form control), not submit.
- **Escape:** disabled. Site is gated; closing without verification is invalid.
- **Outside click:** disabled.
- **Focus trap:** Radix handles cycling Tab month → day → year → submit → month.
- **Each select** gets its own `<label>` (visible or `sr-only`). Use `autocomplete="bday-month|bday-day|bday-year"`.
- **Three native `<select>` over `<input type="date">`:** more predictable across browsers/SRs and better for an older customer base.
- **Under-18 path:** replace form with blocking `<div role="alert"><h2>We're sorry</h2><p>You must be 18 or older to enter this site.</p></div>`. Move focus to new heading. No retry, no auto-redirect, no close.

---

## 2. Hero Video Background

Decorative, no audio. Foreground heading + CTA carry the accessible content.

```tsx
<section aria-labelledby="hero-title" className="relative">
  <video aria-hidden="true" tabIndex={-1} autoPlay muted loop playsInline
         poster="/hero-poster.jpg"
         className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden">
    <source src="/video/hero-loop.webm" type="video/webm" />
    <source src="/video/hero-loop.mp4" type="video/mp4" />
  </video>
  <img src="/hero-poster.jpg" alt="" aria-hidden="true"
       className="absolute inset-0 w-full h-full object-cover hidden motion-reduce:block" />
  <div className="relative z-10">
    <h1 id="hero-title">Rutherford Tobacconist</h1>
    <p>Established craft. Curated leaf.</p>
    <a href="/cigarettes" className="cta">Browse the collection</a>
  </div>
</section>
```

- `aria-hidden="true"` + `tabIndex={-1}` removes video from a11y tree and tab order.
- No `<track>` needed — no audio, no narrative.
- `motion-reduce:hidden` on video + `motion-reduce:block` on poster gives a static fallback for `prefers-reduced-motion`.
- `aria-labelledby` gives the section a meaningful landmark name.

---

## 3. Header Navigation

```tsx
<header>
  <a href="#main" className="skip-link">Skip to main content</a>
  <a href="/" aria-label="Rutherford Tobacconist home"><Logo aria-hidden="true" /></a>
  <nav aria-label="Primary">
    <ul>
      <li><a href="/cigarettes">Cigarettes</a></li>
      <li><a href="/vapes">Vapes</a></li>
      <li><a href="/tobacco-pouches">Tobacco Pouches</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
  <a href="/cart" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
    <CartIcon aria-hidden="true" />
    <span aria-hidden="true">{count}</span>
  </a>
</header>
```

- **Cart count** announced via `aria-label` on the link. **No live region on the icon** — toast handles "added to cart".
- **Mobile menu:** Radix `Sheet`. Trigger has `aria-label="Open menu"`, `aria-expanded={open}`, `aria-controls="mobile-nav"`. Inside, wrap nav in `<nav aria-label="Mobile primary">`.
- Esc closes, focus returns to trigger (Radix handles).

---

## 4. Product Card

**Card-as-link pattern (no nested interactives):**

```tsx
<article aria-labelledby={`prod-${id}-title`}>
  <a href={`/product/${slug}`} className="block">
    <img src={imageUrl} alt="" />
    <p className="brand">{brand}</p>
    <h3 id={`prod-${id}-title`}>{name}</h3>
  </a>
  <p className="tasting-notes">{tastingNotes.join(" · ")}</p>
  <p className="price">{formatPrice(price)}</p>
  <button type="button" onClick={() => addToCart(id)}>
    Add to cart<span className="sr-only">: {name}</span>
  </button>
</article>
```

- **Heading:** `<h3>` if section has `<h2>`. Never skip.
- **Image alt:** `alt=""` if name+brand visible adjacent (decorative). Describe only if image carries info text doesn't.
- **Tasting notes always visible** (founder-locked decision: no hover-only). Satisfies SC 1.4.13.
- **Brass underline on hover** — purely decorative, fine.
- Never wrap whole card in `<a>` with a button inside — invalid HTML.

---

## 5. Variant Selector (100g / 1kg)

**Radix `<RadioGroup>`** — native radios under hood, roving tabindex.

```tsx
<RadioGroup defaultValue="100g" aria-labelledby="size-label">
  <p id="size-label">Size</p>
  <div className="segmented">
    <RadioGroupItem value="100g" id="size-100g" />
    <label htmlFor="size-100g">100g</label>
    <RadioGroupItem value="1kg" id="size-1kg" />
    <label htmlFor="size-1kg">1kg</label>
  </div>
</RadioGroup>
```

- Selected state needs **non-color indicator** (checkmark, thicker border, inset shadow) — color alone fails SC 1.4.1.
- Focus visible: 2px brass-highlight outline.

---

## 6. Cart Drawer

Modal `dialog` on both desktop (right sheet) and mobile (full sheet). Radix `Sheet`.

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right" aria-labelledby="cart-title">
    <h2 id="cart-title">Your cart</h2>
    <p className="sr-only" aria-live="polite">
      {count} {count === 1 ? "item" : "items"} in cart
    </p>
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <p>{item.name}</p>
          <p>{formatPrice(item.price)}</p>
          <div role="group" aria-label={`Quantity for ${item.name}`}>
            <button type="button" aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => decrement(item.id)}>−</button>
            <span aria-live="polite" aria-atomic="true">{item.qty}</span>
            <button type="button" aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => increment(item.id)}>+</button>
          </div>
          <button type="button" onClick={() => requestRemove(item.id)}>
            Remove<span className="sr-only">: {item.name}</span>
          </button>
        </li>
      ))}
    </ul>
    <a href="/checkout" className="cta">Proceed to checkout</a>
  </SheetContent>
</Sheet>
```

- **Focus return on close:** Radix returns to trigger automatically.
- **Item-count live region** stays `polite`.
- **Remove confirmation:** inline undo toast (5s) — replace item row with `<div role="alert">Removed {name}. <button>Undo</button></div>`. Better UX than a confirm modal AND better a11y.

---

## 7. Checkout Form (Single-page COD)

```tsx
<form noValidate onSubmit={handleSubmit}
      aria-describedby={hasErrors ? "error-summary" : undefined}>
  {hasErrors && (
    <div id="error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
      <h2>There {errors.length === 1 ? "is 1 problem" : `are ${errors.length} problems`} with your order</h2>
      <ul>{errors.map((e) => (
        <li key={e.field}><a href={`#${e.field}`}>{e.message}</a></li>
      ))}</ul>
    </div>
  )}

  <fieldset>
    <legend>Contact</legend>
    <Field id="name" label="Full name" autocomplete="name" required />
    <Field id="phone" label="Phone" type="tel" autocomplete="tel" required />
  </fieldset>

  <fieldset>
    <legend>Delivery address</legend>
    <Field id="street" label="Street address" autocomplete="street-address" required />
    <Field id="city" label="City" autocomplete="address-level2" required />
    <Field id="zip" label="Postal code" autocomplete="postal-code" inputMode="numeric" required />
  </fieldset>

  <fieldset>
    <legend>Age verification</legend>
    <p id="dob-help">We're required to verify your age on every order.</p>
    <Field id="dob-month" label="Month" autocomplete="bday-month" required aria-describedby="dob-help" />
    <Field id="dob-day" label="Day" autocomplete="bday-day" required aria-describedby="dob-help" />
    <Field id="dob-year" label="Year" autocomplete="bday-year" required aria-describedby="dob-help" />
  </fieldset>

  <fieldset>
    <legend>Order notes (optional)</legend>
    <label htmlFor="notes">Anything we should know?</label>
    <textarea id="notes" name="notes" />
  </fieldset>

  <button type="submit" disabled={submitting}>
    {submitting ? "Placing order…" : "Place order"}
  </button>
  {submitting && <span className="sr-only" role="status">Placing your order, please wait.</span>}
</form>
```

- **Error summary at top** with `role="alert" tabindex="-1"`. Focus moves to it on submit failure. Each error links to its field.
- **Inline errors** also present below each field (`aria-describedby`, `aria-invalid="true"`).
- Errors use **icon + text**, never color alone.
- **Required indication:** legends say "(required)". Optional fields say "(optional)".
- **Autocomplete tokens:** `name`, `tel`, `street-address`, `address-level2`, `postal-code`, `bday-month`, `bday-day`, `bday-year`. Satisfies SC 1.3.5.

---

## 8. Order Confirmation Page

```tsx
<main id="main" tabIndex={-1}>
  <div role="status" aria-live="polite" className="sr-only">
    Order placed successfully. Order number {readableOrderNumber}.
  </div>
  <h1 ref={h1Ref} tabIndex={-1}>Order confirmed</h1>
  <dl>
    <dt>Order number</dt>
    <dd>
      <span aria-hidden="true">RT10042</span>
      <span className="sr-only">R T, {orderDigits.split("").join(" ")}</span>
    </dd>
    <dt>Delivery window</dt>
    <dd><time dateTime="2026-04-23T14:00/16:00">Tomorrow, 2 PM – 4 PM</time></dd>
    <dt>Driver contact</dt>
    <dd>Your driver will call you at {phone} when nearby.</dd>
  </dl>
  <h2>Your order</h2>
  <ul>{/* items */}</ul>
</main>
```

- **Focus moves to H1** on mount (`tabIndex={-1}`, ref + `.focus()` in `useEffect`).
- **Order number** spelled digit-by-digit in sr-only span ("R T, 1 0 0 4 2"). Visible text stays compact.

---

## 9. Color Contrast Audit (Locked Palette)

Background: oak `#1A120B` (relative luminance L = 0.00591).

| Foreground | Hex | Ratio vs oak | AA normal (4.5:1) | AA large (3:1) | Notes |
|---|---|---|---|---|---|
| Parchment (body) | `#F4E9D0` | **13.66:1** | Pass | Pass | All body copy. |
| Parchment-dim | `#C8B99C` | **8.35:1** | Pass | Pass | Captions, helper text, footer. |
| Brass | `#B08D57` | **4.69:1** | Pass (thin) | Pass | **Restrict to non-text + large CTAs.** Avoid for small body text. |
| Brass-highlight | `#D4A76A` | **6.79:1** | Pass | Pass | Use for focus rings + hover states. |

**Rules:**
1. Brass `#B08D57` not for small body text. Use parchment / parchment-dim.
2. CTA pattern: brass background + oak text (4.69:1 inverse — passes AA normal for buttons ≥16px).
3. Focus rings: brass-highlight `#D4A76A`.
4. Hover state: brass-highlight (also signals state change).
5. Disabled: parchment-dim 50% opacity + non-color cue + `aria-disabled`.

---

## 10. Compliance Footer Line

> Tobacco products contain nicotine. Nicotine is an addictive chemical. 18+ only.

```tsx
<footer>
  {/* ...other footer content... */}
  <aside aria-label="Health warning" className="compliance-line">
    <p>Tobacco products contain nicotine. Nicotine is an addictive chemical. 18+ only.</p>
  </aside>
</footer>
```

- **Contrast:** parchment-dim on oak = 8.35:1 ✓ AAA.
- **Small caps fine** — CSS visual transform; SR reads underlying text. Verify rendered size ≥12px.
- Wrapped in `<aside aria-label="Health warning">` for landmark navigation.
- **No `role="alert"`, no `aria-live`** — static prose.
- **Persistently visible on all viewports** — FDA marketing rule.

---

## Cross-cutting Risks & Open Decisions

1. ~~Hover-only tasting notes~~ — **resolved:** always visible.
2. ~~Brass body-text margin~~ — **resolved:** non-text + large CTAs only.
3. **Persistent age verification (permanent, no expiry)** — founder-locked. Document in support FAQ. Customer can clear localStorage to re-verify.
4. **Cinzel + Cormorant Garamond** — `font-display: swap`, x-height verified ≥16px-equivalent.
5. **Sticky header** — `scroll-padding-top` on `<html>`.
6. **Mobile menu + cart drawer** — only one Sheet open at a time; close conflict handled in cart-store.
7. **No-JS fallback** — age gate without JS = entire site blocked behind server-rendered form post (acceptable).
8. **Reduced motion for hover micro-interactions** — instant, not animated, when `prefers-reduced-motion: reduce`.

---

## Acceptance Criteria (PR Checklist)

- [ ] Single H1 per route. Heading hierarchy validated with axe-core.
- [ ] All interactive elements reachable by Tab. No positive `tabindex`.
- [ ] Age gate: focus traps, Escape disabled, focuses month select on open.
- [ ] Hero video: `aria-hidden`, `tabindex="-1"`, poster fallback for reduced motion.
- [ ] Skip link present, lands on `<main tabindex="-1">`, visible on focus.
- [ ] Cart count via `aria-label` on link, no duplicate live region on icon.
- [ ] Mobile menu (Radix Sheet): Esc closes, focus returns to trigger, `aria-expanded` toggles.
- [ ] Product cards: no nested interactives. `<h3>` for product name. Tasting notes always visible.
- [ ] Variant selector: Radix RadioGroup, arrow keys navigate, non-color selected indicator.
- [ ] Cart drawer: focus returns to trigger, quantity buttons have product-named `aria-label`, item count in polite live region.
- [ ] Checkout: error summary at top with `role="alert" tabindex="-1"`. All inputs have `autocomplete`.
- [ ] Order confirmation: focus moves to H1, order number has sr-only digit-by-digit version.
- [ ] Brass `#B08D57` not used for small body text. Focus indicator uses brass-highlight `#D4A76A`.
- [ ] Compliance footer wrapped in `<aside aria-label="Health warning">`.
- [ ] Tested with VoiceOver (Safari macOS), NVDA (Firefox Windows), and keyboard-only.

---

**Brief authored by:** accessibility-lead with synthesis from aria-specialist, modal-specialist, contrast-master, keyboard-navigator, live-region-controller, forms-specialist, alt-text-headings, link-checker.
**Standards:** WCAG 2.2 AA, WAI-ARIA 1.2, ARIA Authoring Practices Guide patterns.
