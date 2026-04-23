"use client";

import { useEffect, useState } from "react";
import { AgeGateModal } from "./age-gate-modal";
import { getVerificationStatus } from "@/lib/age-verification";

/**
 * Wraps the app and renders the age-gate modal until the visitor has verified.
 * Permanent localStorage — modal only re-appears if storage is cleared.
 */
export function AgeGateProvider({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    setVerified(getVerificationStatus());
  }, []);

  // While we don't yet know (SSR / first paint), render children but the modal
  // is effectively closed. The modal mounts client-side only and will pop up
  // on first paint if needed. The visual flash is mitigated by oak background.
  return (
    <>
      {children}
      {verified === false && (
        <AgeGateModal onVerified={() => setVerified(true)} />
      )}
    </>
  );
}
