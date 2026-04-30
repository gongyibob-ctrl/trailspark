"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  ts: number;
}

export type GeoStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

interface UseGeoOptions {
  highAccuracy?: boolean;
}

// Live position via watchPosition. Caller decides when to start; the watcher
// is cleaned up on unmount or when stop() is called. Updates only fire when
// the device reports a new fix, so no polling cost when idle.
export function useGeolocation(opts: UseGeoOptions = {}) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      setError("Geolocation API not supported by this browser");
      return;
    }
    if (watchIdRef.current != null) return;
    setStatus("prompting");
    setError(null);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ts: pos.timestamp,
        });
        setStatus("granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus("denied");
        else if (err.code === err.POSITION_UNAVAILABLE) setStatus("unavailable");
        else setStatus("error");
        setError(err.message);
      },
      {
        enableHighAccuracy: opts.highAccuracy ?? true,
        maximumAge: 30_000,
        timeout: 20_000,
      },
    );
    watchIdRef.current = id;
  }, [opts.highAccuracy]);

  const stop = useCallback(() => {
    if (watchIdRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { position, status, error, start, stop };
}
