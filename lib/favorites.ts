"use client";

import { useEffect, useState } from "react";

const KEY = "trailspark.favorites.v1";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function write(s: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(s)));
  } catch {
    // ignore quota errors
  }
}

const STORAGE_EVENT = "trailspark:favorites-changed";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  // Hydrate after mount to avoid SSR/CSR mismatch
  useEffect(() => {
    setFavorites(read());
    const onChange = () => setFavorites(read());
    window.addEventListener(STORAGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      write(next);
      window.dispatchEvent(new Event(STORAGE_EVENT));
      return next;
    });
  };

  return { favorites, toggle };
}
