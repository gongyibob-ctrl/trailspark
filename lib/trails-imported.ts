// Auto-imported trails from OpenStreetMap, enriched by scripts in scripts/.
// Source pipeline:
//   1. scripts/fetch-osm-trails.mjs    — pull named hiking routes + ways per park
//   2. scripts/enrich-osm-trails.mjs   — derive difficulty/type/popularity, fill park config
//   3. scripts/elevation-pass.mjs      — sample USGS NED 10m DEM for cumulative gain
//   4. scripts/merge-imported.mjs      — collapse to lib/trails-imported.json + merge geometries
//
// To include these in the live site, concat IMPORTED_TRAILS into TRAILS
// inside lib/trails.ts. Until then, they live here unused — safe to inspect
// in JSON or compute stats off of.
//
// All entries have:
//   - tier: "imported"          → UI can treat them as skeleton pages
//   - scenery: null             → renders as grayed stars + "Be the first to rate"
//   - description: templated    → factual, no AI-generated prose
//   - source.osmId / wikipedia  → provenance for future verification

import type { Trail } from "./types";
import data from "./trails-imported.json";

// The JSON is produced by enrich-osm-trails.mjs which matches the Trail shape
// (with scenery: null and tier: "imported"). We trust the schema and cast.
export const IMPORTED_TRAILS: Trail[] = data.trails as unknown as Trail[];

export const IMPORTED_TRAIL_BY_ID: Record<string, Trail> = Object.fromEntries(
  IMPORTED_TRAILS.map((t) => [t.id, t]),
);
