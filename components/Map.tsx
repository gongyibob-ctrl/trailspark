"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import type { Trail } from "@/lib/types";
import {
  DIFFICULTY_COLOR,
  DIFFICULTY_LABEL,
  ECOSYSTEM_LABEL,
  TYPE_LABEL,
} from "@/lib/types";
import {
  buildLinesFeatureCollection,
  getBounds,
  hasGeometry,
  loadGeometries,
} from "@/lib/geometries";
import { fetchActiveFires } from "@/lib/wildfire";

interface MapProps {
  trails: Trail[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  flyToId: string | null;
}

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const INITIAL_CENTER: [number, number] = [-120.5, 41];
const INITIAL_ZOOM = 4.6;

const LINE_SOURCE_ID = "trail-lines";
const LINE_LAYER_GLOW = "trail-line-glow";
const LINE_LAYER_BASE = "trail-line-base";
const LINE_LAYER_HOVER = "trail-line-hover";
const LINE_LAYER_SELECTED = "trail-line-selected";
const TERRAIN_SOURCE_ID = "terrain-dem";
const FIRE_SOURCE_ID = "wildfire";
const FIRE_LAYER_FILL = "wildfire-fill";
const FIRE_LAYER_LINE = "wildfire-line";

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

function buildPopupHTML(trail: Trail, hint?: string): string {
  const intro = trail.description.length > 170
    ? trail.description.slice(0, 170).replace(/\s+\S*$/, "") + "…"
    : trail.description;

  const tags = [
    `<span class="ts-pill diff-${trail.difficulty}">${DIFFICULTY_LABEL[trail.difficulty]}</span>`,
    `<span class="ts-pill">${TYPE_LABEL[trail.type]}</span>`,
    `<span class="ts-pill">${ECOSYSTEM_LABEL[trail.ecosystem]}</span>`,
    trail.permitRequired ? `<span class="ts-pill ts-pill-permit">Permit</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <div>
      <div class="ts-popup-park">
        <span class="ts-popup-park-dot" style="background:${DIFFICULTY_COLOR[trail.difficulty]}"></span>
        ${escapeHTML(trail.parkUnit)}
      </div>
      <div class="ts-popup-name">${escapeHTML(trail.name)}</div>
      <div class="ts-popup-stats">${trail.lengthMiles} mi · ${trail.elevationGainFt.toLocaleString()} ft gain</div>
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

export default function Map({ trails, selectedId, onSelect, flyToId }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [geomVersion, setGeomVersion] = useState(0);

  // Lookup ref so map event handlers always see the latest trails
  const trailsByIdRef = useRef<Record<string, Trail>>({});
  trailsByIdRef.current = useMemo(
    () => Object.fromEntries(trails.map((t) => [t.id, t])),
    [trails],
  );

  // Kick off geometry fetch once. Bumping geomVersion forces the lines effect to re-run
  // after the network round-trip resolves.
  useEffect(() => {
    loadGeometries().then(() => setGeomVersion((v) => v + 1));
  }, []);

  const linesGeoJSON = useMemo(
    () => buildLinesFeatureCollection(trails),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trails, geomVersion],
  );

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

      // 3D terrain — uses Mapzen Terrarium DEM tiles (free, no key)
      if (!map.getSource(TERRAIN_SOURCE_ID)) {
        try {
          map.addSource(TERRAIN_SOURCE_ID, {
            type: "raster-dem",
            tiles: [
              "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            maxzoom: 12,
            encoding: "terrarium",
          });
          map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: 1.4 });
        } catch (e) {
          console.warn("[Map] terrain init failed:", e);
        }
      }

      // Empty source up-front; data set via the linesGeoJSON effect
      if (!map.getSource(LINE_SOURCE_ID)) {
        map.addSource(LINE_SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }

      // Glow layer (blurry halo beneath the line)
      if (!map.getLayer(LINE_LAYER_GLOW)) {
        map.addLayer({
          id: LINE_LAYER_GLOW,
          type: "line",
          source: LINE_SOURCE_ID,
          paint: {
            "line-color": DIFFICULTY_COLOR_EXPR,
            "line-width": 8,
            "line-opacity": 0.18,
            "line-blur": 3,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
      }
      // Base line (always visible, all trails)
      if (!map.getLayer(LINE_LAYER_BASE)) {
        map.addLayer({
          id: LINE_LAYER_BASE,
          type: "line",
          source: LINE_SOURCE_ID,
          paint: {
            "line-color": DIFFICULTY_COLOR_EXPR,
            "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1.2, 10, 2.4, 14, 3.5],
            "line-opacity": 0.8,
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

      // Wildfire perimeters (after lines so they sit above)
      addWildfireLayers();

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
        linePopup.setLngLat(e.lngLat).setHTML(buildPopupHTML(trail, "Click to view full details")).addTo(map);
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

  // Markers for trailheads (reduced visual weight if a line exists)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      const positions = spreadOverlapping(trails);

      trails.forEach((trail) => {
        const lined = hasGeometry(trail.id);

        const el = document.createElement("div");
        el.className = `trail-pin ${lined ? "trail-pin-small" : ""}`;
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
        }).setHTML(buildPopupHTML(trail, "Click to view full details"));

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
  }, [trails, geomVersion]);

  // Selected styling: marker class + line filter
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (id === selectedId) el.classList.add("selected");
      else el.classList.remove("selected");
    });
    const map = mapRef.current;
    if (!map) return;
    const updateFilter = () => {
      if (map.getLayer(LINE_LAYER_SELECTED)) {
        map.setFilter(LINE_LAYER_SELECTED, ["==", ["get", "id"], selectedId ?? "__none__"]);
      }
    };
    if (map.isStyleLoaded()) updateFilter();
    else map.once("load", updateFilter);
  }, [selectedId]);

  // fly to selected trail — fit to bounds if we have a line, else point fly-to
  useEffect(() => {
    if (!flyToId || !mapRef.current) return;
    const trail = trails.find((t) => t.id === flyToId);
    if (!trail) return;
    const bounds = getBounds(flyToId);
    if (bounds) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 420, right: 500 },
        pitch: 35,
        bearing: -8,
        duration: 1700,
        maxZoom: 13,
        essential: true,
      });
    } else {
      mapRef.current.flyTo({
        center: [trail.trailhead.lng, trail.trailhead.lat],
        zoom: 11,
        pitch: 50,
        bearing: -10,
        duration: 1700,
        essential: true,
      });
    }
  }, [flyToId, trails]);

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
