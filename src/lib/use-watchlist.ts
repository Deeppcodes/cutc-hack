"use client";

import * as React from "react";

import { createLocalStore } from "./storage";

const DEFAULTS = ["gpt-next-2026", "foldable-2027", "boc-cut-oct-2026"];
const store = createLocalStore<string[]>("contrary.watchlist", DEFAULTS);

export function useWatchlist() {
  const ids = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  const ready = React.useSyncExternalStore(
    store.subscribe,
    () => true,
    () => false
  );

  const toggle = React.useCallback((id: string) => {
    const current = store.getSnapshot();
    store.set(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }, []);

  return { ids, ready, toggle, has: (id: string) => ids.includes(id) };
}
