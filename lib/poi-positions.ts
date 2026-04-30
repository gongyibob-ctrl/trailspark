// Compute on-map / on-elevation-chart positions for POIs that only know their
// distance from the trailhead. We walk the trail's polyline accumulating
// haversine distance; once we've covered the POI's miles we interpolate
// linearly between the two surrounding vertices.

import { haversineKm } from "./geo";
import { getGeometry } from "./geometries";
import type { POI } from "./trail-pois";

const MI_TO_KM = 1.60934;

/** Returns [lng, lat] at `miles` from the start of the trail line, or null
 *  if the trail has no geometry. Past the end of the line, returns the last
 *  vertex (clamps gracefully). */
export function pointAtMiles(trailId: string, miles: number): [number, number] | null {
  const geom = getGeometry(trailId);
  if (!geom) return null;
  const targetKm = Math.max(0, miles * MI_TO_KM);

  const lines: number[][][] =
    geom.type === "LineString"
      ? [geom.coordinates as number[][]]
      : (geom.coordinates as number[][][]);

  let cumKm = 0;
  for (const line of lines) {
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1] as [number, number];
      const b = line[i] as [number, number];
      const segKm = haversineKm(a, b);
      if (cumKm + segKm >= targetKm) {
        const t = segKm > 0 ? (targetKm - cumKm) / segKm : 0;
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      }
      cumKm += segKm;
    }
  }
  // Past the end of the line — clamp to last vertex
  const last = lines[lines.length - 1];
  return last[last.length - 1] as [number, number];
}

/** For each POI of a trail that has a known mile mark and a renderable
 *  position, returns the POI plus its [lng, lat]. */
export function poisWithPositions(
  trailId: string,
  pois: POI[],
): Array<{ poi: POI; lngLat: [number, number] }> {
  const out: Array<{ poi: POI; lngLat: [number, number] }> = [];
  for (const poi of pois) {
    if (poi.m == null) continue;
    const pt = pointAtMiles(trailId, poi.m);
    if (pt) out.push({ poi, lngLat: pt });
  }
  return out;
}
