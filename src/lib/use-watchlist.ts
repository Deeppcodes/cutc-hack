"use client";

import * as React from "react";

const KEY = "contrary.watchlist";
/** Pre-seeded so the watchlist is never empty during a demo. */
const DEFAULTS = ["gpt-next-2026", "foldable-2027", "boc-cut-oct-2026"];

function read(): string[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useWatchlist() {
  const [ids, setIds] = React.useState<string[]>(DEFAULTS);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setIds(read());
    setReady(true);
  }, []);

  const persist = React.useCallback((next: string[]) => {
    setIds(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable — the in-memory list still works for this session.
    }
  }, []);

  const toggle = React.useCallback(
    (id: string) => {
      persist(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    },
    [ids, persist]
  );

  return { ids, ready, toggle, has: (id: string) => ids.includes(id) };
}
