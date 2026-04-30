"use client";

import { useEffect, useState } from "react";
import { parseGPX, thinPoints } from "./gpx";

// User-uploaded GPX trails, stored entirely in localStorage. No backend, no
// account — just a personal scratch pad for "I have my own GPX file from
// Strava/Garmin and want to see it on Trailspark."

const STORAGE_KEY = "trailspark.uploads.v1";
const CHANGE_EVENT = "trailspark:uploads-changed";
const MAX_UPLOADS = 10; // localStorage budget — ~5MB total across the app

export interface UserTrail {
  id: string; // "user-{ts}-{slug}"
  name: string;
  filename: string;
  uploadedAt: string; // ISO
  /** [lng, lat][] — thinned for storage but still detailed enough for rendering */
  points: [number, number][];
  /** Elevation in ft, parallel to points */
  feet: number[];
  start: [number, number];
  bounds: [[number, number], [number, number]];
  miles: number;
  gainFt: number;
}

function read(): UserTrail[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as UserTrail[]) : [];
  } catch {
    return [];
  }
}
function write(list: UserTrail[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (e: any) {
    // localStorage quota — most likely cause is too many large GPX files
    throw new Error(
      e?.name === "QuotaExceededError"
        ? "Storage full — try deleting some uploads"
        : (e?.message ?? "Failed to save upload"),
    );
  }
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.gpx$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

export async function ingestGPXFile(file: File): Promise<UserTrail> {
  if (!file.name.toLowerCase().endsWith(".gpx")) {
    throw new Error("Please upload a .gpx file");
  }
  const text = await file.text();
  const parsed = parseGPX(text);

  const thinnedPts = thinPoints(parsed.points);
  const thinnedFt =
    parsed.feet.length === parsed.points.length
      ? thinPoints(parsed.feet, thinnedPts.length)
      : [];

  const trail: UserTrail = {
    id: `user-${Date.now()}-${slug(file.name) || "track"}`,
    name: parsed.name || file.name.replace(/\.gpx$/i, ""),
    filename: file.name,
    uploadedAt: new Date().toISOString(),
    points: thinnedPts,
    feet: thinnedFt,
    start: parsed.start,
    bounds: parsed.bounds,
    miles: parsed.miles,
    gainFt: parsed.gainFt,
  };
  return trail;
}

export function useUploads() {
  const [uploads, setUploads] = useState<UserTrail[]>([]);

  useEffect(() => {
    setUploads(read());
    const onChange = () => setUploads(read());
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const add = (t: UserTrail) => {
    const next = [t, ...read()].slice(0, MAX_UPLOADS);
    write(next);
    setUploads(next);
  };
  const remove = (id: string) => {
    const next = read().filter((t) => t.id !== id);
    write(next);
    setUploads(next);
  };

  return { uploads, add, remove, max: MAX_UPLOADS };
}

export function getUpload(id: string): UserTrail | null {
  return read().find((t) => t.id === id) ?? null;
}
