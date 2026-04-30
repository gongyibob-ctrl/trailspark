// Trail-line geometries are large (~600 KB). We serve them from /public so they
// stream in lazily and don't bloat the initial JS bundle.
//
// Usage:
//   await loadGeometries();
//   getGeometry(trailId)  // sync after load resolves
//   buildLinesFeatureCollection(trails)
//
// Until loadGeometries() resolves, the accessors return null / empty collections.

import { DIFFICULTY_COLOR } from "./types";
import type { Trail, TrailGeometry, TrailGeometryEntry } from "./types";

const FETCH_URL = "/geometries.json";

let cache: Record<string, TrailGeometryEntry> = {};
let loaded = false;
let pending: Promise<void> | null = null;

export function loadGeometries(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (pending) return pending;
  pending = fetch(FETCH_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`geometries fetch ${r.status}`);
      return r.json() as Promise<Record<string, TrailGeometryEntry>>;
    })
    .then((d) => {
      cache = d;
      loaded = true;
    })
    .catch((e) => {
      console.error("[geometries] load failed:", e);
      loaded = true; // give up; sync APIs will treat as missing
    });
  return pending;
}

export function isLoaded(): boolean {
  return loaded;
}

export function geometryCount(): number {
  return Object.keys(cache).length;
}

export function hasGeometry(trailId: string): boolean {
  return Boolean(cache[trailId]?.geom);
}

export function getGeometry(trailId: string): TrailGeometry | null {
  return cache[trailId]?.geom ?? null;
}

/** Returns [[west, south], [east, north]] or null if no geometry. */
export function getBounds(trailId: string): [[number, number], [number, number]] | null {
  const entry = cache[trailId];
  if (!entry?.geom) return null;
  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity;
  const visit = (line: number[][]) => {
    for (const [lng, lat] of line) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  };
  if (entry.geom.type === "LineString") visit(entry.geom.coordinates as number[][]);
  else for (const ls of entry.geom.coordinates as number[][][]) visit(ls);
  if (!isFinite(minLng)) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function buildLinesFeatureCollection(trails: Trail[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (const t of trails) {
    const entry = cache[t.id];
    if (!entry?.geom) continue;
    features.push({
      type: "Feature",
      geometry: entry.geom as GeoJSON.LineString | GeoJSON.MultiLineString,
      properties: {
        id: t.id,
        name: t.name,
        difficulty: t.difficulty,
        type: t.type,
        color: DIFFICULTY_COLOR[t.difficulty],
      },
    });
  }
  return { type: "FeatureCollection", features };
}
