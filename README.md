# Trailspark

An interactive hiking map for the **US West Coast** — like Google Earth, but focused entirely on the best trails in California, Oregon, and Washington. Browse 50 hand-picked routes across 11 national parks, see climate normals and 7-day forecasts at the trailhead, and get gear recommendations tuned to the trail type, ecosystem, and season.

This is the **MVP** — the first cut. The 50 routes were chosen to span every major ecosystem on the West Coast and every hiking style from family day-walks to multi-week thru-hikes.

---

## Quick start

```bash
cd hiking-map
npm install
npm run dev
```

Then open <http://localhost:3500> (or whatever port appears in the log).

No API keys required. All data sources are free and key-less.

---

## What's in the MVP

### 50 trails across 9 regions

| Region | Count | Highlights |
|---|---|---|
| Yosemite & High Sierra | 10 | Half Dome, Mt Whitney, JMT, Tahoe Rim Trail |
| Mt Rainier | 5 | Wonderland Trail, Skyline Trail (Paradise) |
| Olympic NP | 6 | Hoh Rainforest, High Divide, Shi Shi Beach |
| North Cascades | 5 | Maple Pass Loop, Cascade Pass + Sahale Arm |
| Oregon Cascades & Gorge | 6 | Timberline Trail, South Sister, Eagle Creek |
| Northern California | 4 | Lassen Peak, Lost Coast Trail, Fern Canyon |
| Southern CA & Desert | 5 | Joshua Tree, Death Valley, Mt Baldy |
| Big Sur & Bay Area | 7 | McWay Falls, Tomales Point, Mt Tamalpais |
| Iconic Thru-Hikes | 1 | Pacific Crest Trail (2,650 mi) |

Difficulty mix: 8 easy · 22 moderate · 17 hard · 3 extreme.

### Per-trail features

- **Map pin** color-coded by difficulty, hover-preview, click-to-fly-to with 3D tilt
- **Stats**: length, elevation gain, ecosystem, type (day / multi-day / thru-hike), permit status
- **Description, highlights, parent park unit, official URL**
- **Climate chart** — 5-year monthly highs/lows from Open-Meteo archive
- **7-day forecast** — daily emoji + high/low + wind speed
- **Gear recommendations** — generated from a rule engine that combines trail type, ecosystem, season, and elevation. Switch the season tab to recompute. Essential items are flagged.

### Map

- **OpenFreeMap** Liberty style (free, no key)
- **Trail-line geometries for 48 of 50 trails** — fetched once from OSM Overpass via `scripts/fetch-geometries.mjs`, simplified to ~600 KB total, served from `public/geometries.json` and lazy-loaded on map mount
- Lines colored by difficulty (green/blue/orange/red); selected trail rendered white + thick on top
- Pins shrink to small dots on trails that have a line (visual decluttering)
- Click a line to select that trail; selecting a long trail (PCT, JMT, Wonderland) auto-fits the map to its bounds
- 3D pitch when flying to a trail

### Refreshing the trail-line dataset

```bash
node scripts/fetch-geometries.mjs   # ~5 min, polite rate-limited Overpass queries
node scripts/simplify-geometries.mjs  # decimates to ≤250 pts/line, ≤1500 pts/trail
```

---

## Architecture

```
hiking-map/
├── app/
│   ├── layout.tsx          ← root layout, imports MapLibre CSS
│   ├── page.tsx            ← composes Map + Sidebar + TrailDetail
│   └── globals.css         ← Tailwind + custom MapLibre overrides
├── components/
│   ├── Map.tsx             ← MapLibre canvas, markers, fly-to
│   ├── Sidebar.tsx         ← search, filters (region/diff/type), trail cards
│   └── TrailDetail.tsx     ← stats, climate chart, forecast, gear list
└── lib/
    ├── types.ts            ← Trail / Region / Difficulty / Ecosystem
    ├── trails.ts           ← the 50-trail dataset
    ├── gear.ts             ← rule-engine that maps (trail × season) → gear
    └── weather.ts          ← Open-Meteo client (climate archive + forecast)
```

### Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS 3** + custom forest/ember palette
- **MapLibre GL JS 4** for the interactive map
- **lucide-react** for icons
- **Open-Meteo** for climate normals and 7-day forecasts (no API key)
- **OpenFreeMap** for the base vector tiles (no API key)
- **AWS Terrarium** for raster DEM hillshade

---

## Data sources

| Layer | Source | Cost | Notes |
|---|---|---|---|
| Trail metadata | Hand-curated for MVP | — | Replaceable with OSM `route=hiking` via Overpass |
| Base map vector tiles | [OpenFreeMap](https://openfreemap.org) | Free | No key; community-funded mirror of OSM |
| Hillshade DEM | AWS terrain-tiles | Free | Public S3 bucket |
| Climate normals | [Open-Meteo Archive API](https://open-meteo.com) | Free | 5-year daily aggregate per trailhead |
| 7-day forecast | [Open-Meteo Forecast API](https://open-meteo.com) | Free | Live |

When this graduates beyond MVP, swap the curated dataset for:
- **Overpass API** (OSM `route=hiking` relations) for full trail geometries
- **NPS API** for park alerts, closures, conditions (free key, instant)
- **USFS Geodata** for National Forest trails (Mt Hood, Inyo, etc.)
- **Recreation.gov RIDB** for permit lottery integration
- **InciWeb** for active wildfire incident overlays

See the data discussion notes in the project root for the full strategy.

---

## What's intentionally NOT in the MVP

- User accounts / saved trails
- GPX upload or download
- Photos
- Reviews / community content
- Mobile-optimized layout (desktop-first for v0)

---

## What to do next

1. **Add real trail geometries** — script that pulls OSM `relation[route=hiking][name~"…"]` for each named trail and caches a GeoJSON file
2. **Wildfire overlay** — InciWeb feed → red polygons on the map (critical for summer use)
3. **Permit availability** — Recreation.gov RIDB API → "next available date" on each permit-required card
4. **Elevation profile** — once geometries are in, compute and chart elevation from the line
5. **Mobile layout** — bottom-sheet detail panel instead of side panel
6. **Expand beyond West Coast** — Colorado Rockies and Utah parks are the natural next regions

---

## License

MIT.

Trail descriptions are original. Map data © OpenStreetMap contributors via OpenFreeMap. Weather data via Open-Meteo (CC-BY 4.0).
