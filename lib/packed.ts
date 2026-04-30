"use client";

import { useEffect, useState } from "react";

// "Packed" state per trail — when the user is prepping for a trip, they tick
// off gear they've already loaded into their pack. Persists in localStorage so
// the marks survive a page reload but are scoped per trail (a tent packed for
// JMT shouldn't appear pre-checked when you open Mt Whitney).

const KEY_PREFIX = "trailspark.packed.";
const CHANGE_EVENT = "trailspark:packed-changed";

function read(trailId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY_PREFIX + trailId);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}
function write(trailId: string, s: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    if (s.size === 0) localStorage.removeItem(KEY_PREFIX + trailId);
    else localStorage.setItem(KEY_PREFIX + trailId, JSON.stringify(Array.from(s)));
  } catch {
    // ignore quota errors
  }
}

export function usePackedGear(trailId: string | null) {
  const [packed, setPacked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!trailId) {
      setPacked(new Set());
      return;
    }
    setPacked(read(trailId));
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ trailId: string }>).detail;
      if (!detail || detail.trailId === trailId) setPacked(read(trailId));
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, [trailId]);

  const toggle = (itemName: string) => {
    if (!trailId) return;
    setPacked((prev) => {
      const next = new Set(prev);
      if (next.has(itemName)) next.delete(itemName);
      else next.add(itemName);
      write(trailId, next);
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { trailId } }));
      return next;
    });
  };

  const clearAll = () => {
    if (!trailId) return;
    setPacked(new Set());
    write(trailId, new Set());
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { trailId } }));
  };

  return { packed, toggle, clearAll };
}
