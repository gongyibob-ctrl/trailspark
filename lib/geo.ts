// Shared geo math used by elevation profiles, wildfire proximity checks, and
// anywhere else we need lng/lat distance or bounding boxes.

const R_EARTH_KM = 6371;

/** "37.7327, -119.5575" — 4-decimal precision picked to be precise enough
 *  to distinguish trailheads (~10 m) without overstating GPS accuracy. */
export function formatLatLng(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/** Google Maps deep link to driving directions ending at the given point.
 *  On mobile the Google Maps app intercepts the URL; on desktop the web
 *  app opens. */
export function googleDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH_KM * Math.asin(Math.sqrt(h));
}

export type Bbox = [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]

/** Walk every coordinate of a (Multi)Polygon and return the bounding box. */
export function bboxOfPolygon(geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): Bbox {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const visit = (ring: number[][]) => {
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  };
  if (geom.type === "Polygon") {
    for (const ring of geom.coordinates) visit(ring);
  } else {
    for (const poly of geom.coordinates) for (const ring of poly) visit(ring);
  }
  return [minLng, minLat, maxLng, maxLat];
}

/** Cheap "could this bbox be within `km` of `point`?" check.
 *  Conservative — false positives are fine, false negatives are not (we'd skip a real hit).
 *  Uses 1° lat ≈ 111km and 1° lng ≈ 111·cos(lat)km. */
export function bboxWithinKm(bbox: Bbox, point: [number, number], km: number): boolean {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const [lng, lat] = point;
  const cosLat = Math.cos((lat * Math.PI) / 180) || 1e-6;
  const padLat = km / 111;
  const padLng = km / (111 * cosLat);
  return (
    lng >= minLng - padLng &&
    lng <= maxLng + padLng &&
    lat >= minLat - padLat &&
    lat <= maxLat + padLat
  );
}
