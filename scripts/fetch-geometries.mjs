// One-time build script: fetch trail-line geometries from OpenStreetMap Overpass API.
//
// Strategy per trail:
//   1) Try `relation[route=hiking][name~"<NAME>",i]` within a search radius — best for
//      thru-hikes and famous named trails (PCT, JMT, Wonderland, etc.).
//   2) If no relation found, fall back to `way[name~"<NAME>",i]` — catches day-hike
//      trails where the path is a single named way (Mist Trail, Eagle Creek, etc.).
//   3) If still nothing, leave the trail as point-only.
//
// Outputs lib/geometries.json — keyed by trail id, value is GeoJSON LineString /
// MultiLineString. The Trail type gets an optional "hasGeometry" hint via the
// presence of an entry in this JSON.
//
// Run: node scripts/fetch-geometries.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_PATH = resolve(ROOT, "lib/geometries.json");

// Per-trail search hints. radiusKm tuned to trail length (longer trails span huge areas).
const SEARCH_HINTS = {
  // Yosemite + Sierra
  "half-dome":         { name: "Half Dome",                            radiusKm: 8 },
  "clouds-rest":       { name: "Cloud[’']?s Rest",                 radiusKm: 8 },
  "mist-trail":        { name: "Mist Trail",                            radiusKm: 6 },
  "upper-yosemite-falls": { name: "Yosemite Falls Trail|Upper Yosemite Falls", radiusKm: 5 },
  "cathedral-lakes":   { name: "Cathedral Lakes",                       radiusKm: 8 },
  "sentinel-taft":     { name: "Sentinel Dome|Taft Point",              radiusKm: 6 },
  "mt-whitney":        { name: "Mount Whitney Trail|Mt Whitney Trail",  radiusKm: 15 },
  "jmt":               { name: "John Muir Trail",                       radiusKm: 250 },
  "rae-lakes":         { name: "Rae Lakes",                             radiusKm: 30 },
  "tahoe-rim":         { name: "Tahoe Rim Trail",                       radiusKm: 60 },

  // Mt Rainier
  "wonderland":        { name: "Wonderland Trail",                      radiusKm: 25 },
  "skyline-paradise":  { name: "Skyline Trail",                         radiusKm: 5 },
  "naches-peak":       { name: "Naches Peak",                           radiusKm: 5 },
  "burroughs":         { name: "Burroughs Mountain",                    radiusKm: 6 },
  "tolmie-peak":       { name: "Tolmie Peak",                           radiusKm: 6 },

  // Olympic
  "hall-of-mosses":    { name: "Hall of Mosses",                        radiusKm: 3 },
  "hurricane-hill":    { name: "Hurricane Hill",                        radiusKm: 5 },
  "storm-king":        { name: "Storm King",                            radiusKm: 5 },
  "shi-shi":           { name: "Shi Shi",                               radiusKm: 8 },
  "high-divide":       { name: "High Divide|Seven Lakes Basin",         radiusKm: 15 },
  "sol-duc-falls":     { name: "Sol Duc",                               radiusKm: 5 },

  // North Cascades
  "maple-pass":        { name: "Maple Pass|Heather[- ]Maple Pass",      radiusKm: 8 },
  "cascade-pass":      { name: "Cascade Pass|Sahale",                   radiusKm: 10 },
  "blue-lake":         { name: "Blue Lake Trail",                       radiusKm: 5 },
  "hidden-lake":       { name: "Hidden Lake",                           radiusKm: 8 },
  "heliotrope":        { name: "Heliotrope Ridge",                      radiusKm: 5 },

  // Oregon
  "timberline":        { name: "Timberline Trail",                      radiusKm: 25 },
  "garfield-peak":     { name: "Garfield Peak",                         radiusKm: 5 },
  "south-sister":      { name: "South Sister",                          radiusKm: 12 },
  "eagle-creek":       { name: "Eagle Creek Trail",                     radiusKm: 12 },
  "multnomah-wahkeena": { name: "Wahkeena|Multnomah",                   radiusKm: 5 },
  "smith-rock":        { name: "Misery Ridge",                          radiusKm: 5 },

  // Northern CA
  "lassen-peak":       { name: "Lassen Peak",                           radiusKm: 5 },
  "bumpass-hell":      { name: "Bumpass",                               radiusKm: 5 },
  "fern-canyon":       { name: "Fern Canyon",                           radiusKm: 4 },
  "lost-coast":        { name: "Lost Coast Trail",                      radiusKm: 30 },

  // Southern CA + Desert
  "ryan-mountain":     { name: "Ryan Mountain",                         radiusKm: 4 },
  "telescope-peak":    { name: "Telescope Peak",                        radiusKm: 8 },
  "san-jacinto":       { name: "San Jacinto Peak|Mount San Jacinto",    radiusKm: 12 },
  "mt-baldy":          { name: "Devil[’']?s Backbone|Mount San Antonio|Mt Baldy", radiusKm: 8 },
  "smugglers":         { name: "Smugglers Cove|Smugglers",              radiusKm: 8 },

  // Big Sur + Bay
  "ewoldsen":          { name: "Ewoldsen|Canyon Trail",                 radiusKm: 4 },
  "tomales-point":     { name: "Tomales Point",                         radiusKm: 8 },
  "alamere":           { name: "Coast Trail|Alamere",                   radiusKm: 12 },
  "mt-tam":            { name: "Mount Tamalpais|Old Railroad Grade",    radiusKm: 8 },
  "andrew-molera":     { name: "Molera|Bluffs Trail",                   radiusKm: 5 },
  "mt-diablo":         { name: "Mount Diablo Summit|Mary Bowerman",     radiusKm: 8 },
  "high-peaks-pinnacles": { name: "High Peaks Trail",                   radiusKm: 5 },

  // Thru-hikes / misc
  "pct":               { name: "Pacific Crest Trail",                   radiusKm: 1500, byId: 1225378 },
  "mt-si":             { name: "Mount Si|Mt Si",                        radiusKm: 5 },
};

// Endpoints — try in order, retry next on failure
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

const SLEEP_MS = 1500; // be polite

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function postOverpass(query) {
  let lastErr;
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Trailspark-MVP/0.1 (https://github.com/trailspark)",
          Accept: "application/json",
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (res.status === 429 || res.status === 504) {
        lastErr = new Error(`${ep} → ${res.status}`);
        continue;
      }
      if (!res.ok) throw new Error(`${ep} → ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("All Overpass endpoints failed");
}

function buildRelationQuery(name, lat, lng, radiusKm) {
  const radius = Math.round(radiusKm * 1000);
  return `[out:json][timeout:60];
(
  relation["route"="hiking"]["name"~"${name}",i](around:${radius},${lat},${lng});
);
out geom;`;
}

function buildRelationByIdQuery(relationId) {
  return `[out:json][timeout:60];
(
  relation(${relationId});
);
out geom;`;
}

function buildWayQuery(name, lat, lng, radiusKm) {
  const radius = Math.round(radiusKm * 1000);
  return `[out:json][timeout:60];
(
  way["highway"~"path|footway|track"]["name"~"${name}",i](around:${radius},${lat},${lng});
);
out geom;`;
}

// Convert an Overpass relation `out geom` element to a MultiLineString.
function relationToGeometry(rel) {
  const lines = [];
  if (!rel.members) return null;
  for (const m of rel.members) {
    if (m.type === "way" && Array.isArray(m.geometry) && m.geometry.length >= 2) {
      lines.push(m.geometry.map((p) => [p.lon, p.lat]));
    }
  }
  if (lines.length === 0) return null;
  if (lines.length === 1) return { type: "LineString", coordinates: lines[0] };
  return { type: "MultiLineString", coordinates: lines };
}

function waysToGeometry(ways) {
  const lines = ways
    .filter((w) => Array.isArray(w.geometry) && w.geometry.length >= 2)
    .map((w) => w.geometry.map((p) => [p.lon, p.lat]));
  if (lines.length === 0) return null;
  if (lines.length === 1) return { type: "LineString", coordinates: lines[0] };
  return { type: "MultiLineString", coordinates: lines };
}

function totalCoords(geom) {
  if (!geom) return 0;
  if (geom.type === "LineString") return geom.coordinates.length;
  return geom.coordinates.reduce((s, l) => s + l.length, 0);
}

// Load existing trails by parsing lib/trails.ts (simple regex extraction is enough)
function loadTrails() {
  const txt = readFileSync(resolve(ROOT, "lib/trails.ts"), "utf8");
  const matches = [...txt.matchAll(
    /id:\s*"([^"]+)"[\s\S]*?trailhead:\s*\{\s*lat:\s*([-\d.]+),\s*lng:\s*([-\d.]+)\s*\}/g,
  )];
  return matches.map((m) => ({ id: m[1], lat: Number(m[2]), lng: Number(m[3]) }));
}

async function fetchOne(trail) {
  const hint = SEARCH_HINTS[trail.id];
  if (!hint) return { source: "no-hint", geom: null };

  // Try a known relation ID first
  if (hint.byId) {
    try {
      const res = await postOverpass(buildRelationByIdQuery(hint.byId));
      const rel = res.elements?.find((e) => e.type === "relation");
      if (rel) {
        const geom = relationToGeometry(rel);
        if (geom) return { source: `relation/${hint.byId}`, geom };
      }
    } catch (e) {
      console.log(`  byId failed: ${e.message}`);
    }
  }

  // Try relation by name
  try {
    const res = await postOverpass(buildRelationQuery(hint.name, trail.lat, trail.lng, hint.radiusKm));
    const rels = res.elements?.filter((e) => e.type === "relation") ?? [];
    if (rels.length > 0) {
      // Pick the relation with the most way members (likely the main trail)
      rels.sort((a, b) => (b.members?.length ?? 0) - (a.members?.length ?? 0));
      const geom = relationToGeometry(rels[0]);
      if (geom) return { source: `relation/${rels[0].id}`, geom };
    }
  } catch (e) {
    console.log(`  relation query failed: ${e.message}`);
  }

  // Fallback: ways by name
  try {
    const res = await postOverpass(buildWayQuery(hint.name, trail.lat, trail.lng, Math.min(hint.radiusKm, 30)));
    const ways = res.elements?.filter((e) => e.type === "way") ?? [];
    if (ways.length > 0) {
      const geom = waysToGeometry(ways);
      if (geom) return { source: `ways(${ways.length})`, geom };
    }
  } catch (e) {
    console.log(`  way query failed: ${e.message}`);
  }

  return { source: "not-found", geom: null };
}

async function main() {
  const trails = loadTrails();
  console.log(`Found ${trails.length} trails in lib/trails.ts`);

  // Resume from cache if it exists
  let cache = {};
  if (existsSync(OUT_PATH)) {
    cache = JSON.parse(readFileSync(OUT_PATH, "utf8"));
    console.log(`Resuming with ${Object.keys(cache).length} cached entries`);
  }

  let hits = 0;
  let misses = 0;

  for (const t of trails) {
    if (cache[t.id]) {
      console.log(`✓ ${t.id} (cached)`);
      hits += 1;
      continue;
    }
    process.stdout.write(`… ${t.id} `);
    const start = Date.now();
    try {
      const { source, geom } = await fetchOne(t);
      if (geom) {
        cache[t.id] = { source, geom, fetchedAt: new Date().toISOString() };
        const ms = Date.now() - start;
        console.log(`OK [${source}, ${totalCoords(geom)} pts, ${ms}ms]`);
        hits += 1;
      } else {
        console.log(`MISS [${source}]`);
        misses += 1;
      }
    } catch (e) {
      console.log(`ERROR ${e.message}`);
      misses += 1;
    }
    // Persist on every iteration so we never lose progress
    writeFileSync(OUT_PATH, JSON.stringify(cache, null, 2));
    await sleep(SLEEP_MS);
  }

  console.log(`\nDone. ${hits} with geometries, ${misses} without. → ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
