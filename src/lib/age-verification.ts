/**
 * Age verification — 18+ minimum, permanent localStorage (no expiry).
 *
 * Founder-locked decisions:
 *   - MIN_AGE = 18 (not 21)
 *   - Persistence is permanent — no expiry on the verified flag
 *   - Customer must clear localStorage to re-verify
 *   - Checkout DOB re-verify ALWAYS runs (legal teeth + per-order audit)
 */

export const MIN_AGE = 18;
export const STORAGE_KEY = "rt_age_verified";

export type AgeVerificationRecord = {
  verified: true;
  verifiedAt: string; // ISO 8601
};

/**
 * Calendar-correct age check accounting for leap years and exact day comparison.
 * Returns true iff DOB makes the person AT LEAST `minAge` years old TODAY.
 */
export function isAtLeastAge(
  dob: { year: number; month: number; day: number },
  minAge: number = MIN_AGE,
): boolean {
  if (!Number.isFinite(dob.year) || !Number.isFinite(dob.month) || !Number.isFinite(dob.day)) {
    return false;
  }
  if (dob.month < 1 || dob.month > 12) return false;
  if (dob.day < 1 || dob.day > 31) return false;

  const today = new Date();
  const birth = new Date(dob.year, dob.month - 1, dob.day);
  // Reject impossible dates (e.g. Feb 30 → Mar 2)
  if (
    birth.getFullYear() !== dob.year ||
    birth.getMonth() !== dob.month - 1 ||
    birth.getDate() !== dob.day
  ) {
    return false;
  }
  if (birth > today) return false;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= minAge;
}

/**
 * Read verification status from localStorage. Permanent, no expiry.
 * SSR-safe: returns false on the server.
 */
export function getVerificationStatus(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<AgeVerificationRecord>;
    return parsed.verified === true && typeof parsed.verifiedAt === "string";
  } catch {
    return false;
  }
}

/**
 * Persist verification permanently. Caller is responsible for having validated DOB ≥ MIN_AGE.
 */
export function setVerified(): void {
  if (typeof window === "undefined") return;
  const record: AgeVerificationRecord = {
    verified: true,
    verifiedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Quota / disabled storage — modal will simply re-appear on next visit.
  }
}

/**
 * Clear verification (rare — for testing or "forget me" support flow).
 */
export function clearVerification(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Hash a DOB for audit storage. Uses SubtleCrypto SHA-256.
 * Salt is per-order so the same DOB across orders produces different hashes
 * (prevents cross-order DOB correlation if storage leaks).
 */
export async function hashDob(
  dob: { year: number; month: number; day: number },
  orderId: string,
): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return "[hash-unavailable-on-server]";
  }
  const input = `${dob.year}-${dob.month.toString().padStart(2, "0")}-${dob.day
    .toString()
    .padStart(2, "0")}:${orderId}:rutherford-salt-v1`;
  const buf = new TextEncoder().encode(input);
  const hash = await window.crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
