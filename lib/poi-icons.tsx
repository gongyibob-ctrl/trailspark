import {
  Mountain,
  Eye,
  Droplets,
  Waves,
  Wind,
  Sprout,
  Trees,
  MapPin,
  Castle,
  Snowflake,
  Bird,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { POIType } from "./trail-pois";

/** Locale-aware POI name fallback — keeps the EN name when the user is in
 *  English mode or no Chinese override exists. */
export function pickPoiName(
  poi: { name: string; nameZh?: string },
  locale: "en" | "zh",
): string {
  return locale === "zh" && poi.nameZh ? poi.nameZh : poi.name;
}

export const POI_ICON: Record<POIType, LucideIcon> = {
  peak: Mountain,
  viewpoint: Eye,
  waterfall: Droplets,
  lake: Waves,
  pass: Wind,
  meadow: Sprout,
  river: Droplets,
  tree: Trees,
  coast: Waves,
  rock: Mountain,
  glacier: Snowflake,
  ruins: Castle,
  wildlife: Bird,
};

/** Hex color per POI type — used for raw DOM elements (map markers,
 *  elevation-chart dots) where Tailwind classes don't apply. */
export const POI_HEX: Record<POIType, string> = {
  peak: "#a8a29e",
  viewpoint: "#fbbf24",
  waterfall: "#38bdf8",
  lake: "#3b82f6",
  pass: "#94a3b8",
  meadow: "#34d399",
  river: "#22d3ee",
  tree: "#4ade80",
  coast: "#2dd4bf",
  rock: "#a1a1aa",
  glacier: "#a5f3fc",
  ruins: "#d97706",
  wildlife: "#fb923c",
};

/** Tailwind color hint per type — used for the icon chip background. */
export const POI_TONE: Record<POIType, string> = {
  peak: "bg-stone-500/15 text-stone-200 ring-stone-400/25",
  viewpoint: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  waterfall: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
  lake: "bg-blue-500/15 text-blue-200 ring-blue-400/25",
  pass: "bg-slate-500/15 text-slate-200 ring-slate-400/25",
  meadow: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  river: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/25",
  tree: "bg-green-600/15 text-green-200 ring-green-500/25",
  coast: "bg-teal-500/15 text-teal-200 ring-teal-400/25",
  rock: "bg-zinc-500/15 text-zinc-200 ring-zinc-400/25",
  glacier: "bg-cyan-300/15 text-cyan-100 ring-cyan-300/25",
  ruins: "bg-amber-700/15 text-amber-300 ring-amber-600/25",
  wildlife: "bg-orange-500/15 text-orange-200 ring-orange-400/25",
};
