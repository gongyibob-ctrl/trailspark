import type { Trail, Season } from "./types";

export type GearCategory =
  | "footwear"
  | "clothing"
  | "navigation"
  | "hydration"
  | "food"
  | "safety"
  | "shelter"
  | "electronics"
  | "extras";

export interface GearItem {
  name: string;
  category: GearCategory;
  essential: boolean;
  /** Life-critical: dehydration / hypothermia / getting lost in the dark / no first aid.
   *  Visually flagged stronger than `essential` so users can't miss it. */
  critical?: boolean;
  why?: string;
}

export const CATEGORY_LABEL: Record<GearCategory, string> = {
  footwear: "Footwear",
  clothing: "Clothing",
  navigation: "Navigation",
  hydration: "Hydration",
  food: "Food",
  safety: "Safety",
  shelter: "Shelter & Sleep",
  electronics: "Electronics",
  extras: "Extras",
};

const TEN_ESSENTIALS: GearItem[] = [
  { name: "Topographic map", category: "navigation", essential: true, critical: true },
  { name: "Compass or GPS", category: "navigation", essential: true, critical: true },
  { name: "Sun hat & sunglasses", category: "clothing", essential: true },
  { name: "SPF 30+ sunscreen", category: "safety", essential: true },
  { name: "Insulating layer (fleece or puffy)", category: "clothing", essential: true, critical: true },
  { name: "Headlamp + spare batteries", category: "electronics", essential: true, critical: true },
  { name: "First aid kit", category: "safety", essential: true, critical: true },
  { name: "Lighter or matches (waterproof)", category: "safety", essential: true, critical: true },
  { name: "Multi-tool / knife", category: "extras", essential: true },
  { name: "Emergency shelter (bivvy or space blanket)", category: "safety", essential: true, critical: true },
];

interface GearContext {
  trail: Trail;
  season: Season;
}

function dayHikeBase(): GearItem[] {
  return [
    { name: "Trail running shoes or light hikers", category: "footwear", essential: true },
    { name: "Moisture-wicking shirt", category: "clothing", essential: true },
    { name: "Hiking shorts or convertible pants", category: "clothing", essential: true },
    { name: "Daypack (15–25L)", category: "extras", essential: true },
    { name: "Water bottles (2–3L total capacity)", category: "hydration", essential: true, critical: true },
    { name: "High-calorie snacks (bars, trail mix, jerky)", category: "food", essential: true, critical: true },
    { name: "Lunch + extra meal", category: "food", essential: false },
  ];
}

function multiDayBase(): GearItem[] {
  return [
    { name: "Sturdy mid-cut hiking boots (broken in)", category: "footwear", essential: true },
    { name: "Camp shoes (sandals or running shoes)", category: "footwear", essential: false },
    { name: "Multi-day backpack (50–65L)", category: "extras", essential: true },
    { name: "3-season tent or tarp shelter", category: "shelter", essential: true, critical: true },
    { name: "Sleeping bag (rated to expected low + 10°F)", category: "shelter", essential: true, critical: true },
    { name: "Sleeping pad (R-value matched to season)", category: "shelter", essential: true },
    { name: "Stove + fuel canister", category: "food", essential: true },
    { name: "Cookpot + spork", category: "food", essential: true },
    { name: "Lightweight bowl / mug", category: "food", essential: true },
    { name: "Water filter or chemical treatment", category: "hydration", essential: true, critical: true },
    { name: "Bear canister or Ursack (where required)", category: "food", essential: true },
    { name: "Trekking poles", category: "extras", essential: false },
    { name: "Quick-dry towel", category: "extras", essential: false },
    { name: "Wag bag / trowel for human waste", category: "extras", essential: true },
  ];
}

function thruHikeAdditions(): GearItem[] {
  return [
    { name: "Resupply strategy + maildrops", category: "food", essential: true, why: "Multi-week trips require planned resupplies" },
    { name: "Camp shoes (foam clogs)", category: "footwear", essential: true },
    { name: "Two pairs trail runners (rotate)", category: "footwear", essential: false, why: "Most thru-hikers replace shoes every 400–500 miles" },
    { name: "Lightweight rain shell", category: "clothing", essential: true },
    { name: "Down puffy jacket", category: "clothing", essential: true },
    { name: "Sleep clothes (dry, separate from hike clothes)", category: "clothing", essential: true },
    { name: "Lightweight battery pack (10000mAh+)", category: "electronics", essential: true },
    { name: "Phone with offline maps (FarOut/Gaia)", category: "navigation", essential: true },
    { name: "Satellite messenger (Garmin inReach / Zoleo)", category: "safety", essential: true, critical: true, why: "Out of cell range for days; emergency comms required" },
    { name: "Bear canister (where required)", category: "food", essential: true },
    { name: "Ice axe + microspikes (early season Sierra/Cascades)", category: "safety", essential: false, why: "Snowfields linger into July at higher passes" },
  ];
}

function ecosystemAdditions(trail: Trail, season: Season): GearItem[] {
  const items: GearItem[] = [];
  switch (trail.ecosystem) {
    case "rainforest":
    case "gorge":
      items.push(
        { name: "Hardshell rain jacket (waterproof)", category: "clothing", essential: true, why: "Pacific NW rainforest gets rain in every season" },
        { name: "Rain pants", category: "clothing", essential: false },
        { name: "Pack rain cover", category: "extras", essential: true },
        { name: "Quick-dry synthetic layers (no cotton)", category: "clothing", essential: true },
      );
      break;
    case "alpine":
      items.push(
        { name: "Insulated puffy (down or synthetic)", category: "clothing", essential: true, why: "Alpine temps can drop 30°F at sundown" },
        { name: "Wind shell", category: "clothing", essential: true },
        { name: "Beanie + lightweight gloves", category: "clothing", essential: true },
        { name: "Buff / neck gaiter (sun + wind)", category: "clothing", essential: false },
      );
      if (season === "summer" || season === "fall") {
        items.push({ name: "Microspikes (snowfields above 10k ft into July)", category: "safety", essential: false });
      }
      break;
    case "subalpine":
    case "volcanic":
      items.push(
        { name: "Wind shell", category: "clothing", essential: true },
        { name: "Insulating midlayer (fleece or puffy)", category: "clothing", essential: true },
        { name: "Lightweight gloves", category: "clothing", essential: false },
      );
      break;
    case "desert":
      items.push(
        { name: "Wide-brim sun hat", category: "clothing", essential: true, critical: true, why: "No shade — sun protection is non-optional" },
        { name: "Long-sleeve sun hoody (UPF rated)", category: "clothing", essential: true },
        { name: "Extra water capacity (4L+ per person)", category: "hydration", essential: true, critical: true, why: "Desert hikes need 1L/hour minimum" },
        { name: "Electrolyte tablets", category: "hydration", essential: true, critical: true },
        { name: "Sun gloves", category: "clothing", essential: false },
      );
      break;
    case "coastal":
      items.push(
        { name: "Tide chart printout", category: "navigation", essential: true, critical: true, why: "Several coastal sections are impassable at high tide" },
        { name: "Quick-dry clothing (gets wet)", category: "clothing", essential: true },
        { name: "Sandals or wading shoes", category: "footwear", essential: false },
        { name: "Wind shell (constant onshore wind)", category: "clothing", essential: true },
      );
      break;
    case "redwood":
      items.push(
        { name: "Light rain jacket (fog drip is constant)", category: "clothing", essential: true },
        { name: "Insect repellent (mosquitoes near streams)", category: "safety", essential: false },
      );
      break;
    case "chaparral":
      items.push(
        { name: "Sun hoody (UPF rated)", category: "clothing", essential: true, why: "Exposed ridgelines, intense sun" },
        { name: "Tick check awareness (lyme present in CA)", category: "safety", essential: false },
      );
      break;
  }
  return items;
}

function seasonAdditions(season: Season, trail: Trail): GearItem[] {
  const items: GearItem[] = [];
  if (season === "winter") {
    items.push(
      { name: "Microspikes or crampons", category: "safety", essential: true, critical: true, why: "Most West Coast trails have icy patches in winter" },
      { name: "Insulated waterproof boots", category: "footwear", essential: true, critical: true },
      { name: "Insulated gloves (waterproof)", category: "clothing", essential: true, critical: true },
      { name: "Warm hat (covers ears)", category: "clothing", essential: true, critical: true },
      { name: "Hand warmers", category: "extras", essential: false },
    );
  }
  if (season === "summer" && (trail.ecosystem === "alpine" || trail.elevationGainFt > 3500)) {
    items.push({ name: "Bug head net (mosquito season July–Aug)", category: "safety", essential: false });
  }
  if (season === "spring") {
    items.push({ name: "Gaiters (mud + spring runoff)", category: "footwear", essential: false });
  }
  return items;
}

function permitAdditions(trail: Trail): GearItem[] {
  if (!trail.permitRequired) return [];
  return [
    { name: "Printed/saved permit", category: "navigation", essential: true, why: "Rangers do check at entry points" },
  ];
}

export function recommendGear(trail: Trail, season: Season): GearItem[] {
  const ctx: GearContext = { trail, season };
  const items: GearItem[] = [];

  if (trail.type === "day") {
    items.push(...dayHikeBase());
  } else {
    items.push(...multiDayBase());
  }

  if (trail.type === "thru-hike") {
    items.push(...thruHikeAdditions());
  }

  items.push(...TEN_ESSENTIALS);
  items.push(...ecosystemAdditions(trail, season));
  items.push(...seasonAdditions(season, trail));
  items.push(...permitAdditions(trail));

  // Dedupe by name (later additions take precedence)
  const dedup = new Map<string, GearItem>();
  for (const it of items) dedup.set(it.name, it);
  return Array.from(dedup.values());
}

export function groupByCategory(items: GearItem[]): Record<GearCategory, GearItem[]> {
  const out: Record<GearCategory, GearItem[]> = {
    footwear: [],
    clothing: [],
    navigation: [],
    hydration: [],
    food: [],
    safety: [],
    shelter: [],
    electronics: [],
    extras: [],
  };
  for (const it of items) out[it.category].push(it);
  return out;
}
