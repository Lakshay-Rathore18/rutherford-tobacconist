"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe shared client hooks. All built on `useSyncExternalStore`, which
 * is React's sanctioned escape hatch for "subscribe to a thing outside
 * React's data flow without setState-in-effect." This is the React 19
 * approved replacement for the `useEffect(() => setX(matchMedia(...)))`
 * pattern that triggers `react-hooks/set-state-in-effect`.
 *
 * Every hook here returns a sensible SSR fallback so the server-rendered
 * HTML stays stable. The real value populates on the first client render
 * via getSnapshot — no flicker, no useState.
 */

// One stable no-op subscriber so React doesn't tear-loop on identity churn.
const NOOP_SUBSCRIBE: () => () => void = () => () => {};

/**
 * Subscribe to a CSS media query. Returns the current match boolean and
 * re-renders when the query result flips (viewport resize, OS-level pref
 * change, etc.). On the server returns `ssrValue` (default false).
 */
export function useMediaQuery(query: string, ssrValue = false): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => ssrValue,
  );
}

/** True when the user prefers reduced motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

/**
 * True when viewport ≥ 768px AND pointer is fine (mouse/trackpad).
 * Matches the project's "desktop / non-touch" gating used for pinned
 * ScrollTrigger sections that fight iOS Safari address-bar collapse.
 */
export function useDesktop(): boolean {
  return useMediaQuery("(min-width: 768px) and (pointer: fine)", false);
}

/** True when the pointer is coarse (touch). */
export function useCoarsePointer(): boolean {
  return useMediaQuery("(pointer: coarse)", false);
}

/**
 * True when the user has Data Saver enabled. SSR-safe — returns false on
 * the server and on browsers that don't expose `navigator.connection`.
 */
export function useSaveData(): boolean {
  const subscribe = useCallback((cb: () => void) => {
    if (typeof navigator === "undefined") return () => {};
    const conn = (
      navigator as unknown as {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    if (!conn || typeof conn.addEventListener !== "function") return () => {};
    conn.addEventListener("change", cb);
    return () => conn.removeEventListener("change", cb);
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => {
      const conn = (
        navigator as unknown as { connection?: { saveData?: boolean } }
      ).connection;
      return conn?.saveData ?? false;
    },
    () => false,
  );
}

/**
 * Subscribe to a single localStorage key. Returns the raw stored string
 * (or null if absent). Cross-tab updates fire via the `storage` event;
 * same-tab updates fire via a custom `rt-localstorage` event that callers
 * can dispatch from setters they control. Returns `null` during SSR.
 *
 * Consumers should `useMemo` JSON.parse on the result so referential
 * equality is preserved across re-renders that didn't change the value.
 */
export function useLocalStorageRaw(key: string): string | null {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (typeof window === "undefined") return () => {};
      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) cb();
      };
      const onLocal = (e: Event) => {
        if ((e as CustomEvent<string>).detail === key) cb();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener("rt-localstorage", onLocal as EventListener);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(
          "rt-localstorage",
          onLocal as EventListener,
        );
      };
    },
    [key],
  );
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

/**
 * Notify same-tab subscribers that a localStorage key changed. Setters
 * that want hooks to re-render should dispatch this AFTER calling
 * `localStorage.setItem`. The browser's native `storage` event only
 * fires in OTHER tabs — same-tab listeners are a known DOM gap.
 */
export function notifyLocalStorageChange(key: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("rt-localstorage", { detail: key }));
}

/**
 * True after the first client render commits. Useful for "is this the
 * client?" gates without triggering set-state-in-effect.
 *
 * Implementation note: useSyncExternalStore returns the client snapshot
 * from the very first client render, so this is `true` by paint time.
 * Use this only when you genuinely need to know mount status (rare —
 * derived render-time logic is almost always cleaner).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false,
  );
}
