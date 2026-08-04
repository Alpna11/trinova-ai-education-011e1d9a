import { useEffect, useState } from "react";

/**
 * Tiny cross-component persisted store (localStorage + subscribers).
 * Used for user preferences that several panels share: theme, tutor mode, bilingual.
 */
export function createLocalStore<T>(key: string, initial: T) {
  let value = initial;
  let hydrated = false;
  const listeners = new Set<(v: T) => void>();

  function hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) value = JSON.parse(raw) as T;
    } catch {
      /* ignore malformed storage */
    }
  }

  function get() {
    hydrate();
    return value;
  }

  function set(next: T) {
    value = next;
    hydrated = true;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage may be unavailable */
      }
    }
    listeners.forEach((l) => l(next));
  }

  function useStore(): [T, (next: T) => void] {
    const [state, setState] = useState<T>(initial);

    useEffect(() => {
      setState(get());
      const listener = (v: T) => setState(v);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, []);

    return [state, set];
  }

  return { get, set, useStore };
}
