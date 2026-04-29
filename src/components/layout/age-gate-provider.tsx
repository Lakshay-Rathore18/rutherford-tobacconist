"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { AgeGateModal } from "./age-gate-modal";
import {
  STORAGE_KEY,
  type AgeVerificationRecord,
} from "@/lib/age-verification";
import { useLocalStorageRaw, useIsClient } from "@/lib/hooks";

// Routes that bypass the global age gate. The walk-in QR sign-up has its own
// in-form 18+ confirmation checkbox; layering the modal on top would block
// the QR-scan-to-form flow entirely. The form still enforces age legally.
const AGE_GATE_BYPASS_ROUTES = new Set(["/welcome"]);

/**
 * Wraps the app and renders the age-gate modal until the visitor has verified.
 * Permanent localStorage — modal only re-appears if storage is cleared.
 *
 * Subscribes to localStorage via useSyncExternalStore so a successful verify
 * (which writes the key + dispatches `rt-localstorage`) re-renders this
 * provider synchronously without onVerified callback round-trips.
 */
export function AgeGateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bypassed = AGE_GATE_BYPASS_ROUTES.has(pathname ?? "");
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

  // Return focus to <main> when the gate transitions from blocking to verified.
  // Without this, focus is lost to <body> and keyboard users have to re-Tab
  // from scratch into the page.
  const wasBlocking = useRef(false);
  useEffect(() => {
    if (!isClient) return;
    if (!verified && !wasBlocking.current) {
      wasBlocking.current = true;
      return;
    }
    if (verified && wasBlocking.current) {
      wasBlocking.current = false;
      const main = document.getElementById("main");
      if (main) {
        // Use rAF so the modal's exit animation/portal-unmount completes first.
        requestAnimationFrame(() => main.focus());
      }
    }
  }, [verified, isClient]);

  // Don't SSR-render the modal — preserves the original "modal only mounts
  // post-hydration" behavior so search engines and the SSR'd HTML stay clean.
  // useIsClient + useLocalStorageRaw both use useSyncExternalStore, so
  // hydration matches SSR (both false) then flips synchronously on first
  // client render with the real localStorage value.
  return (
    <>
      {children}
      {isClient && !verified && !bypassed && <AgeGateModal onVerified={() => {}} />}
    </>
  );
}
