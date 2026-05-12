// Trail-line geometries are split across two files to keep first paint fast:
//   /geometries.json           — curated trails (~830 KB), eager on map mount
//   /geometries-imported.json  — OSM imports (~6.8 MB), background prefetched
//
// Both populate the same in-memory accessor surface so callers can ignore the
// split. Order of guarantees:
//   loadGeometries()           — resolves when curated cache is ready
//   prefetchImportedGeometries() — kicks off background load; resolves when
//                                  imported cache is ready (or fails silently)
//
// Sync accessors (getGeometry / hasGeometry / getBounds) check both caches;
// return null until the relevant layer is loaded. buildLinesFeatureCollection
// only emits features for trails whose geometry is currently loaded — the
// UI re-runs the build effect after each layer arrives.

import { DIFFICULTY_COLOR } from "./types";
import type { Trail, TrailGeometry, TrailGeometryEntry } from "./types";

const CURATED_URL  = "/geometries.json";
const IMPORTED_URL = "/geometries-imported.json";

let curatedCache:  Record<string, TrailGeometryEntry> = {};
let importedCache: Record<string, TrailGeometryEntry> = {};
let curatedLoaded  = false;
let importedLoaded = false;
let curatedPending:  Promise<void> | null = null;
let importedPending: Promise<void> | null = null;

function fetchLayer(url: string): Promise<Record<string, TrailGeometryEntry>> {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`geometries fetch ${url} → ${r.status}`);
    return r.json() as Promise<Record<string, TrailGeometryEntry>>;
  });
}

export function loadGeometries(): Promise<void> {
  if (curatedLoaded) return Promise.resolve();
  if (curatedPending) return curatedPending;
  curatedPending = fetchLayer(CURATED_URL)
    .then((d) => { curatedCache = d; curatedLoaded = true; })
    .catch((e) => {
      console.error("[geometries] curated load failed:", e);
      curatedLoaded = true; // give up; sync APIs treat as missing
    });
  return curatedPending;
}

/** Kick off the imported-geometry fetch in the background. Safe to call
 *  multiple times — it's idempotent and resolves to the same Promise. */
export function prefetchImportedGeometries(): Promise<void> {
  if (importedLoaded) return Promise.resolve();
  if (importedPending) return importedPending;
  importedPending = fetchLayer(IMPORTED_URL)
    .then((d) => { importedCache = d; importedLoaded = true; })
    .catch((e) => {
      console.error("[geometries] imported load failed:", e);
      importedLoaded = true;
    });
  return importedPending;
}

export function isLoaded(): boolean {
  return curatedLoaded;
}

export function isImportedLoaded(): boolean {
  return importedLoaded;
}

export function geometryCount(): number {
  return Object.keys(curatedCache).length + Object.keys(importedCache).length;
}

function entryFor(id: string): TrailGeometryEntry | undefined {
  return curatedCache[id] ?? importedCache[id];
}

export function hasGeometry(trailId: string): boolean {
  return Boolean(entryFor(trailId)?.geom);
}

export function getGeometry(trailId: string): TrailGeometry | null {
  return entryFor(trailId)?.geom ?? null;
}

/** Returns [[west, south], [east, north]] or null if no geometry. */
export function getBounds(trailId: string): [[number, number], [number, number]] | null {
  const entry = entryFor(trailId);
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
    const entry = entryFor(t.id);
    if (!entry?.geom) continue;
    features.push({
      type: "Feature",
      geometry: entry.geom as GeoJSON.LineString | GeoJSON.MultiLineString,
      properties: {
        id: t.id,
        name: t.name,
        difficulty: t.difficulty,
        type: t.type,
        tier: t.tier ?? "featured",
        color: DIFFICULTY_COLOR[t.difficulty],
      },
    });
  }
  return { type: "FeatureCollection", features };
}
