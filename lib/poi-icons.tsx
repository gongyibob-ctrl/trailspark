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
