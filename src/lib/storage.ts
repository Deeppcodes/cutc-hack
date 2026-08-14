"use client";

type Listener = () => void;

export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<Listener>();
  let cache: T | null = null;

  function subscribe(fn: Listener) {
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

  function getSnapshot(): T {
    if (cache !== null) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      cache = fallback;
    }
    return cache as T;
  }

  function set(next: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Session still updates even if storage is blocked.
    }
    cache = next;
    listeners.forEach((fn) => fn());
  }

  return {
    subscribe,
    getSnapshot,
    getServerSnapshot: () => fallback,
    set,
  };
}
