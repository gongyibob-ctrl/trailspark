// GPX (GPS Exchange Format) parser. GPX is XML; the bits we care about are
// nested track points: <gpx><trk><trkseg><trkpt lat="" lon=""><ele/></trkpt>...
// Most outdoor exports (Strava, AllTrails, Garmin, Komoot, Gaia) emit this shape.
//
// Parsed shape mirrors what we already use elsewhere — trail line as
// [lng,lat][], parallel elevations array (meters → feet conversion at the end),
// plus a few computed totals for the sidebar / detail panel.

import { haversineKm } from "./geo";

const M_TO_FT = 3.28084;
const KM_TO_MI = 0.621371;

export interface ParsedGPX {
  /** Lat/lng in [lng, lat] order (matches GeoJSON). */
  points: [number, number][];
  /** Elevation in feet, parallel to points. */
  feet: number[];
  /** Best-effort name from <trk><name> / <metadata><name>. */
  name: string;
  /** Total trail length in miles. */
  miles: number;
  /** Cumulative gain (sum of positive deltas) in feet. */
  gainFt: number;
  /** First point as [lng, lat]. */
  start: [number, number];
  bounds: [[number, number], [number, number]];
}

export function parseGPX(text: string): ParsedGPX {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const errEl = doc.querySelector("parsererror");
  if (errEl) throw new Error("Invalid GPX file (XML parse failed)");

  const trkpts = Array.from(doc.getElementsByTagName("trkpt"));
  if (trkpts.length < 2) {
    // Some GPX files use <rtept> for routes instead of tracks
    const rtepts = Array.from(doc.getElementsByTagName("rtept"));
    if (rtepts.length < 2) throw new Error("No track or route points found in GPX");
    return parsePoints(rtepts, doc);
  }
  return parsePoints(trkpts, doc);
}

function parsePoints(els: Element[], doc: Document): ParsedGPX {
  const points: [number, number][] = [];
  const elevsM: number[] = [];

  for (const el of els) {
    const lat = parseFloat(el.getAttribute("lat") || "");
    const lng = parseFloat(el.getAttribute("lon") || "");
    if (!isFinite(lat) || !isFinite(lng)) continue;
    const eleNode = el.getElementsByTagName("ele")[0];
    const ele = eleNode ? parseFloat(eleNode.textContent || "0") : 0;
    points.push([lng, lat]);
    elevsM.push(isFinite(ele) ? ele : 0);
  }

  if (points.length < 2) throw new Error("GPX has fewer than 2 valid points");

  // Track / metadata name
  const nameEl =
    doc.querySelector("trk > name") ||
    doc.querySelector("metadata > name") ||
    doc.querySelector("rte > name");
  const name = nameEl?.textContent?.trim() || "Custom track";

  // Stats
  let cumKm = 0;
  let gainM = 0;
  for (let i = 1; i < points.length; i++) {
    cumKm += haversineKm(points[i - 1], points[i]);
    const dEle = elevsM[i] - elevsM[i - 1];
    if (dEle > 0) gainM += dEle;
  }

  // Bounds
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of points) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return {
    points,
    feet: elevsM.map((m) => Math.round(m * M_TO_FT)),
    name,
    miles: Math.round(cumKm * KM_TO_MI * 100) / 100,
    gainFt: Math.round(gainM * M_TO_FT),
    start: points[0],
    bounds: [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
  };
}

/** Reduce point count for storage — most GPX files are 1k-5k points where
 *  100-200 is plenty for rendering. Keeps localStorage well under quota. */
export function thinPoints<T>(points: T[], maxCount = 500): T[] {
  if (points.length <= maxCount) return points;
  const step = (points.length - 1) / (maxCount - 1);
  const out: T[] = [];
  for (let i = 0; i < maxCount; i++) out.push(points[Math.round(i * step)]);
  return out;
}
