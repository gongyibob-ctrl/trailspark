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
  /** Rough weight per unit, in grams. Used for the running pack-weight estimate.
   *  Intentionally approximate — these are hiking benchmarks, not precise specs. */
  g?: number;
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

// Always critical regardless of trail: dehydration / starvation / blood-loss
// don't care that your trail is short and urban-adjacent. Headlamp / lighter /
// insulating-layer / emergency-shelter are upgraded to critical only on
// remote / alpine / long trails — see needsRemoteEssentials() below.
const TEN_ESSENTIALS: GearItem[] = [
  { name: "Topographic map", category: "navigation", essential: true, critical: true },
  { name: "Compass or GPS", category: "navigation", essential: true, critical: true },
  { name: "Sun hat & sunglasses", category: "clothing", essential: true },
  { name: "SPF 30+ sunscreen", category: "safety", essential: true },
  { name: "Insulating layer (fleece or puffy)", category: "clothing", essential: true },
  { name: "Headlamp + spare batteries", category: "electronics", essential: true },
  { name: "First aid kit", category: "safety", essential: true, critical: true },
  { name: "Lighter or matches (waterproof)", category: "safety", essential: true },
  { name: "Multi-tool / knife", category: "extras", essential: true },
  { name: "Emergency shelter (bivvy or space blanket)", category: "safety", essential: true },
];

// Items that should be critical on real backcountry but stay merely essential
// on a short urban-adjacent day hike (Mt Tam, Mt Diablo, Multnomah-Wahkeena).
const REMOTE_ONLY_CRITICAL = new Set([
  "Headlamp + spare batteries",
  "Lighter or matches (waterproof)",
  "Insulating layer (fleece or puffy)",
  "Emergency shelter (bivvy or space blanket)",
]);

// Realistic per-item weight in grams. Sources: REI specs, common UL/standard
// kits, manufacturer ranges averaged. Approximate — used for the running pack
// estimate, not for serious gram-counting.
const GEAR_GRAMS: Record<string, number> = {
  // Footwear
  "Trail running shoes or light hikers": 700,
  "Sturdy mid-cut hiking boots (broken in)": 1100,
  "Camp shoes (sandals or running shoes)": 350,
  "Camp shoes (foam clogs)": 200,
  "Two pairs trail runners (rotate)": 1400,
  "Insulated waterproof boots": 1500,
  "Sandals or wading shoes": 300,
  "Gaiters (mud + spring runoff)": 200,

  // Clothing
  "Moisture-wicking shirt": 150,
  "Hiking shorts or convertible pants": 300,
  "Sun hat & sunglasses": 130,
  "Wide-brim sun hat": 100,
  "Sun hoody (UPF rated)": 200,
  "Long-sleeve sun hoody (UPF rated)": 200,
  "Insulating layer (fleece or puffy)": 350,
  "Insulating midlayer (fleece or puffy)": 350,
  "Insulated puffy (down or synthetic)": 400,
  "Down puffy jacket": 350,
  "Wind shell": 100,
  "Wind shell (constant onshore wind)": 100,
  "Lightweight rain shell": 250,
  "Hardshell rain jacket (waterproof)": 350,
  "Light rain jacket (fog drip is constant)": 200,
  "Rain pants": 200,
  "Quick-dry synthetic layers (no cotton)": 200,
  "Quick-dry clothing (gets wet)": 150,
  "Beanie + lightweight gloves": 100,
  "Lightweight gloves": 50,
  "Insulated gloves (waterproof)": 150,
  "Sun gloves": 40,
  "Warm hat (covers ears)": 80,
  "Buff / neck gaiter (sun + wind)": 30,
  "Sleep clothes (dry, separate from hike clothes)": 250,

  // Navigation
  "Topographic map": 50,
  "Compass or GPS": 50,
  "Tide chart printout": 10,
  "Phone with offline maps (FarOut/Gaia)": 220,
  "Printed/saved permit": 10,

  // Hydration
  "Water bottles (2–3L total capacity)": 2700, // includes water
  "Extra water capacity (4L+ per person)": 4200,
  "Water filter or chemical treatment": 200,
  "Electrolyte tablets": 30,

  // Food
  "High-calorie snacks (bars, trail mix, jerky)": 500,
  "Lunch + extra meal": 600,
  "Stove + fuel canister": 300,
  "Cookpot + spork": 200,
  "Lightweight bowl / mug": 100,
  "Bear canister or Ursack (where required)": 1100,
  "Bear canister (where required)": 1100,
  "Resupply strategy + maildrops": 0,

  // Safety
  "SPF 30+ sunscreen": 100,
  "First aid kit": 300,
  "Lighter or matches (waterproof)": 30,
  "Emergency shelter (bivvy or space blanket)": 100,
  "Microspikes (snowfields above 10k ft into July)": 400,
  "Microspikes or crampons": 500,
  "Ice axe + microspikes (early season Sierra/Cascades)": 800,
  "Satellite messenger (Garmin inReach / Zoleo)": 100,
  "Bug head net (mosquito season July–Aug)": 30,
  "Insect repellent (mosquitoes near streams)": 80,
  "Tick check awareness (lyme present in CA)": 0,

  // Shelter
  "3-season tent or tarp shelter": 1800,
  "Sleeping bag (rated to expected low + 10°F)": 900,
  "Sleeping pad (R-value matched to season)": 500,

  // Electronics
  "Headlamp + spare batteries": 100,
  "Lightweight battery pack (10000mAh+)": 200,

  // Extras
  "Daypack (15–25L)": 600,
  "Multi-day backpack (50–65L)": 1800,
  "Multi-tool / knife": 90,
  "Trekking poles": 450,
  "Quick-dry towel": 60,
  "Wag bag / trowel for human waste": 80,
  "Pack rain cover": 100,
  "Hand warmers": 30,
};

function needsRemoteEssentials(trail: Trail): boolean {
  if (trail.type !== "day") return true; // any overnight stay
  if (trail.lengthMiles > 10) return true;
  if (trail.elevationGainFt > 5000) return true;
  if (trail.ecosystem === "alpine" || trail.ecosystem === "subalpine" || trail.ecosystem === "volcanic") return true;
  if (trail.difficulty === "extreme") return true;
  return false;
}

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
  const all = Array.from(dedup.values()).map((it) =>
    GEAR_GRAMS[it.name] != null && it.g == null ? { ...it, g: GEAR_GRAMS[it.name] } : it,
  );

  // Upgrade context-dependent items to critical on remote / alpine / long trails
  if (needsRemoteEssentials(trail)) {
    return all.map((it) =>
      REMOTE_ONLY_CRITICAL.has(it.name) ? { ...it, critical: true } : it,
    );
  }
  return all;
}

/** Total gear weight in grams. */
export function totalGrams(items: GearItem[]): number {
  return items.reduce((sum, it) => sum + (it.g ?? 0), 0);
}

export type GearTier = "critical" | "essential" | "optional";

export function getGearTier(item: GearItem): GearTier {
  if (item.critical) return "critical";
  if (item.essential) return "essential";
  return "optional";
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
