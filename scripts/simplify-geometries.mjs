// Simplify lib/geometries.json (raw, ~53 MB) into two public-facing files:
//   public/geometries.json          — curated trails only (~75, ~832 KB),
//                                     loaded eagerly on map mount.
//   public/geometries-imported.json — OSM-imported trails (~1,700, ~6-7 MB),
//                                     prefetched in background after first
//                                     paint so it doesn't block the UI.
// Split criterion: trail id prefix. `osm-*` ids → imported file; everything
// else → curated file. Per-line decimation with hard point cap preserves
// first/last and evenly samples in between.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "lib/geometries.json");
const DST_CURATED  = resolve(ROOT, "public/geometries.json");
const DST_IMPORTED = resolve(ROOT, "public/geometries-imported.json");

// Per-tier point caps. Imported trails get tighter limits so the
// public/geometries-imported.json bundle stays small (mobile bandwidth);
// curated keeps the higher fidelity since it's the editorial product.
const CAPS_CURATED  = { line: 250, total: 1500 };
const CAPS_IMPORTED = { line: 120, total: 600 };

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

function simplifyGeom(geom, caps) {
  if (geom.type === "LineString") {
    let c = decimateTo(geom.coordinates, caps.line);
    return { type: "LineString", coordinates: roundLine(c) };
  }
  if (geom.type === "MultiLineString") {
    let lines = geom.coordinates.map((l) => decimateTo(l, caps.line));
    const total = lines.reduce((s, l) => s + l.length, 0);
    if (total > caps.total) {
      const scale = caps.total / total;
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

const curated  = {};
const imported = {};
for (const [id, entry] of Object.entries(raw)) {
  if (!entry.geom) continue;
  originalPts += totalCoords(entry.geom);
  // Split by id prefix. Imported trails always carry `osm-` prefix
  // (assigned by scripts/enrich-osm-trails.mjs); curated entries don't.
  const isImported = id.startsWith("osm-");
  const caps = isImported ? CAPS_IMPORTED : CAPS_CURATED;
  const simplified = { source: entry.source, geom: simplifyGeom(entry.geom, caps) };
  simplifiedPts += totalCoords(simplified.geom);
  if (isImported) imported[id] = simplified;
  else            curated[id]  = simplified;
}

mkdirSync(dirname(DST_CURATED), { recursive: true });
writeFileSync(DST_CURATED,  JSON.stringify(curated));
writeFileSync(DST_IMPORTED, JSON.stringify(imported));

const curatedCount  = Object.keys(curated).length;
const importedCount = Object.keys(imported).length;
console.log(`Simplified ${curatedCount + importedCount} trails  (curated=${curatedCount}, imported=${importedCount})`);
console.log(`Points: ${originalPts.toLocaleString()} → ${simplifiedPts.toLocaleString()} (${((simplifiedPts / originalPts) * 100).toFixed(1)}%)`);

const fmtKB = (n) => `${(n / 1024).toFixed(0)} KB`;
const fmtMB = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
console.log(`Curated:  ${fmtKB(readFileSync(DST_CURATED).length)}  (eager-loaded)`);
console.log(`Imported: ${fmtMB(readFileSync(DST_IMPORTED).length)}  (background prefetch)`);
