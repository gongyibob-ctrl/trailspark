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

/** Popularity / traffic tier — read as a positive descriptor of the
 *  experience, not a judgment. Iconic = lots of company; Backcountry =
 *  more solitude (and corresponding self-reliance). */
export type Popularity = "iconic" | "popular" | "steady" | "backcountry";

export const POPULARITY_COLOR: Record<Popularity, string> = {
  iconic: "#ee7e3e",      // ember — warm, celebratory
  popular: "#3b82f6",     // blue — social, accessible
  steady: "#41644e",      // forest — established, low-key
  backcountry: "#8b5cf6", // violet — wilderness, mystery
};

/** Scenery rating, 1 (pleasant but not memorable) to 5 (legendary —
 *  bucket-list scenery you'll remember for years). Calibrated for the
 *  curated West Coast set, where even a 3 is a strong hike anywhere else. */
export type Scenery = 1 | 2 | 3 | 4 | 5;

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
  /** Where the route starts. `name` is a short label like "Happy Isles". */
  trailhead: { lat: number; lng: number; name?: string };
  /** Set only for point-to-point routes (JMT, PCT, Lost Coast, etc.).
   *  Loops and out-and-backs return to `trailhead`, so this stays unset. */
  endpoint?: { lat: number; lng: number; name?: string };
  permitRequired: boolean;
  bestSeasons: Season[];
  popularity: Popularity;
  scenery: Scenery;
  description: string;
  highlights: string[];
  /** Short note about driving access / parking lot / fees. English only;
   *  Chinese override lives in `TRAILS_ZH[id].parking`. */
  parking?: string;
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

