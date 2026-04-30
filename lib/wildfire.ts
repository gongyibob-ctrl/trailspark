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

type FireFC = GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, WildfireProps>;

let cache: { data: FireFC; fetchedAt: number } | null = null;

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
  cache = { data, fetchedAt: Date.now() };
  return data;
}

// ---------------- Distance ----------------

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Quickest-and-dirty: distance from point to polygon = min over polygon vertices.
 *  Good enough for a "warn user when fire is nearby" check at km scale. */
function pointToFeatureMinKm(point: [number, number], feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, WildfireProps>): number {
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

/** Return fires within `radiusKm` of the point, sorted nearest-first. */
export function nearbyFires(
  fc: FireFC,
  point: [number, number],
  radiusKm = 50,
): NearbyFire[] {
  const out: NearbyFire[] = [];
  for (const f of fc.features) {
    const d = pointToFeatureMinKm(point, f);
    if (d <= radiusKm) out.push({ fire: f.properties, distanceKm: Math.round(d) });
  }
  out.sort((a, b) => a.distanceKm - b.distanceKm);
  return out;
}
