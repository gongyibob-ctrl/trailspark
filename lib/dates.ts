import type { Season } from "./types";

// Locale-aware month names live in lib/i18n.tsx (`monthShort.*`, `monthFull.*`).
// We keep DAYS_IN_MONTH here because it's locale-independent.

// Non-leap year — fine for our use cases (averages + slider clamps).
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const SEASON_OF_MONTH: Season[] = [
  "winter", // Jan
  "winter", // Feb
  "spring", // Mar
  "spring", // Apr
  "spring", // May
  "summer", // Jun
  "summer", // Jul
  "summer", // Aug
  "fall", // Sep
  "fall", // Oct
  "fall", // Nov
  "winter", // Dec
];

export interface PickedDate {
  month: number; // 1-12
  day: number; // 1-31
}

export function seasonForDate(d: PickedDate): Season {
  return SEASON_OF_MONTH[d.month - 1];
}

export function bestMonths(seasons: Season[]): Set<number> {
  const out = new Set<number>();
  SEASON_OF_MONTH.forEach((s, i) => {
    if (seasons.includes(s)) out.add(i + 1);
  });
  return out;
}

export function todayPicked(): PickedDate {
  const now = new Date();
  return { month: now.getMonth() + 1, day: now.getDate() };
}

export function clampDay(month: number, day: number): number {
  const max = DAYS_IN_MONTH[month - 1];
  return Math.min(Math.max(1, day), max);
}

// Initial date for a trail: today if in best season, else mid-point of first best season month
export function initialDateForBestSeasons(seasons: Season[]): PickedDate {
  const today = todayPicked();
  const best = bestMonths(seasons);
  if (best.has(today.month)) return today;
  // Pick the first best month from the set
  const firstBest = Math.min(...Array.from(best));
  if (!isFinite(firstBest)) return today;
  return { month: firstBest, day: 15 };
}
