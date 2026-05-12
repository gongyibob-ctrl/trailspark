"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
// Co-located with the component that needs it so non-/map routes don't
// ship 9 KB gzipped of MapLibre styles for no reason.
import "maplibre-gl/dist/maplibre-gl.css";
import type { Trail } from "@/lib/types";
import { DIFFICULTY_COLOR } from "@/lib/types";
import {
  buildLinesFeatureCollection,
  getBounds,
  hasGeometry,
  isImportedLoaded,
  loadGeometries,
  prefetchImportedGeometries,
} from "@/lib/geometries";
import { fetchActiveFires } from "@/lib/wildfire";
import { useLocale, pickLocalized, fmtElevation, fmtPoiMiles, type StringKey } from "@/lib/i18n";
import { TRAILS_ZH } from "@/lib/trails-zh";
import { getTrailPOIs, type POI } from "@/lib/trail-pois";
import { poisWithPositions } from "@/lib/poi-positions";
import { POI_HEX, pickPoiName } from "@/lib/poi-icons";

interface MapProps {
  trails: Trail[];
  userTrails: import("@/lib/uploads").UserTrail[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  flyToId: string | null;
  /** Live device position. When non-null, a pulsing marker is rendered. */
  userPosition: { lat: number; lng: number } | null;
  /** Bumping this counter recenters the map on userPosition (if known). */
  recenterTick: number;
}

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const INITIAL_CENTER: [number, number] = [-120.5, 41];
const INITIAL_ZOOM = 4.6;

const LINE_SOURCE_ID = "trail-lines";
const LINE_LAYER_GLOW = "trail-line-glow";
const LINE_LAYER_BASE = "trail-line-base";
const LINE_LAYER_HOVER = "trail-line-hover";
const LINE_LAYER_SELECTED = "trail-line-selected";
const FIRE_SOURCE_ID = "wildfire";
const FIRE_LAYER_FILL = "wildfire-fill";
const FIRE_LAYER_LINE = "wildfire-line";
const USER_LINE_SOURCE_ID = "user-trail-lines";
const USER_LINE_LAYER = "user-trail-line";
const USER_LINE_LAYER_SELECTED = "user-trail-line-selected";

// Imported (OSM community) trails render as a clustered point source.
// Featured trails keep their HTML markers — only the 1,700+ imports are
// aggregated so the West-Coast view doesn't drown in pins.
const IMPORTED_SOURCE_ID  = "imported-trails";
const IMPORTED_HALO_LAYER    = "imported-cluster-halo";
const IMPORTED_CLUSTER_LAYER = "imported-clusters";
const IMPORTED_COUNT_LAYER   = "imported-cluster-count";
const IMPORTED_POINT_LAYER   = "imported-points";
const IMPORTED_CLUSTER_MAX_ZOOM = 11; // above this, individual points show
const IMPORTED_CLUSTER_RADIUS   = 60; // px

// Inline SVG glyphs used inside the pin. Hand-tuned for legibility at 9–12 px;
// stroke comes from CSS, white needle fill is set inline.
//   Multi-day  → tent (A-frame triangle + center pole)
//   Thru-hike  → compass (circle + needle), distinct silhouette from the tent
//   Day hike   → small filled dot
const PIN_GLYPH_TENT = `<svg viewBox="0 0 24 24"><path d="M3 20 L 12 4 L 21 20 Z"/><path d="M12 20 L 12 14"/></svg>`;
const PIN_GLYPH_COMPASS = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><polygon points="16 8 14 14 8 16 10 10" fill="white" stroke="none"/></svg>`;
const PIN_GLYPH_DOT = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5" fill="white" stroke="none"/></svg>`;

function pinGlyph(type: Trail["type"]): string {
  if (type === "thru-hike") return PIN_GLYPH_COMPASS;
  if (type === "multi-day") return PIN_GLYPH_TENT;
  return PIN_GLYPH_DOT;
}

function escapeHTML(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

// Trails sometimes share a trailhead (Half Dome, JMT, Mist Trail all start at Happy Isles).
// Group them by 4-decimal lat/lng (~10m precision) and scatter members in a small ring
// around the original point so the markers are visually distinguishable.
function spreadOverlapping(trails: Trail[]): Record<string, [number, number]> {
  const buckets: Record<string, Trail[]> = {};
  for (const t of trails) {
    const key = `${t.trailhead.lat.toFixed(4)},${t.trailhead.lng.toFixed(4)}`;
    (buckets[key] ||= []).push(t);
  }
  const out: Record<string, [number, number]> = {};
  for (const group of Object.values(buckets)) {
    if (group.length === 1) {
      const t = group[0];
      out[t.id] = [t.trailhead.lng, t.trailhead.lat];
    } else {
      // ring radius ≈ 80m at 35°lat; tweak per group size
      const radiusDeg = 0.0006 + 0.0002 * Math.min(group.length - 2, 4);
      group.forEach((t, i) => {
        const angle = (i / group.length) * Math.PI * 2 - Math.PI / 2;
        const lat = t.trailhead.lat + Math.sin(angle) * radiusDeg;
        const lng =
          t.trailhead.lng + (Math.cos(angle) * radiusDeg) / Math.cos((t.trailhead.lat * Math.PI) / 180);
        out[t.id] = [lng, lat];
      });
    }
  }
  return out;
}

interface PopupCtx {
  t: (k: StringKey, vars?: Record<string, string | number>) => string;
  fmtDistance: (mi: number) => string;
  fmtElevation: (ft: number) => string;
  pickLocalizedDescription: (trail: Trail) => string;
  pickLocalizedParkUnit: (trail: Trail) => string;
}

function buildPopupHTML(trail: Trail, ctx: PopupCtx, hint?: string): string {
  const description = ctx.pickLocalizedDescription(trail);
  const intro = description.length > 170
    ? description.slice(0, 170).replace(/\s+\S*$/, "") + "…"
    : description;
  const parkUnit = ctx.pickLocalizedParkUnit(trail);

  const tags = [
    `<span class="ts-pill diff-${trail.difficulty}">${ctx.t(`difficulty.${trail.difficulty}` as StringKey)}</span>`,
    `<span class="ts-pill">${ctx.t(`type.${trail.type}` as StringKey)}</span>`,
    `<span class="ts-pill">${ctx.t(`ecosystem.${trail.ecosystem}` as StringKey)}</span>`,
    trail.permitRequired ? `<span class="ts-pill ts-pill-permit">${ctx.t("tag.permit")}</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <div>
      <div class="ts-popup-park">
        <span class="ts-popup-park-dot" style="background:${DIFFICULTY_COLOR[trail.difficulty]}"></span>
        ${escapeHTML(parkUnit)}
      </div>
      <div class="ts-popup-name">${escapeHTML(trail.name)}</div>
      <div class="ts-popup-stats">${ctx.fmtDistance(trail.lengthMiles)} · ${ctx.t("sidebar.gain", { n: ctx.fmtElevation(trail.elevationGainFt) })}</div>
      <div class="ts-popup-tags">${tags}</div>
      <div class="ts-popup-desc">${escapeHTML(intro)}</div>
      ${hint ? `<div class="ts-popup-hint">${escapeHTML(hint)}</div>` : ""}
    </div>
  `;
}

const DIFFICULTY_COLOR_EXPR = [
  "match",
  ["get", "difficulty"],
  "easy",
  DIFFICULTY_COLOR.easy,
  "moderate",
  DIFFICULTY_COLOR.moderate,
  "hard",
  DIFFICULTY_COLOR.hard,
  "extreme",
  DIFFICULTY_COLOR.extreme,
  "#ffffff",
] as any;

// Camera-fly durations. Tuned past the ~600ms disorientation floor; faster
// felt jumpy in testing, slower felt sluggish on mobile.
const FLY_DURATION_BOUNDS = 1050;
const FLY_DURATION_POINT = 1050;
const FLY_DURATION_USER_BOUNDS = 900;
const FLY_DURATION_LOCATE = 900;

export default function Map({
  trails,
  userTrails,
  selectedId,
  onSelect,
  flyToId,
  userPosition,
  recenterTick,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const userMarkerRef = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [geomVersion, setGeomVersion] = useState(0);

  // POI markers attached when a trail is selected (and only that trail's POIs)
  const poiMarkersRef = useRef<Marker[]>([]);

  // Lookup ref so map event handlers always see the latest trails
  const trailsByIdRef = useRef<Record<string, Trail>>({});
  trailsByIdRef.current = useMemo(
    () => Object.fromEntries(trails.map((t) => [t.id, t])),
    [trails],
  );

  // Pop-up context (locale-aware) — ref so event handlers see the latest values
  const { t: tt, locale, fmtDistance: ttFmtDist, fmtElevation: ttFmtElev } = useLocale();
  const popupCtxRef = useRef({
    t: tt,
    fmtDistance: ttFmtDist,
    fmtElevation: ttFmtElev,
    pickLocalizedDescription: (tr: Trail) => pickLocalized(locale, TRAILS_ZH[tr.id]?.description, tr.description),
    pickLocalizedParkUnit: (tr: Trail) => pickLocalized(locale, TRAILS_ZH[tr.id]?.parkUnit, tr.parkUnit),
  });
  popupCtxRef.current = {
    t: tt,
    fmtDistance: ttFmtDist,
    fmtElevation: ttFmtElev,
    pickLocalizedDescription: (tr: Trail) => pickLocalized(locale, TRAILS_ZH[tr.id]?.description, tr.description),
    pickLocalizedParkUnit: (tr: Trail) => pickLocalized(locale, TRAILS_ZH[tr.id]?.parkUnit, tr.parkUnit),
  };

  // Curated geometries load eagerly (~830 KB). Imported geometries
  // (~6.8 MB raw / ~2 MB gz) are NOT auto-prefetched: most mobile users
  // browse at default zoom where imported lines aren't visible anyway,
  // and the download + JSON.parse was the felt mobile lag. Imported is
  // demand-fetched via two triggers further below: zoom ≥ 10, or user
  // selects an osm-* trail.
  useEffect(() => {
    loadGeometries().then(() => setGeomVersion((v) => v + 1));
  }, []);

  // Guarded prefetch — used by both the zoom-threshold trigger and the
  // selectedId trigger. Centralizing means there's one place that
  // owns the "fetch + bump version" contract.
  const ensureImported = useCallback(() => {
    if (isImportedLoaded()) return;
    prefetchImportedGeometries().then(() => setGeomVersion((v) => v + 1));
  }, []);

  const linesGeoJSON = useMemo(
    () => buildLinesFeatureCollection(trails),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trails, geomVersion],
  );

  // Point geometry for imported trails, fed into the clustered source.
  // Featured trails are deliberately excluded — they still render as HTML
  // markers because the editorial product wants them individually visible.
  const importedPointsGeoJSON = useMemo<GeoJSON.FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: trails
      .filter((t) => t.tier === "imported")
      .map((t) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [t.trailhead.lng, t.trailhead.lat],
        },
        properties: {
          id: t.id,
          name: t.name,
          difficulty: t.difficulty,
        },
      })),
  }), [trails]);

  // init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: MLMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        minZoom: 3,
        maxZoom: 15,
        attributionControl: { compact: true },
      });
    } catch (e: any) {
      console.error("[Map] failed to construct:", e);
      setStatus("error");
      setErrorMsg(e?.message ?? String(e));
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "imperial" }), "bottom-left");

    // Lazy-fetch imported geometries the first time the user zooms past
    // park scale — that's where their lines start fading in via the
    // opacity expression on LINE_LAYER_BASE. `zoomend` fires once per
    // gesture (vs. `zoom` which fires per animation frame) — same UX
    // for a deferred prefetch, ~50× fewer invocations during pinch.
    const triggerImportedLoad = () => {
      if (map.getZoom() < 10) return;
      map.off("zoomend", triggerImportedLoad);
      ensureImported();
    };
    map.on("zoomend", triggerImportedLoad);

    // Wildfire layer setup helper — runs after style load
    const addWildfireLayers = async () => {
      try {
        const fires = await fetchActiveFires();
        if (!map.getSource(FIRE_SOURCE_ID)) {
          map.addSource(FIRE_SOURCE_ID, { type: "geojson", data: fires });
          map.addLayer({
            id: FIRE_LAYER_FILL,
            type: "fill",
            source: FIRE_SOURCE_ID,
            paint: {
              "fill-color": "#dc2626",
              "fill-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4, 0.18,
                10, 0.32,
              ],
            },
          });
          map.addLayer({
            id: FIRE_LAYER_LINE,
            type: "line",
            source: FIRE_SOURCE_ID,
            paint: {
              "line-color": "#dc2626",
              "line-width": 1.5,
              "line-opacity": 0.9,
            },
          });

          map.on("mouseenter", FIRE_LAYER_FILL, () => {
            map.getCanvas().style.cursor = "help";
          });
          map.on("mouseleave", FIRE_LAYER_FILL, () => {
            map.getCanvas().style.cursor = "";
          });
          const firePopup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: "240px",
            offset: 8,
          });
          map.on("mousemove", FIRE_LAYER_FILL, (e) => {
            const f = e.features?.[0];
            if (!f) return;
            const p = f.properties as { name?: string; acres?: number; contained?: number };
            firePopup
              .setLngLat(e.lngLat)
              .setHTML(
                `<div style="font-weight:600;color:#fca5a5;font-size:13px;">🔥 ${p.name ?? "Active fire"}</div>
                 <div style="opacity:0.75;margin-top:2px;">${(p.acres ?? 0).toLocaleString()} acres · ${p.contained ?? 0}% contained</div>`,
              )
              .addTo(map);
          });
          map.on("mouseleave", FIRE_LAYER_FILL, () => firePopup.remove());
        }
      } catch (e) {
        console.warn("[Map] wildfire fetch failed:", e);
      }
    };

    map.on("load", () => {
      console.log("[Map] style loaded");

      // NOTE: 3D terrain (raster-dem + setTerrain) was removed because it
      // intermittently triggered an internal MapLibre crash:
      //   "Attempting to run(), but is already running"
      // The crash fires from a ResizeObserver-driven redraw during HMR /
      // React strict-mode double-mount and breaks the entire React tree.
      // Pitch on fly-to still works without it; we lose only the bumpy
      // terrain shading, which was always subtle on this base style.

      // Empty source up-front; data set via the linesGeoJSON effect
      if (!map.getSource(LINE_SOURCE_ID)) {
        map.addSource(LINE_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }

      // Glow layer (blurry halo beneath the line). Imported tier fades in
      // around zoom 10 to match the imported-pin reveal threshold.
      if (!map.getLayer(LINE_LAYER_GLOW)) {
        map.addLayer({
          id: LINE_LAYER_GLOW,
          type: "line",
          source: LINE_SOURCE_ID,
          paint: {
            "line-color": DIFFICULTY_COLOR_EXPR,
            "line-width": 8,
            "line-opacity": [
              "case",
              ["==", ["get", "tier"], "imported"],
              ["interpolate", ["linear"], ["zoom"], 9.5, 0, 10.5, 0.10],
              0.18,
            ],
            "line-blur": 3,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
      }
      // Base line — featured always visible; imported fades in at zoom 10.
      if (!map.getLayer(LINE_LAYER_BASE)) {
        map.addLayer({
          id: LINE_LAYER_BASE,
          type: "line",
          source: LINE_SOURCE_ID,
          paint: {
            "line-color": DIFFICULTY_COLOR_EXPR,
            "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1.2, 10, 2.4, 14, 3.5],
            "line-opacity": [
              "case",
              ["==", ["get", "tier"], "imported"],
              ["interpolate", ["linear"], ["zoom"], 9.5, 0, 10.5, 0.45],
              0.8,
            ],
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
      }
      // Hover layer — only one trail at a time, brighter
      if (!map.getLayer(LINE_LAYER_HOVER)) {
        map.addLayer({
          id: LINE_LAYER_HOVER,
          type: "line",
          source: LINE_SOURCE_ID,
          filter: ["==", ["get", "id"], "__none__"],
          paint: {
            "line-color": DIFFICULTY_COLOR_EXPR,
            "line-width": ["interpolate", ["linear"], ["zoom"], 5, 2.4, 10, 4, 14, 5.5],
            "line-opacity": 1,
            "line-blur": 0.5,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
      }
      // Selected layer (white)
      if (!map.getLayer(LINE_LAYER_SELECTED)) {
        map.addLayer({
          id: LINE_LAYER_SELECTED,
          type: "line",
          source: LINE_SOURCE_ID,
          filter: ["==", ["get", "id"], "__none__"],
          paint: {
            "line-color": "#ffffff",
            "line-width": ["interpolate", ["linear"], ["zoom"], 5, 2.8, 10, 5, 14, 7],
            "line-opacity": 0.95,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
      }

      // Wildfire perimeters — deferred so the NIFC fetch doesn't compete
      // with critical map tiles + trail-line setup on first paint. Uses
      // requestIdleCallback where supported; falls back to a generous
      // setTimeout on Safari.
      const ric = (window as any).requestIdleCallback as
        | ((cb: () => void, opts?: { timeout: number }) => number)
        | undefined;
      if (ric) ric(() => addWildfireLayers(), { timeout: 3000 });
      else setTimeout(() => addWildfireLayers(), 1500);

      // User-uploaded GPX trails — distinct dashed violet line so they don't
      // visually compete with the curated 50.
      if (!map.getSource(USER_LINE_SOURCE_ID)) {
        map.addSource(USER_LINE_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: USER_LINE_LAYER,
          type: "line",
          source: USER_LINE_SOURCE_ID,
          paint: {
            "line-color": "#a78bfa",
            "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1.6, 10, 2.6, 14, 3.5],
            "line-opacity": 0.85,
            "line-dasharray": [2, 1.5],
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
        map.addLayer({
          id: USER_LINE_LAYER_SELECTED,
          type: "line",
          source: USER_LINE_SOURCE_ID,
          filter: ["==", ["get", "id"], "__none__"],
          paint: {
            "line-color": "#c4b5fd",
            "line-width": ["interpolate", ["linear"], ["zoom"], 5, 3, 10, 5, 14, 7],
            "line-opacity": 0.95,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
        map.on("click", USER_LINE_LAYER, (e) => {
          const id = e.features?.[0]?.properties?.id as string | undefined;
          if (id) onSelectRef.current(id);
        });
        map.on("mouseenter", USER_LINE_LAYER, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", USER_LINE_LAYER, () => {
          map.getCanvas().style.cursor = "";
        });
      }

      // Imported-trails clustered source: 1,700+ community routes aggregate
      // into bubbles at low zoom, break apart on click + zoom-in.
      if (!map.getSource(IMPORTED_SOURCE_ID)) {
        map.addSource(IMPORTED_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }, // filled by sync effect below
          cluster: true,
          clusterMaxZoom: IMPORTED_CLUSTER_MAX_ZOOM,
          clusterRadius: IMPORTED_CLUSTER_RADIUS,
        });

        // Halo — soft glow underneath each cluster so the bubble feels
        // grounded in the map instead of pasted on top. Larger radius +
        // very low opacity + circle-blur creates atmospheric falloff.
        map.addLayer({
          id: IMPORTED_HALO_LAYER,
          type: "circle",
          source: IMPORTED_SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#c4b5fd",
            "circle-radius": [
              "step", ["get", "point_count"],
              28,
              30,  38,
              100, 50,
              300, 64,
            ],
            "circle-opacity": 0.18,
            "circle-blur": 0.7,
          },
        });

        // Cluster bubble — frosted glass: low fill opacity so the map
        // shows through, soft same-color stroke for the rim highlight.
        map.addLayer({
          id: IMPORTED_CLUSTER_LAYER,
          type: "circle",
          source: IMPORTED_SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step", ["get", "point_count"],
              "#c4b5fd",       // 1–29  — light lavender
              30,  "#a78bfa",  // 30–99
              100, "#8b5cf6",  // 100–299
              300, "#7c3aed",  // 300+  — deep amethyst
            ],
            "circle-radius": [
              "step", ["get", "point_count"],
              16,
              30,  22,
              100, 30,
              300, 38,
            ],
            "circle-opacity": 0.42,
            "circle-stroke-width": 1.25,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-opacity": 0.55,
            "circle-blur": 0.12,
          },
        });

        // Cluster count label — white with a dark soft halo so it's
        // legible across both glassy bubbles and the underlying basemap.
        map.addLayer({
          id: IMPORTED_COUNT_LAYER,
          type: "symbol",
          source: IMPORTED_SOURCE_ID,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Bold"],
            "text-size": [
              "step", ["get", "point_count"],
              12,
              30, 13,
              100, 14,
              300, 15,
            ],
            "text-allow-overlap": true,
            "text-letter-spacing": 0.02,
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "rgba(20, 12, 36, 0.65)",
            "text-halo-width": 1.5,
            "text-halo-blur": 0.5,
          },
        });

        // Unclustered individual points — small glassy dot once a
        // cluster breaks apart at high zoom.
        map.addLayer({
          id: IMPORTED_POINT_LAYER,
          type: "circle",
          source: IMPORTED_SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#a78bfa",
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 3.5, 12, 5.5, 15, 7.5],
            "circle-stroke-width": 1.25,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-opacity": 0.65,
            "circle-opacity": 0.55,
            "circle-blur": 0.08,
          },
        });

        // Click on a cluster — zoom in to the level where it breaks apart.
        map.on("click", IMPORTED_CLUSTER_LAYER, async (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: [IMPORTED_CLUSTER_LAYER] });
          const feature = features[0];
          if (!feature) return;
          const clusterId = feature.properties?.cluster_id;
          const source = map.getSource(IMPORTED_SOURCE_ID) as maplibregl.GeoJSONSource;
          try {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
            map.easeTo({ center: coords, zoom, duration: 700 });
          } catch (err) {
            console.warn("[imported-cluster] expansion zoom failed:", err);
          }
        });

        // Click on an individual imported point — select that trail.
        map.on("click", IMPORTED_POINT_LAYER, (e) => {
          const id = e.features?.[0]?.properties?.id as string | undefined;
          if (id) onSelectRef.current(id);
        });

        map.on("mouseenter", IMPORTED_CLUSTER_LAYER, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", IMPORTED_CLUSTER_LAYER, () => { map.getCanvas().style.cursor = ""; });
        map.on("mouseenter", IMPORTED_POINT_LAYER,   () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", IMPORTED_POINT_LAYER,   () => { map.getCanvas().style.cursor = ""; });
      }

      // Cursor + click on lines
      map.on("click", LINE_LAYER_BASE, (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) onSelectRef.current(id);
      });

      // Hover popup tied to the line layer (follows cursor)
      const linePopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 14,
        maxWidth: "280px",
      });

      map.on("mousemove", LINE_LAYER_BASE, (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const trail = trailsByIdRef.current[id];
        if (!trail) return;
        map.getCanvas().style.cursor = "pointer";
        // Highlight the hovered line in its difficulty color
        map.setFilter(LINE_LAYER_HOVER, ["==", ["get", "id"], id]);
        linePopup
          .setLngLat(e.lngLat)
          .setHTML(buildPopupHTML(trail, popupCtxRef.current, popupCtxRef.current.t("gear.popup.click")))
          .addTo(map);
      });
      map.on("mouseleave", LINE_LAYER_BASE, () => {
        map.getCanvas().style.cursor = "";
        map.setFilter(LINE_LAYER_HOVER, ["==", ["get", "id"], "__none__"]);
        linePopup.remove();
      });

      setStatus("ready");
    });
    map.on("error", (e) => {
      console.warn("[Map] error event:", e?.error?.message ?? e);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
      poiMarkersRef.current = [];
    };
  }, []);

  // Push linesGeoJSON to the map source whenever trails change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource(LINE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(linesGeoJSON);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [linesGeoJSON]);

  // Push imported-trails point data into the clustered source.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource(IMPORTED_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(importedPointsGeoJSON);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [importedPointsGeoJSON]);

  // User-trail line data — syncs whenever uploads add/remove
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const data: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: userTrails.map((u) => ({
        type: "Feature",
        geometry: { type: "LineString", coordinates: u.points },
        properties: { id: u.id, name: u.name },
      })),
    };
    const apply = () => {
      const src = map.getSource(USER_LINE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(data);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [userTrails]);

  // Markers for trailheads (reduced visual weight if a line exists)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      const positions = spreadOverlapping(trails);

      // Imported trails render via the clustered point source above —
      // skip them here so we don't double-draw a marker + a cluster point.
      const markerTrails = trails.filter((t) => t.tier !== "imported");

      markerTrails.forEach((trail) => {
        const lined = hasGeometry(trail.id);

        const el = document.createElement("div");
        el.className = ["trail-pin", lined && "trail-pin-small"].filter(Boolean).join(" ");
        el.dataset.id = trail.id;

        const inner = document.createElement("div");
        inner.className = "trail-pin-inner";
        inner.style.background = DIFFICULTY_COLOR[trail.difficulty];
        inner.style.color = DIFFICULTY_COLOR[trail.difficulty];
        inner.innerHTML = pinGlyph(trail.type);
        el.appendChild(inner);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current(trail.id);
        });

        const popup = new maplibregl.Popup({
          offset: lined ? 12 : 18,
          closeButton: false,
          closeOnClick: false,
          maxWidth: "280px",
          anchor: "bottom",
        }).setHTML(buildPopupHTML(trail, popupCtxRef.current, popupCtxRef.current.t("gear.popup.click")));

        const pos = positions[trail.id] ?? [trail.trailhead.lng, trail.trailhead.lat];
        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(pos)
          .setPopup(popup)
          .addTo(map);

        el.addEventListener("mouseenter", () => {
          if (!popup.isOpen()) marker.togglePopup();
        });
        el.addEventListener("mouseleave", () => {
          if (popup.isOpen()) marker.togglePopup();
        });

        markersRef.current[trail.id] = marker;
      });
    };

    if (map.loaded() && map.isStyleLoaded()) addMarkers();
    else map.once("load", addMarkers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trails, locale]);

  // When geometries arrive (curated or imported), refresh only the
  // `trail-pin-small` class on existing markers — don't tear down +
  // rebuild all 75 HTML markers + popups + event listeners. Imported
  // trails don't have HTML markers at all (clustered points), so this
  // is genuinely cheap.
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      el.classList.toggle("trail-pin-small", hasGeometry(id));
    });
  }, [geomVersion]);

  // Selected styling: marker class + line filter. If the user selects
  // an osm-* trail before zooming, we lazy-fetch imported geometries
  // here so the selected line can render.
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (id === selectedId) el.classList.add("selected");
      else el.classList.remove("selected");
    });
    const map = mapRef.current;
    if (!map) return;
    if (selectedId?.startsWith("osm-")) ensureImported();
    const updateFilter = () => {
      if (map.getLayer(LINE_LAYER_SELECTED)) {
        map.setFilter(LINE_LAYER_SELECTED, ["==", ["get", "id"], selectedId ?? "__none__"]);
      }
      if (map.getLayer(USER_LINE_LAYER_SELECTED)) {
        map.setFilter(USER_LINE_LAYER_SELECTED, ["==", ["get", "id"], selectedId ?? "__none__"]);
      }
    };
    if (map.isStyleLoaded()) updateFilter();
    else map.once("load", updateFilter);
  }, [selectedId, ensureImported]);

  // POI markers along the selected trail (cleared when no trail or no geometry)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    poiMarkersRef.current.forEach((m) => m.remove());
    poiMarkersRef.current = [];
    if (!selectedId) return;

    const pois = getTrailPOIs(selectedId);
    if (pois.length === 0) return;

    const placed = poisWithPositions(selectedId, pois);
    for (const { poi, lngLat } of placed) {
      const el = document.createElement("div");
      el.className = "poi-dot";
      el.style.background = POI_HEX[poi.type];

      const name = pickPoiName(poi, locale);
      const distance = poi.m && poi.m > 0 ? ` · ${fmtPoiMiles(poi.m, locale)}` : "";
      const elevation = poi.ft != null ? ` · ${fmtElevation(poi.ft, locale)}` : "";

      const popup = new maplibregl.Popup({
        offset: 10,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(
        `<div style="font-weight:600;font-size:12px;color:${POI_HEX[poi.type]};">${escapeHTML(name)}</div>
         <div style="opacity:0.7;margin-top:2px;font-size:11px;">${escapeHTML((distance + elevation).replace(/^ · /, ""))}</div>`,
      );

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map);
      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());
      poiMarkersRef.current.push(marker);
    }
  }, [selectedId, geomVersion, locale]);

  useEffect(() => {
    if (!flyToId || !mapRef.current) return;
    if (flyToId.startsWith("user-")) {
      const u = userTrails.find((x) => x.id === flyToId);
      if (u) {
        mapRef.current.fitBounds(u.bounds, {
          padding: { top: 80, bottom: 80, left: 420, right: 500 },
          pitch: 30,
          duration: FLY_DURATION_USER_BOUNDS,
          maxZoom: 14,
          essential: true,
        });
      }
      return;
    }
    const trail = trails.find((t) => t.id === flyToId);
    if (!trail) return;
    const bounds = getBounds(flyToId);
    if (bounds) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 420, right: 500 },
        pitch: 35,
        bearing: -8,
        duration: FLY_DURATION_BOUNDS,
        maxZoom: 13,
        essential: true,
      });
    } else {
      mapRef.current.flyTo({
        center: [trail.trailhead.lng, trail.trailhead.lat],
        zoom: 11,
        pitch: 50,
        bearing: -10,
        duration: FLY_DURATION_POINT,
        essential: true,
      });
    }
  }, [flyToId, trails, userTrails]);

  // User-location marker: create once when first position arrives, then move
  // it on subsequent updates instead of re-creating (so the CSS pulse keeps
  // its phase and the DOM node stays stable).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!userPosition) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }
    const lngLat: [number, number] = [userPosition.lng, userPosition.lat];
    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "user-loc";
      userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(lngLat)
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat(lngLat);
    }
  }, [userPosition]);

  // Recenter on user. Triggers on first acquisition (boolean transition of
  // !!userPosition) or any explicit tap of the locate button (recenterTick).
  const hadPositionRef = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPosition) {
      hadPositionRef.current = false;
      return;
    }
    const isFirstFix = !hadPositionRef.current;
    hadPositionRef.current = true;
    map.flyTo({
      center: [userPosition.lng, userPosition.lat],
      zoom: isFirstFix ? 10 : Math.max(map.getZoom(), 11),
      duration: FLY_DURATION_LOCATE,
      essential: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterTick, !!userPosition]);

  return (
    <div className="absolute inset-0 bg-forest-950">
      <div ref={containerRef} className="h-full w-full" />

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="rounded-full bg-black/60 px-4 py-2 text-xs text-white/80 backdrop-blur">
            Loading map…
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-forest-950/95">
          <div className="max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
            <div className="mb-2 font-semibold">Map failed to load</div>
            <div className="mb-3 font-mono text-xs text-red-200/80 break-all">{errorMsg}</div>
            <div className="text-xs text-white/65">
              Check your internet connection — base tiles are loaded from{" "}
              <code className="text-white/85">tiles.openfreemap.org</code>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
