// Simplify lib/geometries.json (raw OSM, 6+ MB) into public/geometries.json
// (smaller, fetched lazily by the client). Per-line decimation with a
// hard point cap that preserves first/last and evenly samples in between.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "lib/geometries.json");
const DST = resolve(ROOT, "public/geometries.json");

const MAX_POINTS_PER_LINE = 250;
const MAX_TOTAL_POINTS_PER_TRAIL = 1500;

function decimateTo(coords, maxPoints) {
  if (coords.length <= maxPoints) return coords;
  const step = (coords.length - 1) / (maxPoints - 1);
  const out = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(coords[Math.round(i * step)]);
  }
  return out;
}

// Round coords to 5 decimal places (~1m resolution, plenty for a map view).
function roundLine(coords) {
  return coords.map(([lng, lat]) => [Math.round(lng * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5]);
}

function simplifyGeom(geom) {
  if (geom.type === "LineString") {
    let c = decimateTo(geom.coordinates, MAX_POINTS_PER_LINE);
    return { type: "LineString", coordinates: roundLine(c) };
  }
  if (geom.type === "MultiLineString") {
    let lines = geom.coordinates.map((l) => decimateTo(l, MAX_POINTS_PER_LINE));
    // Apply trail-wide cap: if total still over budget, shrink each line proportionally
    const total = lines.reduce((s, l) => s + l.length, 0);
    if (total > MAX_TOTAL_POINTS_PER_TRAIL) {
      const scale = MAX_TOTAL_POINTS_PER_TRAIL / total;
      lines = lines.map((l) => decimateTo(l, Math.max(2, Math.floor(l.length * scale))));
    }
    return {
      type: "MultiLineString",
      coordinates: lines.map(roundLine),
    };
  }
  return geom;
}

function totalCoords(geom) {
  if (!geom) return 0;
  if (geom.type === "LineString") return geom.coordinates.length;
  return geom.coordinates.reduce((s, l) => s + l.length, 0);
}

const raw = JSON.parse(readFileSync(SRC, "utf8"));

let originalPts = 0;
let simplifiedPts = 0;

const out = {};
for (const [id, entry] of Object.entries(raw)) {
  if (!entry.geom) continue;
  originalPts += totalCoords(entry.geom);
  out[id] = { source: entry.source, geom: simplifyGeom(entry.geom) };
  simplifiedPts += totalCoords(out[id].geom);
}

mkdirSync(dirname(DST), { recursive: true });
writeFileSync(DST, JSON.stringify(out));

console.log(`Simplified ${Object.keys(out).length} trails`);
console.log(`Points: ${originalPts.toLocaleString()} → ${simplifiedPts.toLocaleString()} (${((simplifiedPts / originalPts) * 100).toFixed(1)}%)`);

// Sizes
const srcSize = readFileSync(SRC).length;
const dstSize = readFileSync(DST).length;
console.log(`Bytes:  ${(srcSize / 1024 / 1024).toFixed(2)} MB → ${(dstSize / 1024).toFixed(0)} KB`);
