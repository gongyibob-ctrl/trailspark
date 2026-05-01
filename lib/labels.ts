// English-only label maps for the static SEO routes (/trails, /trails/[id]).
// The interactive UI uses lib/i18n.tsx which is "use client"; pulling those
// into a server component would force the locale hook into the static
// bundle. These maps are the SEO surface — Google indexes the English page,
// so single-locale labels are correct here.

import type { Difficulty, Region, Season, TrailType } from "./types";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  extreme: "Extreme",
};

export const TYPE_LABEL: Record<TrailType, string> = {
  day: "Day hike",
  "multi-day": "Multi-day backpack",
  "thru-hike": "Thru-hike",
};

export const SEASON_LABEL: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

export const REGION_LABEL: Record<Region, string> = {
  "yosemite-sierra": "Yosemite & High Sierra",
  rainier: "Mt Rainier",
  olympic: "Olympic",
  "north-cascades": "North Cascades",
  oregon: "Oregon",
  norcal: "Northern California",
  "socal-desert": "Southern California & Desert",
  "bigsur-bay": "Big Sur & Bay Area",
  "thru-hike": "Thru-hikes",
};
