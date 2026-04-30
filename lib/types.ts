export type Region =
  | "yosemite-sierra"
  | "rainier"
  | "olympic"
  | "north-cascades"
  | "oregon"
  | "norcal"
  | "socal-desert"
  | "bigsur-bay"
  | "thru-hike";

export type State = "CA" | "OR" | "WA" | "Multi";

export type Difficulty = "easy" | "moderate" | "hard" | "extreme";

export type TrailType = "day" | "multi-day" | "thru-hike";

export type Ecosystem =
  | "alpine"
  | "subalpine"
  | "volcanic"
  | "rainforest"
  | "coastal"
  | "desert"
  | "redwood"
  | "chaparral"
  | "gorge";

export type Season = "spring" | "summer" | "fall" | "winter";

export interface Trail {
  id: string;
  name: string;
  region: Region;
  state: State;
  parkUnit: string;
  difficulty: Difficulty;
  type: TrailType;
  ecosystem: Ecosystem;
  lengthMiles: number;
  elevationGainFt: number;
  trailhead: { lat: number; lng: number };
  permitRequired: boolean;
  bestSeasons: Season[];
  description: string;
  highlights: string[];
  externalUrl?: string;
}

// GeoJSON-like geometry shape used by lib/geometries.json
export interface TrailGeometry {
  type: "LineString" | "MultiLineString";
  coordinates: number[][] | number[][][];
}
export interface TrailGeometryEntry {
  source: string;
  geom: TrailGeometry;
  fetchedAt: string;
}

// Display labels for these enums live in lib/i18n.tsx (`difficulty.*`,
// `type.*`, `region.*`, `ecosystem.*`). Only the difficulty *color* is here
// because it's CSS-side and locale-independent.

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "#22c55e",
  moderate: "#3b82f6",
  hard: "#f97316",
  extreme: "#dc2626",
};

