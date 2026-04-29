"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_AGE, setVerified } from "@/lib/age-verification";

type FieldErrors = Partial<Record<"firstName" | "lastName" | "phone" | "age" | "form", string>>;

const REDIRECT_DELAY_MS = 6000; // long enough that SR users can read + cancel (WCAG 2.2.1)

export function WelcomeForm({ source }: { source: string }) {
  const router = useRouter();

  const firstNameId = useId();
  const lastNameId = useId();
  const phoneId = useId();
  const ageId = useId();
  const statusId = useId();

  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const continueBtnRef = useRef<HTMLButtonElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [autoRedirectCancelled, setAutoRedirectCancelled] = useState(false);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!firstName.trim()) e.firstName = "Enter your first name.";
    else if (firstName.trim().length > 60) e.firstName = "First name is too long.";
    if (lastName.trim().length > 60) e.lastName = "Last name is too long.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) e.phone = "Enter a valid phone number.";
    if (!ageConfirmed) e.age = `You must be ${MIN_AGE} or older.`;
    return e;
  }

  function focusField(field: keyof FieldErrors) {
    const refMap: Partial<Record<keyof FieldErrors, React.RefObject<HTMLInputElement | null>>> = {
      firstName: firstNameRef,
      lastName: lastNameRef,
      phone: phoneRef,
      age: ageRef,
    };
    refMap[field]?.current?.focus();
  }

  function focusFirstError(e: FieldErrors) {
    if (e.firstName) firstNameRef.current?.focus();
    else if (e.lastName) lastNameRef.current?.focus();
    else if (e.phone) phoneRef.current?.focus();
    else if (e.age) ageRef.current?.focus();
    else summaryRef.current?.focus();
  }

  // Auto-redirect on success (WCAG 2.2.1 Timing Adjustable: long enough delay,
  // and a cancel control + explicit Continue button).
  useEffect(() => {
    if (!success || autoRedirectCancelled) return;
    const t = window.setTimeout(() => {
      router.push("/");
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [success, autoRedirectCancelled, router]);

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (submitting || success) return;

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => focusFirstError(e));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register-walkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          ageConfirmed: true,
          source,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setErrors({ form: json.error ?? "Could not save right now. Please try again." });
        setSubmitting(false);
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }

      // Persist global age-verified flag — they confirmed 18+ in this form,
      // so the home-page DOB modal should not re-appear after redirect.
      setVerified();
      setSuccess(true);
      requestAnimationFrame(() => continueBtnRef.current?.focus());
    } catch {
      setErrors({ form: "Network error. Try again in a moment." });
      setSubmitting(false);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  const hasFieldErrors = Boolean(errors.firstName || errors.lastName || errors.phone || errors.age);
  const showErrorSummary = hasFieldErrors || Boolean(errors.form);
  // Keying the alert by the joined error keys forces a fresh node insertion each
  // submit so screen readers reliably announce subsequent error states.
  const errorAlertKey = errors.form ? `form:${errors.form}` : Object.keys(errors).sort().join("|");

  if (success) {
    return (
      <div
        ref={successRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="rounded-lg border border-border bg-muted/30 p-5 text-center"
      >
        <p className="text-base font-medium">You&rsquo;re all set, {firstName.trim().split(/\s+/)[0]}.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&rsquo;ve saved your details. You can head to the shop whenever you&rsquo;re ready.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            ref={continueBtnRef}
            type="button"
            size="lg"
            className="h-12 w-full text-base"
            onClick={() => router.push("/")}
          >
            Continue to shop
          </Button>
          {!autoRedirectCancelled ? (
            <button
              type="button"
              onClick={() => setAutoRedirectCancelled(true)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Stay on this page (cancel auto-redirect)
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">Auto-redirect cancelled.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        {showErrorSummary ? (
          <div
            ref={summaryRef}
            key={errorAlertKey}
            tabIndex={-1}
            role="alert"
            className="rounded-lg border-2 border-destructive bg-background p-3 text-sm text-foreground outline-none"
          >
            {errors.form ? (
              <p className="font-medium">{errors.form}</p>
            ) : (
              <>
                <p className="font-medium">Please fix the highlighted fields:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {errors.firstName && (
                    <li>
                      <button
                        type="button"
                        onClick={() => focusField("firstName")}
                        className="underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {errors.firstName}
                      </button>
                    </li>
                  )}
                  {errors.lastName && (
                    <li>
                      <button
                        type="button"
                        onClick={() => focusField("lastName")}
                        className="underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {errors.lastName}
                      </button>
                    </li>
                  )}
                  {errors.phone && (
                    <li>
                      <button
                        type="button"
                        onClick={() => focusField("phone")}
                        className="underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {errors.phone}
                      </button>
                    </li>
                  )}
                  {errors.age && (
                    <li>
                      <button
                        type="button"
                        onClick={() => focusField("age")}
                        className="underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {errors.age}
                      </button>
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        ) : null}

        <fieldset className="space-y-5 border-0 p-0">
          <legend className="sr-only">Your details</legend>

          <div className="space-y-1.5">
            <Label htmlFor={firstNameId}>
              First name <span aria-hidden="true" className="text-destructive">*</span>
              <span className="sr-only"> (required)</span>
            </Label>
            <Input
              id={firstNameId}
              ref={firstNameRef}
              name="firstName"
              type="text"
              autoComplete="given-name"
              autoCapitalize="words"
              spellCheck={false}
              required
              aria-required="true"
              aria-invalid={errors.firstName ? "true" : undefined}
              aria-describedby={errors.firstName ? `${firstNameId}-err` : undefined}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 text-base"
              disabled={submitting}
            />
            {errors.firstName ? (
              <p id={`${firstNameId}-err`} className="text-sm font-medium text-destructive">
                {errors.firstName}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={lastNameId}>Last name (optional)</Label>
            <Input
              id={lastNameId}
              ref={lastNameRef}
              name="lastName"
              type="text"
              autoComplete="family-name"
              autoCapitalize="words"
              spellCheck={false}
              aria-invalid={errors.lastName ? "true" : undefined}
              aria-describedby={errors.lastName ? `${lastNameId}-err` : undefined}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 text-base"
              disabled={submitting}
            />
            {errors.lastName ? (
              <p id={`${lastNameId}-err`} className="text-sm font-medium text-destructive">
                {errors.lastName}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={phoneId}>
              Phone number <span aria-hidden="true" className="text-destructive">*</span>
              <span className="sr-only"> (required)</span>
            </Label>
            <Input
              id={phoneId}
              ref={phoneRef}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              pattern="[0-9 +()\-]*"
              required
              aria-required="true"
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={`${phoneId}-hint${errors.phone ? ` ${phoneId}-err` : ""}`}
              placeholder="0412 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 text-base"
              disabled={submitting}
            />
            <p id={`${phoneId}-hint`} className="text-xs text-muted-foreground">
              Australian mobile or landline. Used for order updates only.
            </p>
            {errors.phone ? (
              <p id={`${phoneId}-err`} className="text-sm font-medium text-destructive">
                {errors.phone}
              </p>
            ) : null}
          </div>
        </fieldset>

        <fieldset
          className={`rounded-lg border p-3 ${
            errors.age ? "border-destructive bg-destructive/5" : "border-border bg-muted/30"
          }`}
        >
          <legend className="sr-only">Age verification</legend>
          <label htmlFor={ageId} className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
            <input
              id={ageId}
              ref={ageRef}
              type="checkbox"
              name="ageConfirmed"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              required
              aria-required="true"
              aria-invalid={errors.age ? "true" : undefined}
              aria-describedby={errors.age ? `${ageId}-err` : undefined}
              disabled={submitting}
              className="mt-0.5 size-6 shrink-0 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
            />
            <span>
              I confirm I am {MIN_AGE} years of age or older.{" "}
              <span aria-hidden="true" className="text-destructive">*</span>
              <span className="sr-only"> (required)</span>
            </span>
          </label>
          {errors.age ? (
            <p id={`${ageId}-err`} className="mt-2 text-sm font-medium text-destructive">
              {errors.age}
            </p>
          ) : null}
        </fieldset>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full text-base"
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Save & continue"}
        </Button>
      </form>

      <div
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {submitting ? "Saving your details." : ""}
      </div>
    </>
  );
}
