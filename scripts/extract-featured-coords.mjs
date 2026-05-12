// Extracts the geometry of each FEATURED_IDS trail from the (simplified)
// public/geometries.json into a tiny JSON committed at
// lib/featured-coords.json. Avoids importing the 7 MB simplified bundle
// (or the 53 MB raw one) into the landing-page server component.
//
// Run whenever FEATURED_IDS changes:  node scripts/extract-featured-coords.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Mirror of lib/featured.ts FEATURED_IDS. Kept in sync by hand; the loader
// pattern keeps this script dependency-free (no TS imports).
const FEATURED_IDS = [
  "hurricane-hill",      // easy
  "mist-trail",          // moderate
  "multnomah-wahkeena",  // moderate
  "cascade-pass",        // hard
  "south-sister",        // hard
  "half-dome",           // extreme
];

const geomFile = resolve(ROOT, "public/geometries.json");
const outFile  = resolve(ROOT, "lib/featured-coords.json");

const all = JSON.parse(readFileSync(geomFile, "utf8"));

const out = {};
let totalPts = 0;
for (const id of FEATURED_IDS) {
  const entry = all[id];
  if (!entry?.geom) {
    console.warn(`  skip ${id} — no geometry`);
    continue;
  }
  // Flatten MultiLineString → longest segment, since cards render a single trace
  let coords;
  if (entry.geom.type === "LineString") {
    coords = entry.geom.coordinates;
  } else {
    coords = entry.geom.coordinates.slice().sort((a, b) => b.length - a.length)[0];
  }
  out[id] = coords;
  totalPts += coords.length;
  console.log(`  ${id}: ${coords.length} points`);
}

writeFileSync(outFile, JSON.stringify(out));
const sizeKB = (Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(1);
console.log(`\nWrote ${Object.keys(out).length} trails (${totalPts} pts, ${sizeKB} KB) → ${outFile}`);
