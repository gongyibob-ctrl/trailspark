// Merge all scripts/out/enriched-*.json into a single trails-imported file
// plus combine geometries into lib/geometries.json. After merging, re-runs
// the simplifier so public/geometries.json reflects the new entries.
//
// Output:
//   lib/trails-imported.json   — array of Trail-shape entries
//   lib/geometries.json        — existing + imported (full geometry)
//   public/geometries.json     — simplified (regenerated)
//
// Slug-collision rule: any imported entry whose id already exists in the
// curated set is dropped (curated wins). We also dedupe within imports so
// the same named trail in two parks (boundary overlap) only shows once.
//
// Run: node scripts/merge-imported.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const IN_DIR  = resolve(ROOT, "scripts/out");
const TRAILS_OUT    = resolve(ROOT, "lib/trails-imported.json");
const GEOM_FULL     = resolve(ROOT, "lib/geometries.json");

// Pull curated ids by grep — avoids importing TS at script time.
function curatedIds() {
  const txt = readFileSync(resolve(ROOT, "lib/trails.ts"), "utf8");
  const ids = new Set();
  for (const m of txt.matchAll(/id:\s*"([^"]+)"/g)) ids.add(m[1]);
  return ids;
}

function main() {
  const curated = curatedIds();
  console.log(`curated trail ids: ${curated.size}`);

  // 1) collect enriched trails
  const trails = [];
  const seen = new Set();
  let dupedAcrossParks = 0, droppedCurated = 0;
  for (const f of readdirSync(IN_DIR).filter((x) => x.startsWith("enriched-") && x.endsWith(".json"))) {
    const doc = JSON.parse(readFileSync(resolve(IN_DIR, f), "utf8"));
    for (const t of doc.trails) {
      if (curated.has(t.id)) { droppedCurated += 1; continue; }
      // Same slug in two parks: keep the longer one (likely the main trail).
      if (seen.has(t.id)) {
        const existing = trails.find((x) => x.id === t.id);
        if (existing && t.lengthMiles > existing.lengthMiles) {
          Object.assign(existing, t);
        }
        dupedAcrossParks += 1;
        continue;
      }
      seen.add(t.id);
      trails.push(t);
    }
  }
  console.log(`imported trails: ${trails.length}  (dropped vs curated: ${droppedCurated}, deduped across parks: ${dupedAcrossParks})`);

  // 2) collect geometries
  const existingGeoms = existsSync(GEOM_FULL) ? JSON.parse(readFileSync(GEOM_FULL, "utf8")) : {};
  const startCount = Object.keys(existingGeoms).length;
  let added = 0;
  for (const f of readdirSync(IN_DIR).filter((x) => x.startsWith("geometries-") && x.endsWith(".json"))) {
    const geoms = JSON.parse(readFileSync(resolve(IN_DIR, f), "utf8"));
    for (const [id, entry] of Object.entries(geoms)) {
      if (curated.has(id)) continue;  // never overwrite curated geometry
      if (existingGeoms[id]) continue; // first-seen wins (matches trail dedupe)
      existingGeoms[id] = entry;
      added += 1;
    }
  }
  console.log(`geometries: ${startCount} existing + ${added} imported = ${Object.keys(existingGeoms).length}`);

  // 3) write outputs
  writeFileSync(TRAILS_OUT, JSON.stringify({ count: trails.length, trails }, null, 2));
  writeFileSync(GEOM_FULL, JSON.stringify(existingGeoms, null, 2));
  console.log(`  → ${TRAILS_OUT}`);
  console.log(`  → ${GEOM_FULL}`);

  // 4) regenerate the simplified, public-facing geometry file
  console.log("\nRegenerating public/geometries.json (simplification)…");
  execSync(`node ${resolve(__dirname, "simplify-geometries.mjs")}`, { stdio: "inherit" });
}

main();
