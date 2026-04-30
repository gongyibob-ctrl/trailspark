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

export const REGION_LABEL: Record<Region, string> = {
  "yosemite-sierra": "Yosemite & High Sierra",
  rainier: "Mt Rainier",
  olympic: "Olympic NP",
  "north-cascades": "North Cascades",
  oregon: "Oregon Cascades & Gorge",
  norcal: "Northern California",
  "socal-desert": "Southern CA & Desert",
  "bigsur-bay": "Big Sur & Bay Area",
  "thru-hike": "Iconic Thru-Hikes",
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  extreme: "Extreme",
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "#22c55e",
  moderate: "#3b82f6",
  hard: "#f97316",
  extreme: "#dc2626",
};

export const TYPE_LABEL: Record<TrailType, string> = {
  day: "Day Hike",
  "multi-day": "Multi-day Backpack",
  "thru-hike": "Thru-Hike",
};

export const ECOSYSTEM_LABEL: Record<Ecosystem, string> = {
  alpine: "Alpine",
  subalpine: "Subalpine",
  volcanic: "Volcanic",
  rainforest: "Temperate Rainforest",
  coastal: "Coastal",
  desert: "Desert",
  redwood: "Redwood Forest",
  chaparral: "Chaparral",
  gorge: "River Gorge",
};
