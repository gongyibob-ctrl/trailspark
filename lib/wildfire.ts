// Live wildfire data from NIFC's Wildland Fire Interagency Geospatial Services
// (WFIGS). Public ArcGIS feature service, no API key required, CORS enabled.
//
// We fetch active perimeters (< 100% contained) within a West-Coast bounding box,
// expose them as a GeoJSON FeatureCollection for the map layer, and provide a
// haversine-distance helper for the "fire near this trail" warning.

const ENDPOINT =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query";

// West Coast (incl. parts of NV / ID for fires near WA/OR/CA borders)
const BBOX = { xmin: -125, ymin: 30, xmax: -114, ymax: 49 };

export interface WildfireProps {
  id: string;
  name: string;
  acres: number;
  contained: number; // 0–100
  discovered: string | null;
}

import { bboxOfPolygon, bboxWithinKm, haversineKm, type Bbox } from "./geo";

type FireFC = GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, WildfireProps>;

// Module cache holds the fetched fires + a parallel array of pre-computed
// bboxes so the per-trail proximity check can do an O(N) bbox sieve before
// the expensive O(N×V) haversine walk.
let cache: { data: FireFC; bboxes: Bbox[]; fetchedAt: number } | null = null;

const TTL_MS = 30 * 60 * 1000; // 30 min

interface RawFeature {
  type: "Feature";
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  properties: Record<string, unknown>;
}

async function fetchRaw(): Promise<GeoJSON.FeatureCollection> {
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({
    f: "geojson",
    where: "attr_PercentContained < 100 OR attr_PercentContained IS NULL",
    outFields:
      "poly_IncidentName,poly_GISAcres,attr_IncidentName,attr_FireDiscoveryDateTime,attr_PercentContained,attr_IncidentTypeCategory",
    geometry: `${BBOX.xmin},${BBOX.ymin},${BBOX.xmax},${BBOX.ymax}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    geometryPrecision: "4",
    resultRecordCount: "500",
  }).toString();

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`NIFC ${res.status}`);
  return (await res.json()) as GeoJSON.FeatureCollection;
}

function normalize(raw: GeoJSON.FeatureCollection): FireFC {
  const features: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, WildfireProps>[] = [];
  for (const f of raw.features as RawFeature[]) {
    if (!f.geometry) continue;
    if (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon") continue;
    const p = f.properties || {};
    const name =
      (p.attr_IncidentName as string) ||
      (p.poly_IncidentName as string) ||
      "Unnamed fire";
    const acres = Math.round(Number(p.poly_GISAcres) || 0);
    const containedRaw = p.attr_PercentContained;
    const contained = containedRaw == null ? 0 : Math.round(Number(containedRaw));
    const discovered = (p.attr_FireDiscoveryDateTime as string) || null;
    // Filter out trivially small or old contained
    if (acres < 50) continue;
    features.push({
      type: "Feature",
      geometry: f.geometry,
      properties: {
        id: `${name}-${acres}`,
        name,
        acres,
        contained,
        discovered,
      },
    });
  }
  return { type: "FeatureCollection", features };
}

export async function fetchActiveFires(): Promise<FireFC> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.data;
  const raw = await fetchRaw();
  const data = normalize(raw);
  const bboxes = data.features.map((f) => bboxOfPolygon(f.geometry));
  cache = { data, bboxes, fetchedAt: Date.now() };
  return data;
}

// ---------------- Proximity ----------------

/** Distance from point to polygon — min over polygon vertices.
 *  Sloppy on the inside of huge polygons but fine at the "is this within 50 km?" scale. */
function pointToFeatureMinKm(
  point: [number, number],
  feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, WildfireProps>,
): number {
  let min = Infinity;
  const visit = (ring: number[][]) => {
    for (const [lng, lat] of ring) {
      const d = haversineKm(point, [lng, lat]);
      if (d < min) min = d;
    }
  };
  if (feature.geometry.type === "Polygon") {
    for (const ring of feature.geometry.coordinates) visit(ring);
  } else {
    for (const poly of feature.geometry.coordinates) for (const ring of poly) visit(ring);
  }
  return min;
}

export interface NearbyFire {
  fire: WildfireProps;
  distanceKm: number;
}

/** Fires within `radiusKm` of the point, nearest-first. Uses a cheap bbox
 *  sieve so we only walk vertices for the few fires that could possibly hit. */
export function nearbyFires(
  fc: FireFC,
  point: [number, number],
  radiusKm = 50,
): NearbyFire[] {
  const out: NearbyFire[] = [];
  // bboxes are kept in lockstep with cache.data.features when fetched via
  // fetchActiveFires(). For callers passing in their own FC we recompute on demand.
  const bboxes = cache && cache.data === fc ? cache.bboxes : fc.features.map((f) => bboxOfPolygon(f.geometry));
  for (let i = 0; i < fc.features.length; i++) {
    if (!bboxWithinKm(bboxes[i], point, radiusKm)) continue;
    const d = pointToFeatureMinKm(point, fc.features[i]);
    if (d <= radiusKm) out.push({ fire: fc.features[i].properties, distanceKm: Math.round(d) });
  }
  out.sort((a, b) => a.distanceKm - b.distanceKm);
  return out;
}
