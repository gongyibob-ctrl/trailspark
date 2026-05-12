// Pass 1 enrichment: turn raw osm-<park>.json into Trail-shaped entries.
//
// What this fills:
//   - id            slugified, prefixed `osm-` to avoid collisions
//   - region/state/parkUnit/ecosystem      from per-park config
//   - difficulty                            length-based heuristic
//   - type                                  length-based (day/multi-day/thru-hike)
//   - popularity                            Wikipedia + length rules
//   - description                           data-driven template (no hallucination)
//   - bestSeasons                           per-park default
//   - permitRequired                        per-park default (overridable later)
//   - scenery                               null  (Path C: render grayed stars)
//   - highlights                            []    (populated later by editorial)
//   - trailhead                             first geometry point
//   - endpoint                              last geometry point (only when far from start)
//   - tier                                  "imported"  (signals UI treatment)
//
// What this does NOT do (later passes):
//   - elevationGainFt    → scripts/elevation-pass.mjs (DEM sampling)
//   - nearby features    → scripts/features-pass.mjs (Overpass peaks/lakes/falls)
//   - Wikipedia summary  → scripts/wiki-pass.mjs (description seed for ~5% of trails)
//
// Run: node scripts/enrich-osm-trails.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const IN_DIR = resolve(ROOT, "scripts/out");
const OUT_DIR = resolve(ROOT, "scripts/out");

// Per-park context — fills the fields that can't be inferred from OSM alone.
// Add an entry here for each parkSlug emitted by fetch-osm-trails.mjs.
const PARK_CONFIG = {
  yosemite: {
    region: "yosemite-sierra", state: "CA",
    parkUnit: "Yosemite National Park",
    defaultEcosystem: "subalpine", bestSeasons: ["summer", "fall"], permitRequired: false,
  },
  sequoia: {
    region: "yosemite-sierra", state: "CA",
    parkUnit: "Sequoia National Park",
    defaultEcosystem: "alpine", bestSeasons: ["summer", "fall"], permitRequired: false,
  },
  "kings-canyon": {
    region: "yosemite-sierra", state: "CA",
    parkUnit: "Kings Canyon National Park",
    defaultEcosystem: "alpine", bestSeasons: ["summer", "fall"], permitRequired: false,
  },
  rainier: {
    region: "rainier", state: "WA",
    parkUnit: "Mt Rainier National Park",
    defaultEcosystem: "subalpine", bestSeasons: ["summer"], permitRequired: false,
  },
  olympic: {
    region: "olympic", state: "WA",
    parkUnit: "Olympic National Park",
    defaultEcosystem: "rainforest", bestSeasons: ["spring", "summer", "fall"], permitRequired: false,
  },
  "north-cascades": {
    region: "north-cascades", state: "WA",
    parkUnit: "North Cascades National Park",
    defaultEcosystem: "alpine", bestSeasons: ["summer", "fall"], permitRequired: false,
  },
  "crater-lake": {
    region: "oregon", state: "OR",
    parkUnit: "Crater Lake National Park",
    defaultEcosystem: "volcanic", bestSeasons: ["summer", "fall"], permitRequired: false,
  },
  lassen: {
    region: "norcal", state: "CA",
    parkUnit: "Lassen Volcanic National Park",
    defaultEcosystem: "volcanic", bestSeasons: ["summer", "fall"], permitRequired: false,
  },
  "joshua-tree": {
    region: "socal-desert", state: "CA",
    parkUnit: "Joshua Tree National Park",
    defaultEcosystem: "desert", bestSeasons: ["winter", "spring", "fall"], permitRequired: false,
  },
  "death-valley": {
    region: "socal-desert", state: "CA",
    parkUnit: "Death Valley National Park",
    defaultEcosystem: "desert", bestSeasons: ["winter", "spring", "fall"], permitRequired: false,
  },
  pinnacles: {
    region: "bigsur-bay", state: "CA",
    parkUnit: "Pinnacles National Park",
    defaultEcosystem: "chaparral", bestSeasons: ["winter", "spring", "fall"], permitRequired: false,
  },
  "channel-islands": {
    region: "socal-desert", state: "CA",
    parkUnit: "Channel Islands National Park",
    defaultEcosystem: "coastal", bestSeasons: ["spring", "fall", "winter"], permitRequired: false,
  },
  redwood: {
    region: "norcal", state: "CA",
    parkUnit: "Redwood National and State Parks",
    defaultEcosystem: "redwood", bestSeasons: ["spring", "summer", "fall", "winter"], permitRequired: false,
  },
  "point-reyes": {
    region: "bigsur-bay", state: "CA",
    parkUnit: "Point Reyes National Seashore",
    defaultEcosystem: "coastal", bestSeasons: ["spring", "summer", "fall", "winter"], permitRequired: false,
  },
  "mt-hood-nf": {
    region: "oregon", state: "OR",
    parkUnit: "Mount Hood National Forest",
    defaultEcosystem: "subalpine", bestSeasons: ["summer", "fall"], permitRequired: false,
  },
};

// Distance threshold (meters) for considering trailhead != endpoint.
// Below this, treat as out-and-back / loop and omit endpoint.
const ENDPOINT_MIN_METERS = 800;

function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function difficultyFor(lengthMiles) {
  if (lengthMiles < 4) return "easy";
  if (lengthMiles < 9) return "moderate";
  if (lengthMiles < 18) return "hard";
  return "extreme";
}

function typeFor(lengthMiles) {
  if (lengthMiles > 30) return "thru-hike";
  if (lengthMiles > 15) return "multi-day";
  return "day";
}

function popularityFor(trail) {
  const hasWiki = Boolean(trail.wikipedia || trail.wikidata);
  // Wikipedia entry = recognized destination → iconic. The strongest free
  // signal we have for "famous", since Wikipedia trail articles are sparse.
  if (hasWiki) return "iconic";
  // 25+ mi without Wikipedia → almost certainly a wilderness/backcountry route.
  if (trail.lengthMiles >= 25) return "backcountry";
  // Default tier — established trail, neither star nor remote.
  return "steady";
}

function templateDescription(trail, parkCfg, derived) {
  // Strictly factual sentence — no editorial padding. SEO-safe because it
  // presents data rather than synthesized prose.
  const len = trail.lengthMiles.toFixed(1);
  const diffLabel = {
    easy: "easy",
    moderate: "moderate",
    hard: "strenuous",
    extreme: "extreme",
  }[derived.difficulty];
  const typeLabel = {
    "day": "day hike",
    "multi-day": "multi-day backpacking route",
    "thru-hike": "long-distance thru-hike",
  }[derived.type];
  const wikiNote = (trail.wikipedia || trail.wikidata)
    ? " Featured on Wikipedia."
    : "";
  return `A ${len}-mile ${diffLabel} ${typeLabel} in ${parkCfg.parkUnit}.${wikiNote} Geometry sourced from OpenStreetMap; description awaiting community contributions.`;
}

function deriveTrail(osmTrail, parkCfg) {
  const lengthMiles = osmTrail.lengthMiles;
  const difficulty = difficultyFor(lengthMiles);
  const type = typeFor(lengthMiles);
  const popularity = popularityFor(osmTrail);
  const trailhead = osmTrail.trailhead;
  const endpointLast = osmTrail.endpointLast;
  const endpointDist = trailhead && endpointLast ? haversine(trailhead, endpointLast) : 0;
  const endpoint = endpointDist >= ENDPOINT_MIN_METERS ? endpointLast : undefined;

  const trail = {
    id: `osm-${osmTrail.slug}`,
    name: osmTrail.name,
    region: parkCfg.region,
    state: parkCfg.state,
    parkUnit: parkCfg.parkUnit,
    difficulty,
    type,
    ecosystem: parkCfg.defaultEcosystem,
    lengthMiles,
    elevationGainFt: 0,            // filled by elevation-pass.mjs
    trailhead,
    ...(endpoint ? { endpoint } : {}),
    permitRequired: parkCfg.permitRequired,
    bestSeasons: parkCfg.bestSeasons,
    popularity,
    scenery: null,                 // user-rated; rendered as grayed stars
    description: "",
    highlights: [],
    tier: "imported",              // signals "skeleton page" treatment in UI
    source: {
      type: osmTrail.osmType,
      osmId: osmTrail.osmId,
      ...(osmTrail.wikipedia ? { wikipedia: osmTrail.wikipedia } : {}),
      ...(osmTrail.wikidata  ? { wikidata:  osmTrail.wikidata  } : {}),
    },
  };
  trail.description = templateDescription(osmTrail, parkCfg, { difficulty, type });
  return { trail, geometry: osmTrail.geometry };
}

function enrichFile(inputPath, parkSlug) {
  const parkCfg = PARK_CONFIG[parkSlug];
  if (!parkCfg) {
    throw new Error(`No PARK_CONFIG entry for "${parkSlug}". Add one before running.`);
  }
  const raw = JSON.parse(readFileSync(inputPath, "utf8"));
  const trails = [];
  const geometries = {};
  const collisions = [];

  for (const osmTrail of raw.trails) {
    const { trail, geometry } = deriveTrail(osmTrail, parkCfg);
    trails.push(trail);
    geometries[trail.id] = {
      source: `osm-${osmTrail.osmType}/${osmTrail.osmId}`,
      geom: geometry,
      fetchedAt: raw.fetchedAt,
    };
  }

  // Sanity: id collisions inside this park (slugify can sometimes collapse names)
  const seen = new Set();
  for (const t of trails) {
    if (seen.has(t.id)) collisions.push(t.id);
    seen.add(t.id);
  }
  if (collisions.length) {
    console.warn(`  ⚠ id collisions within ${parkSlug}:`, collisions);
  }

  // Distribution summary for sanity-checking the heuristics.
  const dist = { difficulty: {}, type: {}, popularity: {} };
  for (const t of trails) {
    dist.difficulty[t.difficulty] = (dist.difficulty[t.difficulty] ?? 0) + 1;
    dist.type[t.type]             = (dist.type[t.type]             ?? 0) + 1;
    dist.popularity[t.popularity] = (dist.popularity[t.popularity] ?? 0) + 1;
  }

  return { parkSlug, trails, geometries, dist };
}

function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const inputs = readdirSync(IN_DIR)
    .filter((f) => f.startsWith("osm-") && f.endsWith(".json"))
    .map((f) => ({
      file: f,
      parkSlug: f.replace(/^osm-/, "").replace(/\.json$/, ""),
    }));

  for (const { file, parkSlug } of inputs) {
    console.log(`\n=== enriching ${file} ===`);
    const { trails, geometries, dist } = enrichFile(resolve(IN_DIR, file), parkSlug);
    console.log(`  ${trails.length} trails enriched`);
    console.log(`  difficulty:`, dist.difficulty);
    console.log(`  type:      `, dist.type);
    console.log(`  popularity:`, dist.popularity);

    const trailsOut  = resolve(OUT_DIR, `enriched-${parkSlug}.json`);
    const geomOut    = resolve(OUT_DIR, `geometries-${parkSlug}.json`);
    writeFileSync(trailsOut, JSON.stringify({ parkSlug, trailCount: trails.length, trails }, null, 2));
    writeFileSync(geomOut,   JSON.stringify(geometries, null, 2));
    console.log(`  → ${trailsOut}`);
    console.log(`  → ${geomOut}`);
  }
}

main();
