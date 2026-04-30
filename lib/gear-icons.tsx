import {
  Footprints,
  Shirt,
  Compass,
  Map as MapIcon,
  TicketCheck,
  Droplet,
  Droplets,
  Filter,
  Pill,
  Cookie,
  Sandwich,
  Flame,
  Utensils,
  Box,
  Package,
  HeartPulse,
  Tent,
  Bed,
  Layers,
  Lightbulb,
  Battery,
  Smartphone,
  Backpack,
  Wrench,
  Sun,
  Hand,
  Snowflake,
  Wind,
  Bug,
  Satellite,
  Mountain,
  Waves,
  Glasses,
  Trash2,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { GearCategory } from "./gear";

export const CATEGORY_ICON: Record<GearCategory, LucideIcon> = {
  footwear: Footprints,
  clothing: Shirt,
  navigation: Compass,
  hydration: Droplets,
  food: Utensils,
  safety: Shield,
  shelter: Tent,
  electronics: Battery,
  extras: Backpack,
};

// Keyword → icon. Earlier rules win; default falls back to the category icon.
const RULES: Array<[RegExp, LucideIcon]> = [
  // Footwear
  [/(hiking )?boot|mid-cut|hikers/i, Footprints],
  [/sandal|wading shoe|camp shoe|trail runner/i, Footprints],
  [/foam clog/i, Footprints],
  [/gaiter/i, Footprints],

  // Clothing
  [/sun hat|wide-brim/i, Sun],
  [/sun hoody|long-sleeve.*UPF|UPF/i, Shirt],
  [/buff|neck gaiter|warm hat|beanie/i, Wind],
  [/glove/i, Hand],
  [/rain jacket|hardshell|rain shell/i, Wind],
  [/rain pants/i, Wind],
  [/puffy|down|insulating|insulator|midlayer|fleece/i, Layers],
  [/wind shell|wind-/i, Wind],
  [/sleep clothes/i, Bed],
  [/sunglasses/i, Glasses],
  [/shirt|hoody|moisture-wicking/i, Shirt],
  [/short|pants|convertible/i, Shirt],

  // Navigation
  [/topographic|map\b/i, MapIcon],
  [/compass|gps/i, Compass],
  [/permit/i, TicketCheck],
  [/offline maps|FarOut|Gaia/i, Smartphone],

  // Hydration
  [/water bottle|water capacity|extra water|hydration/i, Droplet],
  [/water filter|chemical treatment/i, Filter],
  [/electrolyte/i, Pill],

  // Food
  [/snack|bar|trail mix|jerky/i, Cookie],
  [/lunch|extra meal/i, Sandwich],
  [/stove|fuel/i, Flame],
  [/cookpot|pot|bowl|mug|spork/i, Utensils],
  [/bear canister|ursack/i, Box],
  [/resupply|maildrop/i, Package],

  // Safety
  [/first aid/i, HeartPulse],
  [/lighter|matches/i, Flame],
  [/emergency shelter|bivvy|space blanket/i, Tent],
  [/microspike|crampon|ice axe/i, Snowflake],
  [/satellite messenger|inReach|Garmin|Zoleo/i, Satellite],
  [/sunscreen|SPF/i, Sun],
  [/bug head net|repellent|insect/i, Bug],
  [/tide chart/i, Waves],
  [/hand warmer/i, Flame],
  [/tick check/i, Bug],

  // Shelter
  [/tent|tarp shelter/i, Tent],
  [/sleeping bag/i, Bed],
  [/sleeping pad/i, Layers],

  // Electronics
  [/headlamp|spare batteries/i, Lightbulb],
  [/battery pack|power bank/i, Battery],
  [/phone/i, Smartphone],

  // Extras
  [/daypack|backpack/i, Backpack],
  [/multi-tool|knife/i, Wrench],
  [/trekking pole|pole/i, Mountain],
  [/quick-dry towel|towel/i, Wind],
  [/wag bag|trowel|human waste/i, Trash2],
];

export function iconForGear(name: string, category: GearCategory): LucideIcon {
  for (const [re, icon] of RULES) if (re.test(name)) return icon;
  return CATEGORY_ICON[category];
}
