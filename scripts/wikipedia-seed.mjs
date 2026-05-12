// Post-merge enrichment: replace templated descriptions with Wikipedia
// summaries for the imported trails that have a wikipedia tag.
//
// Why post-merge: keeps Wikipedia entanglement out of the main pipeline.
// Run any time after merge-imported.mjs; idempotent — uses a cache.
//
// API: https://en.wikipedia.org/api/rest_v1/page/summary/{title}
// No auth needed. Polite 500ms delay between calls.
//
// Run: node scripts/wikipedia-seed.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TRAILS_FILE = resolve(ROOT, "lib/trails-imported.json");
const CACHE_DIR   = resolve(ROOT, "scripts/out");
const CACHE_FILE  = resolve(CACHE_DIR, "wikipedia-cache.json");

const SLEEP_MS = 500;
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// OSM `wikipedia` tag is "lang:Title" (e.g. "en:John Muir Trail"). We only
// pull from English Wikipedia; other-lang articles are skipped.
function parseWikiTag(value) {
  if (!value) return null;
  const m = value.match(/^([a-z-]+):(.+)$/);
  if (m) return m[1] === "en" ? m[2] : null;
  return value; // unprefixed → assume English title
}

async function fetchSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Trailspark-Importer/0.1 (https://trailspark.app)" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return {
    extract: json.extract ?? "",
    description: json.description ?? null,
    canonicalUrl: json.content_urls?.desktop?.page ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

// Pick the leading 1–2 sentences. Wikipedia opening sentences are usually
// "X is a Y in Z" — descriptive and on-topic. Avoid dumping the whole
// article. Split on `[.!?]` followed by whitespace so decimals like "7.2"
// don't get treated as sentence boundaries.
function leadParagraph(extract) {
  if (!extract) return "";
  const sentences = extract.split(/(?<=[.!?])\s+(?=[A-Z])/);
  let out = "";
  for (const s of sentences) {
    if ((out + " " + s).trim().length > 500) break;
    out = (out ? out + " " : "") + s;
  }
  return out.trim() || extract.slice(0, 400);
}

async function main() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const doc = JSON.parse(readFileSync(TRAILS_FILE, "utf8"));
  const cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, "utf8")) : {};

  const targets = doc.trails.filter((t) => t.source?.wikipedia);
  console.log(`${targets.length} imported trails have a Wikipedia tag`);

  let updated = 0, hit = 0, miss = 0;
  for (const t of targets) {
    const title = parseWikiTag(t.source.wikipedia);
    if (!title) { miss += 1; continue; }

    let entry = cache[title];
    if (!entry) {
      try {
        entry = await fetchSummary(title);
        if (entry) {
          cache[title] = entry;
          writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
          console.log(`  fetched: ${title}`);
        } else {
          console.log(`  not found: ${title}`);
          miss += 1;
        }
        await sleep(SLEEP_MS);
      } catch (e) {
        console.log(`  error fetching ${title}: ${e.message}`);
        miss += 1;
        continue;
      }
    } else {
      hit += 1;
    }

    if (!entry) continue;
    const lead = leadParagraph(entry.extract);
    if (lead.length < 80) continue; // too short to be useful

    // Preserve the "OpenStreetMap source" footer in description so users
    // still see provenance; replace just the templated leading sentence.
    t.description = lead;
    if (entry.canonicalUrl) {
      t.source = { ...t.source, wikipediaUrl: entry.canonicalUrl };
    }
    updated += 1;
  }

  writeFileSync(TRAILS_FILE, JSON.stringify(doc, null, 2));
  console.log(`\nDone. updated=${updated}, cache-hits=${hit}, misses=${miss}`);
  console.log(`  → ${TRAILS_FILE}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
