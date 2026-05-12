// Bulk-import OSM hiking trails inside a park boundary.
//
// Strategy:
//   1) Pull every `route=hiking` relation inside the park boundary. These are
//      already-stitched named hikes (JMT, Mist Trail, Wonderland, etc.).
//   2) Pull every named `highway=path|footway|track` way inside the boundary.
//   3) Drop ways that are members of any relation we already kept (covered).
//   4) Group remaining orphan ways by name → merge to one MultiLineString.
//   5) Compute length from geometry. No elevation/difficulty/scenery yet —
//      those land in a follow-up enrichment script.
//
// Output: scripts/out/osm-<parkSlug>.json. Does NOT touch lib/trails.ts or
// lib/geometries.json. Inspect the file, then decide what to promote.
//
// Run: node scripts/fetch-osm-trails.mjs

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "scripts/out");

// Add more parks here. Boundary id = OSM relation id of the park boundary
// (look up via Overpass: relation["name"="X"]["boundary"="protected_area"]).
const PARKS = [
  { slug: "yosemite",        name: "Yosemite National Park",            boundaryId: 1643367 },
  { slug: "sequoia",         name: "Sequoia National Park",             boundaryId: 175060  },
  { slug: "kings-canyon",    name: "Kings Canyon National Park",        boundaryId: 175059  },
  { slug: "rainier",         name: "Mount Rainier National Park",       boundaryId: 1399219 },
  { slug: "olympic",         name: "Olympic National Park",             boundaryId: 163769  },
  { slug: "north-cascades",  name: "North Cascades National Park",      boundaryId: 2421537 },
  { slug: "crater-lake",     name: "Crater Lake National Park",         boundaryId: 1274747 },
  { slug: "lassen",          name: "Lassen Volcanic National Park",     boundaryId: 6207158 },
  { slug: "joshua-tree",     name: "Joshua Tree National Park",         boundaryId: 6145614 },
  { slug: "death-valley",    name: "Death Valley National Park",        boundaryId: 174732  },
  { slug: "pinnacles",       name: "Pinnacles National Park",           boundaryId: 6183160 },
  { slug: "channel-islands", name: "Channel Islands National Park",     boundaryId: 3636334 },
  { slug: "redwood",         name: "Redwood National and State Parks",  boundaryId: 9574046 },
  { slug: "point-reyes",     name: "Point Reyes National Seashore",     boundaryId: 1250137 },
  { slug: "mt-hood-nf",      name: "Mount Hood National Forest",        boundaryId: 1273908 },
];

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

const SLEEP_MS = 1500;

// Filters for OSM tagging quirks. OSM treats climbing approaches and fire
// roads as `highway=path|track`, but neither is what we want to surface as
// a "hike". Two layers:
//   - Substring matches (any of these = block).
//   - Suffix matches (name ends with this = block). Suffix avoids killing
//     legit names like "Old Big Oak Flat Road Trail" which ends differently.
const NAME_SUBSTRING_BLOCK = [
  "climber", "climbing", "approach to",
  "fire road", "truck trail", "forest route", "forest rt", "forest road",
  "development road", "service road", "logging road",
  " 4wd", "(4wd)",
  "snowmobile", "ohv", " atv ", "bike path", "mountain bike", "mtb",
  " highway", " hwy",
];
const NAME_SUFFIX_BLOCK = [
  " road", " drive",
  " approach", " descent",
  " route",       // climbing routes — "Snake Dike Route", "Vogelsang Peak Route"
  " scramble",
  " access",
];

const MIN_LENGTH_MILES_ORPHAN = 0.3; // orphan ways shorter than this are dropped

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function postOverpass(query) {
  let lastErr;
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Trailspark-Importer/0.1",
          Accept: "application/json",
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (res.status === 429 || res.status === 504) {
        lastErr = new Error(`${ep} → ${res.status}`);
        await sleep(3000);
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

function slugify(s) {
  return s.toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nameIsBlocked(name) {
  if (!name) return true;
  if (name.startsWith("#")) return true;
  const lower = name.toLowerCase();
  if (NAME_SUBSTRING_BLOCK.some((bad) => lower.includes(bad))) return true;
  if (NAME_SUFFIX_BLOCK.some((bad) => lower.endsWith(bad))) return true;
  return false;
}

// Haversine in meters between two [lon, lat] points.
function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lineLengthMeters(line) {
  let total = 0;
  for (let i = 1; i < line.length; i++) total += haversine(line[i - 1], line[i]);
  return total;
}

function geometryLengthMiles(geom) {
  if (!geom) return 0;
  const lines = geom.type === "LineString" ? [geom.coordinates] : geom.coordinates;
  const meters = lines.reduce((s, l) => s + lineLengthMeters(l), 0);
  return Math.round((meters / 1609.34) * 10) / 10;
}

function relationToGeometryAndWayIds(rel) {
  const lines = [];
  const memberWayIds = new Set();
  for (const m of rel.members ?? []) {
    if (m.type !== "way") continue;
    memberWayIds.add(m.ref);
    if (Array.isArray(m.geometry) && m.geometry.length >= 2) {
      lines.push(m.geometry.map((p) => [p.lon, p.lat]));
    }
  }
  if (lines.length === 0) return { geom: null, memberWayIds };
  if (lines.length === 1) return { geom: { type: "LineString", coordinates: lines[0] }, memberWayIds };
  return { geom: { type: "MultiLineString", coordinates: lines }, memberWayIds };
}

function waysToGeometry(ways) {
  const lines = ways
    .filter((w) => Array.isArray(w.geometry) && w.geometry.length >= 2)
    .map((w) => w.geometry.map((p) => [p.lon, p.lat]));
  if (lines.length === 0) return null;
  if (lines.length === 1) return { type: "LineString", coordinates: lines[0] };
  return { type: "MultiLineString", coordinates: lines };
}

function firstAndLast(geom) {
  if (!geom) return { first: null, last: null };
  const lines = geom.type === "LineString" ? [geom.coordinates] : geom.coordinates;
  const first = lines[0][0];
  const last = lines[lines.length - 1][lines[lines.length - 1].length - 1];
  return {
    first: { lat: first[1], lng: first[0] },
    last:  { lat: last[1],  lng: last[0]  },
  };
}

function pickWikiTags(tags) {
  const out = {};
  if (tags.wikipedia) out.wikipedia = tags.wikipedia;
  if (tags.wikidata)  out.wikidata  = tags.wikidata;
  if (tags["wikipedia:en"]) out.wikipediaEn = tags["wikipedia:en"];
  return out;
}

function pickHikeRelevantTags(tags) {
  const keep = ["operator", "ref", "network", "sac_scale", "trail_visibility", "surface", "informal"];
  const out = {};
  for (const k of keep) if (tags[k]) out[k] = tags[k];
  return out;
}

async function fetchPark(park) {
  console.log(`\n=== ${park.name} (boundary ${park.boundaryId}) ===`);

  // 1) All hiking relations inside the boundary, with full geometry.
  console.log("  fetching route=hiking relations...");
  const relQuery = `[out:json][timeout:180];
rel(${park.boundaryId});
map_to_area->.a;
(relation(area.a)["route"="hiking"];);
out geom;`;
  const relRes = await postOverpass(relQuery);
  const rels = relRes.elements?.filter((e) => e.type === "relation") ?? [];
  console.log(`    got ${rels.length} relations`);

  await sleep(SLEEP_MS);

  // 2) All named hiking ways inside the boundary, with geometry.
  console.log("  fetching named hiking ways...");
  const wayQuery = `[out:json][timeout:180];
rel(${park.boundaryId});
map_to_area->.a;
(
  way(area.a)["highway"~"^(path|footway|track)$"]["name"];
);
out geom;`;
  const wayRes = await postOverpass(wayQuery);
  const ways = wayRes.elements?.filter((e) => e.type === "way") ?? [];
  console.log(`    got ${ways.length} named ways`);

  // Build the kept-relation set with their member way ids, then materialize entries.
  const trails = [];
  const memberWayIds = new Set();
  const stats = { relations: 0, blockedRel: 0, ways: 0, orphanWays: 0, dropShort: 0, dropBlocked: 0, dropCoveredBy: 0 };

  for (const rel of rels) {
    const name = rel.tags?.name;
    if (nameIsBlocked(name)) { stats.blockedRel += 1; continue; }
    const { geom, memberWayIds: ids } = relationToGeometryAndWayIds(rel);
    if (!geom) continue;
    for (const id of ids) memberWayIds.add(id);
    const lengthMiles = geometryLengthMiles(geom);
    const ends = firstAndLast(geom);
    trails.push({
      osmType: "relation",
      osmId: rel.id,
      slug: slugify(name),
      name,
      lengthMiles,
      trailhead: ends.first,
      endpointLast: ends.last,
      geometry: geom,
      ...pickWikiTags(rel.tags ?? {}),
      tags: pickHikeRelevantTags(rel.tags ?? {}),
    });
    stats.relations += 1;
  }

  // Orphan ways: group by name, skip if any way of that name is in memberWayIds.
  const waysByName = new Map();
  for (const w of ways) {
    const name = w.tags?.name;
    if (nameIsBlocked(name)) { stats.dropBlocked += 1; continue; }
    if (memberWayIds.has(w.id)) { stats.dropCoveredBy += 1; continue; }
    if (!waysByName.has(name)) waysByName.set(name, []);
    waysByName.get(name).push(w);
  }

  for (const [name, group] of waysByName) {
    const geom = waysToGeometry(group);
    if (!geom) continue;
    const lengthMiles = geometryLengthMiles(geom);
    if (lengthMiles < MIN_LENGTH_MILES_ORPHAN) { stats.dropShort += 1; continue; }
    const ends = firstAndLast(geom);
    // Merge tags from the longest segment for wiki links.
    const lead = group.sort((a, b) => (b.geometry?.length ?? 0) - (a.geometry?.length ?? 0))[0];
    trails.push({
      osmType: "way",
      osmId: lead.id,
      osmWayCount: group.length,
      slug: slugify(name),
      name,
      lengthMiles,
      trailhead: ends.first,
      endpointLast: ends.last,
      geometry: geom,
      ...pickWikiTags(lead.tags ?? {}),
      tags: pickHikeRelevantTags(lead.tags ?? {}),
    });
    stats.orphanWays += 1;
  }

  // Deduplicate by slug — if multiple entries collide, keep the longest.
  const bySlug = new Map();
  for (const t of trails) {
    const prev = bySlug.get(t.slug);
    if (!prev || t.lengthMiles > prev.lengthMiles) bySlug.set(t.slug, t);
  }
  const final = [...bySlug.values()].sort((a, b) => b.lengthMiles - a.lengthMiles);

  console.log(`  kept ${final.length} trails  (rel=${stats.relations}, orphan-ways=${stats.orphanWays})`);
  console.log(`  dropped: blocked-rel=${stats.blockedRel}, covered-by-rel=${stats.dropCoveredBy}, blocked-name=${stats.dropBlocked}, too-short=${stats.dropShort}`);
  return { park, trails: final, stats };
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  for (const park of PARKS) {
    const outPath = resolve(OUT_DIR, `osm-${park.slug}.json`);
    if (existsSync(outPath)) {
      console.log(`\n=== ${park.name} (skipped — ${outPath} exists; delete to re-fetch) ===`);
      continue;
    }
    const { trails, stats } = await fetchPark(park);
    const out = {
      park: park.name,
      parkSlug: park.slug,
      boundaryRelationId: park.boundaryId,
      fetchedAt: new Date().toISOString(),
      stats,
      trailCount: trails.length,
      trails,
    };
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`  → ${outPath}`);

    // Print top-20 by length for quick eyeball.
    console.log("\n  TOP 20 BY LENGTH:");
    for (const t of trails.slice(0, 20)) {
      const wiki = t.wikipedia ? "📘" : "  ";
      console.log(`    ${wiki} ${t.lengthMiles.toString().padStart(5)} mi  [${t.osmType}]  ${t.name}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
