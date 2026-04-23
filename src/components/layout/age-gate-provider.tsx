"use client";

import { useMemo } from "react";
import { AgeGateModal } from "./age-gate-modal";
import {
  STORAGE_KEY,
  type AgeVerificationRecord,
} from "@/lib/age-verification";
import { useLocalStorageRaw, useIsClient } from "@/lib/hooks";

/**
 * Wraps the app and renders the age-gate modal until the visitor has verified.
 * Permanent localStorage — modal only re-appears if storage is cleared.
 *
 * Subscribes to localStorage via useSyncExternalStore so a successful verify
 * (which writes the key + dispatches `rt-localstorage`) re-renders this
 * provider synchronously without onVerified callback round-trips.
 */
export function AgeGateProvider({ children }: { children: React.ReactNode }) {
  const raw = useLocalStorageRaw(STORAGE_KEY);
  const isClient = useIsClient();
  const verified = useMemo(() => {
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw) as Partial<AgeVerificationRecord>;
      return (
        parsed.verified === true && typeof parsed.verifiedAt === "string"
      );
    } catch {
      return false;
    }
  }, [raw]);

  // Don't SSR-render the modal — preserves the original "modal only mounts
  // post-hydration" behavior so search engines and the SSR'd HTML stay clean.
  // useIsClient + useLocalStorageRaw both use useSyncExternalStore, so
  // hydration matches SSR (both false) then flips synchronously on first
  // client render with the real localStorage value.
  return (
    <>
      {children}
      {isClient && !verified && <AgeGateModal onVerified={() => {}} />}
    </>
  );
}
