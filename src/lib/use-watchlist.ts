"use client";

import * as React from "react";

const KEY = "contrary.watchlist";
/** Pre-seeded so the watchlist is never empty during a demo. */
const DEFAULTS = ["gpt-next-2026", "foldable-2027", "boc-cut-oct-2026"];

const listeners = new Set<() => void>();
let cache: string[] | null = null;

function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", invalidate);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", invalidate);
  };
}

function invalidate() {
  cache = null;
  listeners.forEach((fn) => fn());
}

// useSyncExternalStore compares by reference, so the parsed array is cached
// until something actually changes it.
function getSnapshot(): string[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    cache = Array.isArray(parsed) ? (parsed as string[]) : DEFAULTS;
  } catch {
    cache = DEFAULTS;
  }
  return cache;
}

function getServerSnapshot(): string[] {
  return DEFAULTS;
}

export function useWatchlist() {
  const ids = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const ready = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const toggle = React.useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable — the session still gets the update below.
    }
    cache = next;
    listeners.forEach((fn) => fn());
  }, []);

  return { ids, ready, toggle, has: (id: string) => ids.includes(id) };
}
