"use client";

import * as React from "react";

import { DEFAULT_LENS, emptyLens, type Lens } from "./lens";
import { createLocalStore } from "./storage";

const store = createLocalStore<Lens>("contrary.lens", DEFAULT_LENS);

export function useLens() {
  const lens = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  const ready = React.useSyncExternalStore(
    store.subscribe,
    () => true,
    () => false
  );

  const save = React.useCallback((next: Lens) => {
    store.set(next);
  }, []);

  const clear = React.useCallback(() => {
    store.set(emptyLens());
  }, []);

  return { lens, ready, save, clear };
}
