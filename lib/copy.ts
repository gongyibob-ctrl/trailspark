// Build a plain-text trail summary that copy-pastes cleanly into Apple Notes
// (which doesn't render Markdown). The output uses Unicode bullets, blank
// lines for sectioning, and emoji headers — all of which Notes preserves.
//
// Pure function so it's easy to unit-test and to reuse for "Share via..." later.

import type { Trail } from "./types";
import type { Locale } from "./i18n";
import {
  formatPickedShort,
  fmtDistance,
  fmtElevation,
  fmtTemp,
  fmtPrecip,
  fmtPoiMiles,
  pickLocalized,
  t as i18nT,
  type StringKey,
} from "./i18n";
import { pickPoiName } from "./poi-icons";
import { TRAILS_ZH } from "./trails-zh";
import { getTrailPOIs } from "./trail-pois";
import { getPermitInfo } from "./permits";
import type { DateNormal } from "./weather";
import type { GearItem } from "./gear";
import { localizeGear } from "./gear-zh";
import type { NearbyFire } from "./wildfire";

export interface CopyContext {
  trail: Trail;
  locale: Locale;
  date: { month: number; day: number };
  dateNormal: DateNormal | null;
  essentialGear: GearItem[];
  fireWarnings: NearbyFire[];
  shareUrl: string;
}

export function formatTrailForCopy(ctx: CopyContext): string {
  const { trail, locale, date, dateNormal, essentialGear, fireWarnings, shareUrl } = ctx;
  const zh = TRAILS_ZH[trail.id];
  const t = (k: StringKey, vars?: Record<string, string | number>) => i18nT(k, locale, vars);

  const parkUnit = pickLocalized(locale, zh?.parkUnit, trail.parkUnit);
  const description = pickLocalized(locale, zh?.description, trail.description);
  const highlights = pickLocalized(locale, zh?.highlights, trail.highlights);

  const out: string[] = [];

  // ---- Header ----
  out.push(`🥾 ${trail.name}`);
  out.push(
    `${parkUnit} · ${t(`difficulty.${trail.difficulty}` as StringKey)} · ${t(`type.${trail.type}` as StringKey)}`,
  );
  out.push("");

  // ---- Stats ----
  out.push(
    `📏 ${fmtDistance(trail.lengthMiles, locale)} · ⛰ ${fmtElevation(trail.elevationGainFt, locale)} · ${trail.state}`,
  );
  if (trail.permitRequired) out.push(`🎫 ${t("detail.permitRequired")}`);
  out.push("");

  // ---- Description ----
  out.push(description);
  out.push("");

  // ---- Weather (chosen date) ----
  out.push(`📅 ${t("offline.weatherSection", { date: formatPickedShort(date, locale) })}`);
  if (dateNormal) {
    out.push(
      `   ${fmtTemp(dateNormal.avgHighF, locale)} / ${fmtTemp(dateNormal.avgLowF, locale)}  (${t("weather.avgHighLow", { n: dateNormal.years })})`,
    );
    if (dateNormal.precipInches > 0) {
      out.push(`   ${t("weather.precipAvg", { v: fmtPrecip(dateNormal.precipInches, locale) })}`);
    }
    if (dateNormal.snowLikely) out.push(`   ❄️  ${t("weather.snowLikely")}`);
  } else {
    out.push("   (data unavailable / 数据不可用)");
  }
  out.push("");

  // ---- Highlights ----
  if (highlights.length > 0) {
    out.push(`🎯 ${t("section.highlights")}`);
    highlights.forEach((h) => out.push(`   • ${h}`));
    out.push("");
  }

  // ---- POIs along the way ----
  const pois = getTrailPOIs(trail.id);
  if (pois.length > 0) {
    out.push(`🌲 ${t("offline.poisSection")}`);
    for (const p of pois) {
      const parts: string[] = [];
      if (p.m != null) {
        parts.push(p.m === 0 ? t("poi.atTrailhead") : fmtPoiMiles(p.m, locale));
      }
      parts.push(pickPoiName(p, locale));
      if (p.ft != null) parts.push(`(${fmtElevation(p.ft, locale)})`);
      out.push(`   • ${parts.join("  ")}`);
    }
    out.push("");
  }

  // ---- Permit ----
  const permit = trail.permitRequired ? getPermitInfo(trail.id) : null;
  if (permit) {
    out.push(`🎫 ${t("offline.permitSection")} — ${permit.authority[locale]}`);
    out.push(`   ${permit.window[locale]}`);
    out.push(`   ${permit.url}`);
    out.push("");
  }

  // ---- Gear: critical first (⚠ symbols stay in plain text), then essentials ----
  if (essentialGear.length > 0) {
    const critical = essentialGear.filter((g) => g.critical);
    const others = essentialGear.filter((g) => !g.critical);
    out.push(`🎒 ${t("offline.gearSection")}`);
    if (critical.length > 0) {
      critical.forEach((g) => out.push(`   ⚠ ${localizeGear(g, locale).name}`));
    }
    others.forEach((g) => out.push(`   • ${localizeGear(g, locale).name}`));
    out.push("");
  }

  // ---- Wildfire warnings ----
  if (fireWarnings.length > 0) {
    out.push(`🔥 ${t("offline.fireSection")}`);
    fireWarnings.forEach((f) =>
      out.push(`   • ${f.fire.name}  (${f.distanceKm} km, ${f.fire.contained}% contained)`),
    );
    out.push("");
  }

  // ---- Coordinates (CRITICAL for offline navigation) ----
  out.push(`📍 ${trail.trailhead.lat.toFixed(5)}, ${trail.trailhead.lng.toFixed(5)}`);
  out.push("");

  // ---- Source ----
  out.push("———");
  out.push(t("offline.source", { url: shareUrl }));

  return out.join("\n");
}
