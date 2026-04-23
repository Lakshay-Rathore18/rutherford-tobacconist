"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchStockMap,
  type StockEntry,
  type StockMap,
} from "@/lib/stock";

type StockContextValue = {
  map: StockMap;
  loading: boolean;
  /** True once the initial fetch has resolved (success or failure). */
  ready: boolean;
  /** Imperative refetch — used by focus/visibility and manual retry. */
  refresh: () => Promise<void>;
  /** Announce a stock-state change to screen readers via the shared live region. */
  announce: (msg: string) => void;
};

const StockContext = createContext<StockContextValue | null>(null);

/**
 * Wraps the app, runs one `fetchStockMap()` on mount, refetches on
 * visibilitychange + window focus, and hosts the shared aria-live polite
 * region for stock-change announcements.
 *
 * Optimistic policy: until the first fetch resolves, consumers see `undefined`
 * stock entries which every availability helper treats as "saleable" — we
 * never show a false OOS during initial paint.
 */
export function StockProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<StockMap>({});
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const liveRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchStockMap();
      setMap(next);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Kick off the initial fetch on mount. `refresh()` is async — the only
    // synchronous state update is `setLoading(true)`, which is a no-op since
    // `useState(true)` already initializes loading to true. The remaining
    // setState calls land inside the awaited callback, so this is the
    // "subscribe to external system" effect shape React docs endorse, not a
    // setState cascade. Lint rule can't see across the async boundary.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onFocus = () => void refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const announce = useCallback((msg: string) => {
    const node = liveRef.current;
    if (!node) return;
    // Clear first so repeat messages with identical text re-announce.
    node.textContent = "";
    requestAnimationFrame(() => {
      if (liveRef.current) liveRef.current.textContent = msg;
    });
  }, []);

  const value = useMemo<StockContextValue>(
    () => ({ map, loading, ready, refresh, announce }),
    [map, loading, ready, refresh, announce],
  );

  return (
    <StockContext.Provider value={value}>
      {children}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        role="status"
        className="sr-only"
      />
    </StockContext.Provider>
  );
}

/** Per-family entry (undefined = not yet loaded or unmapped → treat as saleable). */
export function useStockEntry(productId: string): StockEntry | undefined {
  const { map } = useStockStateOrNull() ?? { map: {} as StockMap };
  return map[productId];
}

/** Announce helper — safe no-op outside the provider. */
export function useStockAnnounce(): (msg: string) => void {
  const ctx = useContext(StockContext);
  return ctx?.announce ?? (() => {});
}

function useStockStateOrNull(): StockContextValue | null {
  return useContext(StockContext);
}
