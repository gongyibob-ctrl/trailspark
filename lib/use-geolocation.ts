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

// Sub-meter jitter from watchPosition would cascade re-renders into every
// trail card and the map marker. ~5e-5° ≈ 5m at the equator (and ≤6m
// anywhere on the West Coast given cos(50°) ≈ 0.64).
const JITTER_DEG = 5e-5;

export function useGeolocation(opts: UseGeoOptions = {}) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);

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
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const prev = lastPosRef.current;
        if (
          prev &&
          Math.abs(lat - prev.lat) < JITTER_DEG &&
          Math.abs(lng - prev.lng) < JITTER_DEG
        ) {
          return;
        }
        lastPosRef.current = { lat, lng };
        setPosition({ lat, lng, accuracy: pos.coords.accuracy, ts: pos.timestamp });
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
