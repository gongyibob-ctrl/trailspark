// Elevation profiles. We sample N points along a trail's geometry, fetch their
// elevation in one batch from Open-Meteo's free /v1/elevation API, then expose
// (cumulative-distance, elevation) pairs for charting. No API key required.

import { getGeometry } from "./geometries";
import type { TrailGeometry } from "./types";

export interface ElevationSample {
  /** Cumulative distance from start in miles. */
  miles: number;
  /** Elevation in feet. */
  feet: number;
}

export interface ElevationProfile {
  samples: ElevationSample[];
  totalMiles: number;
  minFt: number;
  maxFt: number;
  startFt: number;
  endFt: number;
  /** Sum of positive deltas (true cumulative climb). */
  totalGainFt: number;
  /** Index of the highest sample, for "high point" annotation. */
  highIdx: number;
}

const SAMPLE_COUNT = 64; // tight cap so /v1/elevation stays fast and well under quota
const M_TO_FT = 3.28084;
const KM_TO_MI = 0.621371;

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Flatten a (Multi)LineString to a single ordered array of [lng, lat]. */
function flattenGeom(g: TrailGeometry): [number, number][] {
  if (g.type === "LineString") return g.coordinates as [number, number][];
  // For a multi-line we just concat — fine for a profile chart, even if the
  // join between segments is geographically jumpy.
  return (g.coordinates as number[][][]).flat() as [number, number][];
}

/** Resample an arbitrary-length polyline down to `n` evenly-spaced points. */
function resample(points: [number, number][], n: number): [number, number][] {
  if (points.length <= n) return points;
  const step = (points.length - 1) / (n - 1);
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) out.push(points[Math.round(i * step)]);
  return out;
}

async function fetchElevations(points: [number, number][]): Promise<number[]> {
  const lats = points.map((p) => p[1]).join(",");
  const lngs = points.map((p) => p[0]).join(",");
  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo elevation ${res.status}`);
  const data = (await res.json()) as { elevation?: number[] };
  if (!Array.isArray(data.elevation)) throw new Error("elevation: no array in response");
  return data.elevation;
}

const cache = new Map<string, ElevationProfile>();

export async function getElevationProfile(trailId: string): Promise<ElevationProfile | null> {
  if (cache.has(trailId)) return cache.get(trailId)!;
  const geom = getGeometry(trailId);
  if (!geom) return null;

  const flat = flattenGeom(geom);
  if (flat.length < 2) return null;

  const sampled = resample(flat, SAMPLE_COUNT);
  const elevsM = await fetchElevations(sampled);
  if (elevsM.length !== sampled.length) throw new Error("elevation length mismatch");

  // Compute cumulative distance (miles) and elevation (ft) in one pass
  const samples: ElevationSample[] = [];
  let cumKm = 0;
  for (let i = 0; i < sampled.length; i++) {
    if (i > 0) cumKm += haversineKm(sampled[i - 1], sampled[i]);
    samples.push({
      miles: Math.round(cumKm * KM_TO_MI * 100) / 100,
      feet: Math.round(elevsM[i] * M_TO_FT),
    });
  }

  let minFt = Infinity;
  let maxFt = -Infinity;
  let highIdx = 0;
  let totalGainFt = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (s.feet < minFt) minFt = s.feet;
    if (s.feet > maxFt) {
      maxFt = s.feet;
      highIdx = i;
    }
    if (i > 0) {
      const delta = s.feet - samples[i - 1].feet;
      if (delta > 0) totalGainFt += delta;
    }
  }

  const profile: ElevationProfile = {
    samples,
    totalMiles: samples[samples.length - 1].miles,
    minFt,
    maxFt,
    startFt: samples[0].feet,
    endFt: samples[samples.length - 1].feet,
    totalGainFt: Math.round(totalGainFt),
    highIdx,
  };
  cache.set(trailId, profile);
  return profile;
}
