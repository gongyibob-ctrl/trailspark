// Pass 2 enrichment: cumulative elevation gain via USGS NED10m DEM.
//
// Strategy:
//   1) Read scripts/out/enriched-<slug>.json + geometries-<slug>.json
//   2) For each trail, sample the geometry at ~100 m spacing, capped at 200
//      points (longer trails get coarser sampling) to bound API calls.
//   3) Batch-query Open Topo Data (USGS NED 10m), 100 locations per call,
//      1 req/sec polite delay.
//   4) Gain = sum of positive elevation deltas along the sampled path.
//      Convert meters → feet, round to nearest 50.
//   5) Cache results in scripts/out/elevation-cache.json so re-runs skip done
//      trails. Write trail.elevationGainFt back into enriched-<slug>.json.
//
// API: https://api.opentopodata.org/v1/ned10m — free, 1 req/sec, 100 loc/req.
// Run: node scripts/elevation-pass.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const IO_DIR = resolve(ROOT, "scripts/out");
const CACHE_PATH = resolve(IO_DIR, "elevation-cache.json");

const API = "https://api.opentopodata.org/v1/ned10m";
const SAMPLE_SPACING_M = 100;
const MAX_SAMPLES = 200;
const BATCH = 100;            // API max
const SLEEP_MS = 1100;        // API limit is 1 req/sec — pad slightly

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Flatten LineString / MultiLineString to a single ordered coord array.
function flattenGeom(geom) {
  if (!geom) return [];
  if (geom.type === "LineString") return geom.coordinates;
  // MultiLineString — concatenate. Discontinuities between segments still
  // contribute to "gain" if endpoints are at different elevations, which
  // is the right behavior for a route that physically goes there.
  return geom.coordinates.flat();
}

// Sample a coord array at ~SAMPLE_SPACING_M, capped at MAX_SAMPLES.
// Sampling is by along-track distance, not by index.
function sampleGeom(coords) {
  if (coords.length < 2) return coords.map((c) => ({ lat: c[1], lon: c[0] }));

  // Total length determines spacing.
  let total = 0;
  for (let i = 1; i < coords.length; i++) total += haversineMeters(coords[i - 1], coords[i]);
  const spacing = Math.max(SAMPLE_SPACING_M, total / MAX_SAMPLES);

  const out = [{ lat: coords[0][1], lon: coords[0][0] }];
  let acc = 0, nextMark = spacing;
  for (let i = 1; i < coords.length; i++) {
    const seg = haversineMeters(coords[i - 1], coords[i]);
    while (acc + seg >= nextMark && out.length < MAX_SAMPLES - 1) {
      const t = (nextMark - acc) / seg;
      const lat = coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * t;
      const lon = coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * t;
      out.push({ lat, lon });
      nextMark += spacing;
    }
    acc += seg;
  }
  out.push({ lat: coords[coords.length - 1][1], lon: coords[coords.length - 1][0] });
  return out;
}

async function queryElevations(points) {
  // Batch of up to 100 {lat, lon} → array of elevations (meters).
  const locs = points.map((p) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`).join("|");
  const url = `${API}?locations=${encodeURIComponent(locs)}&interpolation=cubic`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Trailspark-Importer/0.1" },
  });
  if (res.status === 429) throw new Error("429");
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.status !== "OK") throw new Error(`api status: ${json.status}`);
  return json.results.map((r) => r.elevation);
}

// Two-stage filter to combat 10m DEM noise (±2-3 m per sample):
//   1) Moving-average smoothing across 5 samples (~500 m at our spacing)
//      cancels independent sample noise but preserves slope structure.
//   2) Per-step floor of 2 m — kills the residual sub-meter wiggles that
//      survive smoothing on long routes.
// Without this, the naive positive-delta sum inflates by 30-50% on long
// routes. Tuning matches the approach Gaia / AllTrails use.
const SMOOTH_WIN = 3;
const STEP_FLOOR_M = 1;

function smooth(arr, win) {
  if (arr.length < win) return arr.slice();
  const half = Math.floor(win / 2);
  const out = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    let sum = 0, n = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(arr.length - 1, i + half); j++) {
      sum += arr[j]; n += 1;
    }
    out[i] = sum / n;
  }
  return out;
}

function cumulativeGainMeters(elevations) {
  if (elevations.length < 2) return 0;
  const smoothed = smooth(elevations, SMOOTH_WIN);
  let gain = 0;
  for (let i = 1; i < smoothed.length; i++) {
    const d = smoothed[i] - smoothed[i - 1];
    if (d > STEP_FLOOR_M) gain += d;
  }
  return gain;
}

async function fetchElevations(geom) {
  const coords = flattenGeom(geom);
  if (coords.length < 2) return [];
  const samples = sampleGeom(coords);

  const elevations = [];
  for (let i = 0; i < samples.length; i += BATCH) {
    const batch = samples.slice(i, i + BATCH);
    let attempts = 0;
    while (true) {
      try {
        const els = await queryElevations(batch);
        elevations.push(...els);
        break;
      } catch (e) {
        attempts += 1;
        if (attempts >= 3) throw e;
        await sleep(3000 * attempts);
      }
    }
    await sleep(SLEEP_MS);
  }
  return elevations;
}

function gainFtFromElevations(elevations) {
  const gainM = cumulativeGainMeters(elevations);
  return Math.round((gainM * 3.28084) / 50) * 50; // feet, snapped to 50 ft
}

function loadCache() {
  if (!existsSync(CACHE_PATH)) return {};
  return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
}

function saveCache(c) { writeFileSync(CACHE_PATH, JSON.stringify(c, null, 2)); }

async function processFile(slug) {
  const trailsPath = resolve(IO_DIR, `enriched-${slug}.json`);
  const geomPath   = resolve(IO_DIR, `geometries-${slug}.json`);
  if (!existsSync(trailsPath) || !existsSync(geomPath)) {
    console.log(`  skip ${slug} (missing input)`);
    return;
  }
  const trailsDoc = JSON.parse(readFileSync(trailsPath, "utf8"));
  const geom      = JSON.parse(readFileSync(geomPath, "utf8"));
  const cache     = loadCache();

  console.log(`\n=== ${slug} (${trailsDoc.trails.length} trails) ===`);
  let computed = 0, recomputed = 0, fetched = 0;
  for (const t of trailsDoc.trails) {
    const cached = cache[t.id];
    // Cache hit with raw elevations → recompute gain locally (free).
    if (cached && Array.isArray(cached.elevations)) {
      const gainFt = gainFtFromElevations(cached.elevations);
      t.elevationGainFt = gainFt;
      cache[t.id].gainFt = gainFt; // refresh stored gain to match current algorithm
      recomputed += 1;
      continue;
    }
    // Legacy cache (just a number) → keep it but mark for re-fetch on next clean.
    if (typeof cached === "number") {
      t.elevationGainFt = cached;
      recomputed += 1;
      continue;
    }
    const g = geom[t.id]?.geom;
    if (!g) { console.log(`  ${t.id} — no geometry, skip`); continue; }
    const start = Date.now();
    try {
      const elevations = await fetchElevations(g);
      const gainFt = gainFtFromElevations(elevations);
      t.elevationGainFt = gainFt;
      cache[t.id] = { elevations, gainFt, fetchedAt: new Date().toISOString() };
      saveCache(cache);
      fetched += 1;
      computed += 1;
      console.log(`  ✓ ${t.id.padEnd(40)} ${gainFt.toString().padStart(5)} ft  (${(Date.now()-start)/1000}s)`);
    } catch (e) {
      console.log(`  ✗ ${t.id} — ${e.message}`);
    }
  }
  saveCache(cache);
  // Re-derive difficulty now that we have gain.
  for (const t of trailsDoc.trails) {
    t.difficulty = combinedDifficulty(t.lengthMiles, t.elevationGainFt);
  }
  writeFileSync(trailsPath, JSON.stringify(trailsDoc, null, 2));
  console.log(`  → ${trailsPath}  (fetched=${fetched}, recomputed=${recomputed})`);
}

// Bring elevation into difficulty now that we have it. Heuristic aligned
// with the curated set: a 5-mi hike with 2500 ft is "hard" not "moderate".
function combinedDifficulty(lengthMiles, gainFt) {
  const score = lengthMiles + gainFt / 500; // 500 ft ≈ 1 mi of effort
  if (score < 4) return "easy";
  if (score < 10) return "moderate";
  if (score < 20) return "hard";
  return "extreme";
}

async function main() {
  const slugs = readdirSync(IO_DIR)
    .filter((f) => f.startsWith("enriched-") && f.endsWith(".json"))
    .map((f) => f.replace(/^enriched-/, "").replace(/\.json$/, ""));

  for (const slug of slugs) {
    await processFile(slug);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
