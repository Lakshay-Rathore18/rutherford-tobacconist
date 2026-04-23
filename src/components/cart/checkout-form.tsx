"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { isAtLeastAge, MIN_AGE } from "@/lib/age-verification";
import { persistOrder, formatPriceUSD } from "@/lib/orders";
import { BrassDivider } from "@/components/primitives/brass-divider";
import type { DOB, DeliveryAddress } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

type FieldError = { field: string; message: string };

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const itemsTotal = useCart((s) => s.subtotalUSD());
  const bulkDiscount = useCart((s) => s.bulkDiscountUSD());
  const subtotal = useCart((s) => s.discountedSubtotalUSD());
  const clear = useCart((s) => s.clear);

  const summaryRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);

  // Form state — reordered: phone, first, last, address, DOB, notes
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [notes, setNotes] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");

  function validate(): FieldError[] {
    const errs: FieldError[] = [];
    if (!phone.trim() || phone.replace(/\D/g, "").length < 7)
      errs.push({ field: "phone", message: "A valid phone number is required." });
    if (!firstName.trim()) errs.push({ field: "first-name", message: "First name is required." });
    if (!lastName.trim()) errs.push({ field: "last-name", message: "Last name is required." });
    if (!street.trim()) errs.push({ field: "street", message: "Street address is required." });
    if (!city.trim()) errs.push({ field: "city", message: "City is required." });
    if (!postal.trim()) errs.push({ field: "zip", message: "Postal code is required." });
    if (!dobMonth || !dobDay || !dobYear) {
      errs.push({ field: "dob-month", message: "Date of birth is required for age verification." });
    } else {
      const dob: DOB = {
        year: Number.parseInt(dobYear, 10),
        month: Number.parseInt(dobMonth, 10),
        day: Number.parseInt(dobDay, 10),
      };
      if (!isAtLeastAge(dob, MIN_AGE)) {
        errs.push({
          field: "dob-month",
          message: `You must be ${MIN_AGE} or older to place this order.`,
        });
      }
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (items.length === 0) return;

    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    const dob: DOB = {
      year: Number.parseInt(dobYear, 10),
      month: Number.parseInt(dobMonth, 10),
      day: Number.parseInt(dobDay, 10),
    };
    const delivery: DeliveryAddress = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      street: street.trim(),
      unit: unit.trim() || undefined,
      city: city.trim(),
      postal: postal.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
    };
    const order = await persistOrder({ items, delivery, dob, sendSms: true });
    clear();
    router.push(`/order-confirmation/${order.orderId}`);
  }

  const hasErrors = errors.length > 0;
  const errorMap = Object.fromEntries(errors.map((e) => [e.field, e.message]));

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={hasErrors ? "error-summary" : undefined}
      className="grid lg:grid-cols-[1.4fr_1fr] gap-12"
    >
      <div className="space-y-10">
        {hasErrors && (
          <div
            id="error-summary"
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="border border-[var(--color-oxblood)] bg-[var(--color-oxblood)]/10 p-5"
          >
            <h2 className="font-[family-name:var(--font-cinzel)] text-lg tracking-[0.04em] text-[var(--color-parchment)]">
              {errors.length === 1
                ? "There is 1 problem with your order"
                : `There are ${errors.length} problems with your order`}
            </h2>
            <ul className="mt-3 space-y-1 list-disc list-inside font-[family-name:var(--font-cormorant)] text-[var(--color-parchment-dim)]">
              {errors.map((err) => (
                <li key={err.field}>
                  <a
                    href={`#${err.field}`}
                    className="brass-underline text-[var(--color-parchment)]"
                  >
                    {err.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Fieldset legend="Contact">
          <p className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)]">
            We&rsquo;ll text you when your driver is on the way. We never use
            this number for anything else.
          </p>
          <Field
            id="phone"
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
            inputMode="tel"
            error={errorMap.phone}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              id="first-name"
              label="First name"
              value={firstName}
              onChange={setFirstName}
              autoComplete="given-name"
              error={errorMap["first-name"]}
            />
            <Field
              id="last-name"
              label="Last name"
              value={lastName}
              onChange={setLastName}
              autoComplete="family-name"
              error={errorMap["last-name"]}
            />
          </div>
        </Fieldset>

        <Fieldset legend="Delivery address">
          <Field
            id="street"
            label="Street address"
            value={street}
            onChange={setStreet}
            autoComplete="street-address"
            error={errorMap.street}
          />
          <Field
            id="unit"
            label="Apartment, suite, etc."
            value={unit}
            onChange={setUnit}
            autoComplete="address-line2"
            optional
          />
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
            <Field
              id="city"
              label="City"
              value={city}
              onChange={setCity}
              autoComplete="address-level2"
              error={errorMap.city}
            />
            <Field
              id="zip"
              label="Postal code"
              value={postal}
              onChange={setPostal}
              autoComplete="postal-code"
              inputMode="numeric"
              error={errorMap.zip}
            />
          </div>
        </Fieldset>

        <Fieldset legend="Age verification">
          <p
            id="dob-help"
            className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)]"
          >
            We&rsquo;re required to verify your age on every order.
          </p>
          <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-3">
            <SelectField
              id="dob-month"
              label="Month"
              autoComplete="bday-month"
              value={dobMonth}
              onChange={setDobMonth}
              describedBy="dob-help"
              error={errorMap["dob-month"]}
              options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
            />
            <SelectField
              id="dob-day"
              label="Day"
              autoComplete="bday-day"
              value={dobDay}
              onChange={setDobDay}
              describedBy="dob-help"
              /* Visually invalidate alongside month; message lives on month only */
              error={errorMap["dob-month"]}
              showError={false}
              options={DAY_OPTIONS.map((d) => ({ value: String(d), label: String(d) }))}
            />
            <SelectField
              id="dob-year"
              label="Year"
              autoComplete="bday-year"
              value={dobYear}
              onChange={setDobYear}
              describedBy="dob-help"
              error={errorMap["dob-month"]}
              showError={false}
              options={YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) }))}
            />
          </div>
        </Fieldset>

        <Fieldset legend="Order notes (optional)">
          <label
            htmlFor="notes"
            className="block font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.65rem] text-[var(--color-parchment-dim)] mb-1.5"
          >
            Anything we should know?
          </label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-[var(--color-oak-deep)] border border-[var(--color-brass)]/30 px-4 py-3 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment)] focus:outline-none focus:border-[var(--color-brass-highlight)] focus:ring-2 focus:ring-[var(--color-brass-highlight)]/30"
          />
        </Fieldset>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[var(--color-brass)] hover:bg-[var(--color-brass-highlight)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-oak-deep)] font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs px-12 py-4 transition-all duration-300"
          >
            {submitting ? "Placing your order…" : "Place order — Cash on delivery"}
          </button>
          {submitting && (
            <span className="sr-only" role="status">
              Placing your order, please wait.
            </span>
          )}
          <p className="mt-4 font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-parchment-deep)]">
            By placing this order you confirm the details above and accept that
            payment is collected in cash on delivery.
          </p>
        </div>
      </div>

      <aside aria-label="Order summary" className="lg:sticky lg:top-32 lg:self-start">
        <div className="bg-[var(--color-oak-medium)] border border-[var(--color-brass)]/20 p-6">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.65rem] text-[var(--color-brass-highlight)]">
            Your selection
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl tracking-[0.04em] text-[var(--color-parchment)]">
            Order summary
          </h2>
          <BrassDivider className="mt-4 opacity-50" />
          <ul className="mt-4 divide-y divide-[var(--color-brass)]/15">
            {items.map((it) => (
              <li
                key={`${it.productId}-${it.variantSize ?? "base"}-${it.flavour ?? "none"}`}
                className="py-3 flex items-baseline justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.6rem] text-[var(--color-brass-highlight)]">
                    {it.brand}
                  </p>
                  <p className="font-[family-name:var(--font-cinzel)] text-base text-[var(--color-parchment)] truncate">
                    {it.name}
                  </p>
                  <p className="font-[family-name:var(--font-cormorant)] italic text-xs text-[var(--color-parchment-deep)]">
                    {[it.variantSize, it.flavour].filter(Boolean).join(" · ")}
                    {(it.variantSize || it.flavour) ? " · " : ""}qty {it.qty}
                  </p>
                </div>
                <p className="font-[family-name:var(--font-libre-caslon)] tabular-nums text-[var(--color-parchment)] text-sm">
                  {formatPriceUSD(it.unitPriceUSD * it.qty)}
                </p>
              </li>
            ))}
          </ul>
          <BrassDivider className="my-4 opacity-40" />
          {bulkDiscount > 0 && (
            <>
              <div className="flex items-baseline justify-between text-[var(--color-parchment-deep)]">
                <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem]">
                  Item total
                </span>
                <span className="font-[family-name:var(--font-libre-caslon)] tabular-nums text-sm">
                  {formatPriceUSD(itemsTotal)}
                </span>
              </div>
              <div
                aria-live="polite"
                className="mt-1 flex items-baseline justify-between text-[var(--color-brass-highlight)]"
              >
                <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem]">
                  Bulk discount
                </span>
                <span className="font-[family-name:var(--font-cinzel)] text-lg tabular-nums">
                  −{formatPriceUSD(bulkDiscount)}
                </span>
              </div>
              <BrassDivider className="my-3 opacity-30" />
            </>
          )}
          <div className="flex items-baseline justify-between">
            <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-parchment-dim)]">
              Subtotal
            </span>
            <span className="font-[family-name:var(--font-cinzel)] text-2xl tabular-nums text-[var(--color-parchment)]">
              {formatPriceUSD(subtotal)}
            </span>
          </div>
          <p className="mt-3 font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-parchment-deep)]">
            Cash on delivery only. No card details collected.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-[family-name:var(--font-cinzel)] text-xl tracking-[0.06em] text-[var(--color-parchment)]">
        {legend}
      </legend>
      <BrassDivider className="opacity-30 max-w-[120px]" />
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  error,
  optional = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  error?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.65rem] text-[var(--color-parchment-dim)] mb-1.5"
      >
        {label}
        {optional ? (
          <span className="ml-2 italic text-[var(--color-parchment-deep)] tracking-normal normal-case">
            (optional)
          </span>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="ml-1 text-[var(--color-brass-highlight)]"
            >
              *
            </span>
            <span className="sr-only"> required</span>
          </>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={!optional}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full bg-[var(--color-oak-deep)] border px-4 py-3 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment)] focus:outline-none focus:ring-2 ${
          error
            ? "border-[var(--color-oxblood)] focus:border-[var(--color-oxblood)] focus:ring-[var(--color-oxblood)]/30"
            : "border-[var(--color-brass)]/30 focus:border-[var(--color-brass-highlight)] focus:ring-[var(--color-brass-highlight)]/30"
        }`}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-oxblood)] flex items-center gap-1.5"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="7" /><path d="M8 4v5M8 11v.5" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  autoComplete,
  describedBy,
  error,
  showError = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  autoComplete?: string;
  describedBy?: string;
  error?: string;
  /** When false, invalidate visually but don't render the inline message
   *  (used on companion selects in a group where one select owns the message). */
  showError?: boolean;
}) {
  const errorId = `${id}-error`;
  const describedByIds = [describedBy, error && showError ? errorId : undefined]
    .filter(Boolean)
    .join(" ");
  const borderCls = error
    ? "border-[var(--color-oxblood)] focus:border-[var(--color-oxblood)] focus:ring-[var(--color-oxblood)]/30"
    : "border-[var(--color-brass)]/30 focus:border-[var(--color-brass-highlight)] focus:ring-[var(--color-brass-highlight)]/30";

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.65rem] text-[var(--color-parchment-dim)] mb-1.5"
      >
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        aria-describedby={describedByIds || undefined}
        aria-invalid={!!error}
        className={`w-full bg-[var(--color-oak-deep)] border px-3 py-3 font-[family-name:var(--font-libre-caslon)] text-[var(--color-parchment)] focus:outline-none focus:ring-2 ${borderCls}`}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && showError && (
        <p
          id={errorId}
          className="mt-1.5 font-[family-name:var(--font-cormorant)] italic text-sm text-[var(--color-oxblood)] flex items-center gap-1.5"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="7" />
            <path d="M8 4v5M8 11v.5" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
