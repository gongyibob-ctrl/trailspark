"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  ExternalLink,
  Mountain,
  Ruler,
  TrendingUp,
  TicketCheck,
  MapPin,
  Snowflake,
  Droplets,
  Thermometer,
  Sparkles,
  Heart,
  Link2,
  Check,
  Flame,
  ClipboardCopy,
} from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import type { Season, Trail } from "@/lib/types";
import { DIFFICULTY_COLOR, POPULARITY_COLOR } from "@/lib/types";
import { useLocale, formatPickedShort, pickLocalized, type StringKey } from "@/lib/i18n";
import { getTrailPOIs, type POI } from "@/lib/trail-pois";
import { POI_ICON, POI_TONE } from "@/lib/poi-icons";
import { TRAILS_ZH } from "@/lib/trails-zh";
import {
  fetchTrailArchive,
  fetchForecast,
  monthlyNormals,
  normalForDate,
  type RawDaily,
  type ForecastDay,
  MONTH_NAMES,
  weatherEmoji,
  weatherLabel,
} from "@/lib/weather";
import { fetchActiveFires, nearbyFires, type NearbyFire } from "@/lib/wildfire";
import { getPermitInfo } from "@/lib/permits";
import { formatTrailForCopy } from "@/lib/copy";
import {
  bestMonths as computeBestMonths,
  initialDateForBestSeasons,
  seasonForDate,
  type PickedDate,
} from "@/lib/dates";
import DatePicker from "./DatePicker";
import ElevationProfile from "./ElevationProfile";
import { recommendGear, groupByCategory, totalGrams, CATEGORY_LABEL, type GearCategory } from "@/lib/gear";
import { CATEGORY_ICON, iconForGear } from "@/lib/gear-icons";
import { localizeGear } from "@/lib/gear-zh";
import { usePackedGear } from "@/lib/packed";
import clsx from "clsx";

interface TrailDetailProps {
  trail: Trail | null;
  onClose: () => void;
}

export default function TrailDetail({ trail, onClose }: TrailDetailProps) {
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { locale, t, fmtDistance, fmtElevation, fmtTemp, fmtPrecip, fmtWind, fmtWeight, tempValue } = useLocale();
  const [date, setDate] = useState<PickedDate>(() =>
    trail ? initialDateForBestSeasons(trail.bestSeasons) : { month: 7, day: 15 },
  );
  const [archive, setArchive] = useState<RawDaily | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [fireWarnings, setFireWarnings] = useState<NearbyFire[]>([]);

  // Track if user has manually changed date for the current trail — if not, reset on trail switch
  const userEditedRef = useRef(false);

  useEffect(() => {
    if (!trail) return;
    if (!userEditedRef.current) {
      setDate(initialDateForBestSeasons(trail.bestSeasons));
    }
    userEditedRef.current = false;
    setArchive(null);
    setForecast(null);
    setWeatherError(null);
  }, [trail?.id]);

  // Check for nearby active wildfires whenever the trail changes
  useEffect(() => {
    if (!trail) return;
    const ac = new AbortController();
    fetchActiveFires()
      .then((fc) => {
        if (ac.signal.aborted) return;
        const list = nearbyFires(fc, [trail.trailhead.lng, trail.trailhead.lat], 50);
        setFireWarnings(list.slice(0, 3));
      })
      .catch(() => {
        if (!ac.signal.aborted) setFireWarnings([]);
      });
    return () => ac.abort();
  }, [trail?.id]);

  useEffect(() => {
    if (!trail) return;
    const ac = new AbortController();
    setWeatherLoading(true);
    setWeatherError(null);
    Promise.all([
      fetchTrailArchive(trail.trailhead.lat, trail.trailhead.lng),
      fetchForecast(trail.trailhead.lat, trail.trailhead.lng),
    ])
      .then(([a, f]) => {
        if (ac.signal.aborted) return;
        setArchive(a);
        setForecast(f);
      })
      .catch((e) => {
        if (!ac.signal.aborted) setWeatherError(e?.message ?? "Weather fetch failed");
      })
      .finally(() => {
        if (!ac.signal.aborted) setWeatherLoading(false);
      });
    return () => ac.abort();
  }, [trail?.id]);

  const handleDateChange = (next: PickedDate) => {
    userEditedRef.current = true;
    setDate(next);
  };

  const season: Season = useMemo(() => seasonForDate(date), [date]);
  const monthly = useMemo(() => (archive ? monthlyNormals(archive) : null), [archive]);
  const dateNormal = useMemo(
    () => (archive ? normalForDate(archive, date.month, date.day) : null),
    [archive, date],
  );
  const bestMonthsSet = useMemo(
    () => (trail ? computeBestMonths(trail.bestSeasons) : new Set<number>()),
    [trail],
  );
  const gearItems = useMemo(
    () => (trail ? recommendGear(trail, season) : []),
    [trail, season],
  );
  const gear = useMemo(() => groupByCategory(gearItems), [gearItems]);
  const essentialGear = useMemo(() => gearItems.filter((g) => g.essential), [gearItems]);

  if (!trail) return null;

  const diffColor = DIFFICULTY_COLOR[trail.difficulty];
  const zh = TRAILS_ZH[trail.id];
  const trailDescription = pickLocalized(locale, zh?.description, trail.description);
  const trailHighlights = pickLocalized(locale, zh?.highlights, trail.highlights);
  const trailParkUnit = pickLocalized(locale, zh?.parkUnit, trail.parkUnit);

  return (
    <aside
      key={trail.id}
      className="absolute right-0 top-0 z-30 flex h-full w-[460px] animate-slide-in-right flex-col glass"
    >
      {/* Header */}
      <div className="relative px-5 pb-4 pt-5">
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <CopyOfflineButton
            trail={trail}
            date={date}
            dateNormal={dateNormal}
            essentialGear={essentialGear}
            fireWarnings={fireWarnings}
          />
          <ShareButton trailId={trail.id} />
          <button
            onClick={() => toggleFavorite(trail.id)}
            aria-label={favorites.has(trail.id) ? t("detail.aria.favoriteRemove") : t("detail.aria.favoriteSave")}
            className="rounded-full p-1.5 text-white/55 transition hover:scale-110 hover:bg-white/10 hover:text-white"
          >
            <Heart
              className={clsx(
                "h-4 w-4 transition-all",
                favorites.has(trail.id) && "fill-rose-400 text-rose-400 scale-110",
              )}
              strokeWidth={2}
            />
          </button>
          <button
            onClick={onClose}
            aria-label={t("detail.aria.close")}
            className="rounded-full p-1.5 text-white/55 transition hover:rotate-90 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: diffColor }} />
          <span className="text-[11px] uppercase tracking-[0.16em] text-white/55">
            {trailParkUnit}
          </span>
        </div>
        <h2 className="font-display text-2xl leading-tight text-white">{trail.name}</h2>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge className={`diff-${trail.difficulty}`}>{t(`difficulty.${trail.difficulty}` as StringKey)}</Badge>
          <Badge className="border-white/15 bg-white/5 text-white/80">
            {t(`type.${trail.type}` as StringKey)}
          </Badge>
          <Badge className="border-white/15 bg-white/5 text-white/80">
            {t(`ecosystem.${trail.ecosystem}` as StringKey)}
          </Badge>
          <span
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
            style={{
              color: POPULARITY_COLOR[trail.popularity],
              backgroundColor: `${POPULARITY_COLOR[trail.popularity]}1c`,
              borderColor: `${POPULARITY_COLOR[trail.popularity]}55`,
            }}
            title={t(`popularity.${trail.popularity}.desc` as StringKey)}
          >
            {t(`popularity.${trail.popularity}` as StringKey)}
          </span>
          {trail.permitRequired && (
            <Badge className="border-ember-500/30 bg-ember-500/15 text-ember-400">
              <TicketCheck className="mr-1 inline h-3 w-3" />
              {t("detail.permitRequired")}
            </Badge>
          )}
        </div>
      </div>

      {/* Content scroll */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6 pt-2">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 [&>*]:animate-rise" style={stagger(0)}>
          <Stat icon={<Ruler className="h-3.5 w-3.5" />} label={t("stats.length")} value={fmtDistance(trail.lengthMiles)} />
          <Stat
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label={t("stats.gain")}
            value={fmtElevation(trail.elevationGainFt)}
          />
          <Stat icon={<Mountain className="h-3.5 w-3.5" />} label={t("stats.state")} value={trail.state} />
        </div>

        {/* Wildfire warning — only when fires are nearby */}
        {fireWarnings.length > 0 && <FireWarning fires={fireWarnings} />}

        {/* Backcountry advisory — friendly, not alarmist */}
        {trail.popularity === "backcountry" && <BackcountryTip />}

        {/* Description */}
        <Section title={t("section.about")} accent="neutral" delay={1}>
          <p className="text-[13.5px] leading-relaxed text-white/80">{trailDescription}</p>
        </Section>

        {/* Permit info — only when this trail needs a permit */}
        {trail.permitRequired && getPermitInfo(trail.id) && (
          <PermitInfoCard trailId={trail.id} />
        )}

        {/* Elevation profile */}
        <Section title={t("section.elevation")} accent="forest" delay={2}>
          <ElevationProfile trailId={trail.id} />
        </Section>

        {/* Along the way — POIs ordered by distance from trailhead */}
        {getTrailPOIs(trail.id).length > 0 && (
          <Section title={t("section.alongWay")} accent="forest" delay={3}>
            <AlongTheWay pois={getTrailPOIs(trail.id)} />
          </Section>
        )}

        {/* Highlights */}
        <Section title={t("section.highlights")} accent="ember" delay={3.5}>
          <ul className="space-y-1.5">
            {trailHighlights.map((h, i) => (
              <li
                key={h}
                className="flex animate-rise items-start gap-2 text-[13px] text-white/75"
                style={{ animationDelay: `${0.18 + i * 0.05}s` }}
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-forest-300" />
                {h}
              </li>
            ))}
          </ul>
        </Section>

        {/* Best season hint */}
        <Section
          title={t("section.bestTime")}
          accent="forest"
          delay={4}
          right={
            <BestSeasonsLine seasons={trail.bestSeasons} />
          }
        >
          <DatePicker value={date} onChange={handleDateChange} bestMonths={bestMonthsSet} />
        </Section>

        {/* Weather for the picked date */}
        <Section
          title={t("section.weatherAround", { date: formatPickedShort(date, locale) })}
          accent="blue"
          delay={5}
          right={
            <a
              href={`https://open-meteo.com/?latitude=${trail.trailhead.lat}&longitude=${trail.trailhead.lng}`}
              target="_blank"
              rel="noopener"
              className="text-[11px] text-white/45 hover:text-white/80"
            >
              Open-Meteo
            </a>
          }
        >
          {weatherLoading && <WeatherSkeleton />}
          {weatherError && (
            <div className="rounded-md bg-red-500/10 p-3 text-[12px] text-red-300">
              {t("weather.error", { err: weatherError })}
            </div>
          )}
          {dateNormal && <DateWeatherCard normal={dateNormal} />}
          {monthly && <ClimateChart normals={monthly} highlightMonth={date.month} />}
          {forecast && <Forecast days={forecast} />}
        </Section>

        {/* Gear */}
        <GearSection
          trailId={trail.id}
          gear={gear}
          gearItems={gearItems}
          season={season}
          type={trail.type}
        />

        {trail.externalUrl && (
          <a
            href={trail.externalUrl}
            target="_blank"
            rel="noopener"
            className="group flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition hover:border-forest-400/40 hover:bg-forest-500/15 hover:text-white"
          >
            {t("gear.officialLink")}
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}

        <div className="flex items-center gap-2 text-[11px] text-white/40">
          <MapPin className="h-3 w-3" />
          {t("gear.trailhead", { coords: `${trail.trailhead.lat.toFixed(4)}, ${trail.trailhead.lng.toFixed(4)}` })}
        </div>
      </div>
    </aside>
  );
}

function stagger(i: number): React.CSSProperties {
  // applies the same delay to all immediate children using the [&>*] arbitrary selector
  return { ["--stagger" as any]: `${0.1 + i * 0.06}s`, animationDelay: `${0.08 + i * 0.06}s` };
}

type SectionAccent = "neutral" | "forest" | "ember" | "blue";

const ACCENT_BAR: Record<SectionAccent, string> = {
  neutral: "bg-white/40",
  forest: "bg-forest-300",
  ember: "bg-ember-400",
  blue: "bg-blue-400",
};

function Section({
  title,
  accent = "neutral",
  right,
  children,
  delay = 0,
  flush = false,
}: {
  title: string;
  accent?: SectionAccent;
  right?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  /** When true, content has its own padding (chart fills card) — section adds none. */
  flush?: boolean;
}) {
  return (
    <section
      className="animate-rise rounded-xl bg-white/[0.03] ring-1 ring-white/10"
      style={{ animationDelay: `${0.08 + delay * 0.07}s` }}
    >
      <header className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
        <h3 className="flex items-center gap-2 text-[13.5px] font-semibold tracking-tight text-white">
          <span className={`h-3.5 w-[3px] rounded-full ${ACCENT_BAR[accent]}`} />
          {title}
        </h3>
        {right && <div className="shrink-0">{right}</div>}
      </header>
      <div className={flush ? "" : "px-4 pb-4"}>{children}</div>
    </section>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/30 px-3.5 py-2.5 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/55">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[16px] font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}

function BestSeasonsLine({ seasons }: { seasons: Season[] }) {
  const { t } = useLocale();
  const label = seasons.map((s) => t(`season.${s}` as StringKey)).join(" · ");
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-forest-500/15 px-2 py-0.5 text-[10px] text-forest-200">
      <Sparkles className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

function DateWeatherCard({ normal }: { normal: ReturnType<typeof normalForDate> }) {
  const { t, fmtTemp, fmtPrecip, tempValue } = useLocale();
  const highSpread = normal.rangeHighF[1] - normal.rangeHighF[0];
  return (
    <div
      key={`${normal.month}-${normal.day}`}
      className="animate-rise rounded-lg bg-black/25 p-4 ring-1 ring-white/8"
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl leading-none text-white">
              {fmtTemp(normal.avgHighF)}
            </span>
            <span className="text-base text-white/40">/</span>
            <span className="text-xl text-white/65">{fmtTemp(normal.avgLowF)}</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-white/45">
            {t("weather.avgHighLow", { n: normal.years })}
          </div>
        </div>
        {normal.snowLikely && (
          <div className="flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-[11px] text-blue-200 ring-1 ring-blue-400/20">
            <Snowflake className="h-3 w-3" />
            {t("weather.snowLikely")}
          </div>
        )}
      </div>

      {/* Range bar */}
      <div className="mt-3 space-y-2">
        <RangeBar
          label={t("weather.high")}
          range={normal.rangeHighF}
          avg={normal.avgHighF}
          color="from-ember-400 to-ember-600"
        />
        <RangeBar
          label={t("weather.low")}
          range={normal.rangeLowF}
          avg={normal.avgLowF}
          color="from-blue-300 to-blue-500"
        />
      </div>

      <div className="mt-3 flex gap-2 border-t border-white/8 pt-3 text-[11px] text-white/65">
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-blue-300" />
          {t("weather.precipAvg", { v: fmtPrecip(normal.precipInches) })}
        </div>
        <div className="text-white/30">·</div>
        <div className="text-white/55">
          {t("weather.precipDays", { a: normal.precipDays, b: normal.years })}
        </div>
      </div>
      {Math.abs(highSpread) > 25 && (
        <div className="mt-2 flex items-start gap-1 text-[10.5px] text-white/45">
          <Thermometer className="mt-px h-3 w-3" />
          <span>
            {t("weather.variability", { v: Math.abs(tempValue(normal.rangeHighF[1]) - tempValue(normal.rangeHighF[0])) })}
          </span>
        </div>
      )}
    </div>
  );
}

function RangeBar({
  label,
  range,
  avg,
  color,
}: {
  label: string;
  range: [number, number];
  avg: number;
  color: string;
}) {
  const { tempValue, locale } = useLocale();
  const lo = range[0];
  const hi = range[1];
  // Anchor the bar within a fixed temp window for visual stability
  const VIEW_MIN = -20;
  const VIEW_MAX = 110;
  const span = VIEW_MAX - VIEW_MIN;
  const left = ((lo - VIEW_MIN) / span) * 100;
  const width = ((hi - lo) / span) * 100;
  const avgPos = ((avg - VIEW_MIN) / span) * 100;
  const unit = locale === "zh" ? "°C" : "°F";
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-[10px] text-white/45">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="font-mono text-white/65">
          {tempValue(lo)}° – {tempValue(hi)}{unit}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={clsx("absolute top-0 h-full rounded-full bg-gradient-to-r", color)}
          style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-white shadow-[0_0_4px_white]"
          style={{ left: `${avgPos}%` }}
        />
      </div>
    </div>
  );
}

function ClimateChart({
  normals,
  highlightMonth,
}: {
  normals: ReturnType<typeof monthlyNormals>;
  highlightMonth: number;
}) {
  const { t, tempValue, locale } = useLocale();
  const monthLabel = (m: number) => t(`monthShort.${m}` as StringKey);
  const allTemps = normals.flatMap((n) => [n.tempMaxF, n.tempMinF]);
  const rawMin = Math.min(...allTemps);
  const rawMax = Math.max(...allTemps);
  // Pad y range slightly so curves don't sit on the edges
  const pad = Math.max(4, Math.round((rawMax - rawMin) * 0.12));
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;
  const range = Math.max(yMax - yMin, 10);

  // SVG layout
  const W = 400;
  const H = 110;
  const PADX = 8;
  const innerW = W - PADX * 2;
  const months = normals.length;
  const xAt = (i: number) => PADX + ((i + 0.5) / months) * innerW;
  const yAt = (t: number) => ((yMax - t) / range) * H;

  // Smooth-ish polyline points (catmull-rom-ish via cardinal-style segments would be nicer,
  // but plain polylines look fine at this resolution)
  const highPts = normals.map((n, i) => `${xAt(i)},${yAt(n.tempMaxF)}`).join(" ");
  const lowPts = normals.map((n, i) => `${xAt(i)},${yAt(n.tempMinF)}`).join(" ");
  // Filled band between high and low (closed path)
  const bandPath = [
    `M ${normals.map((n, i) => `${xAt(i)},${yAt(n.tempMaxF)}`).join(" L ")}`,
    `L ${[...normals]
      .map((_, i) => normals.length - 1 - i)
      .map((i) => `${xAt(i)},${yAt(normals[i].tempMinF)}`)
      .join(" L ")} Z`,
  ].join(" ");

  // Y-axis ticks (3 lines: hot, mid, cold)
  const niceTick = (t: number) => Math.round(t / 10) * 10;
  const ticks = [niceTick(rawMax), niceTick((rawMax + rawMin) / 2), niceTick(rawMin)];

  const sel = normals[highlightMonth - 1];
  const selX = xAt(highlightMonth - 1);

  return (
    <div className="mt-3 overflow-hidden rounded-lg bg-black/20 p-3 ring-1 ring-white/6">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-white/40">
        <span className="truncate">{t("weather.yearRound")}</span>
        <span className="shrink-0 whitespace-nowrap">
          {tempValue(rawMin)}° – {tempValue(rawMax)}°
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="110"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tempBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ee7e3e" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#739a7e" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.30" />
            </linearGradient>
            <linearGradient id="highStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e6b" />
              <stop offset="100%" stopColor="#ee7e3e" />
            </linearGradient>
            <linearGradient id="lowStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7fb6ff" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* y-axis dotted gridlines (label sits inside the chart, right-aligned) */}
          {ticks.map((tickF) => (
            <g key={tickF}>
              <line
                x1={PADX}
                x2={W - PADX}
                y1={yAt(tickF)}
                y2={yAt(tickF)}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="2 4"
              />
              <text
                x={W - PADX - 2}
                y={yAt(tickF) - 2}
                fontSize="9"
                fill="rgba(255,255,255,0.4)"
                textAnchor="end"
              >
                {tempValue(tickF)}°
              </text>
            </g>
          ))}

          {/* selected-month vertical highlight */}
          <rect
            x={selX - innerW / months / 2}
            y={0}
            width={innerW / months}
            height={H}
            fill="rgba(255,255,255,0.06)"
          />
          <line
            x1={selX}
            x2={selX}
            y1={0}
            y2={H}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1}
            strokeDasharray="2 3"
          />

          {/* filled band */}
          <path d={bandPath} fill="url(#tempBand)" />

          {/* high & low curves */}
          <polyline
            points={highPts}
            fill="none"
            stroke="url(#highStroke)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={lowPts}
            fill="none"
            stroke="url(#lowStroke)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* selected-month dots + labels (clamped so they never bleed off the chart) */}
          {(() => {
            const labelX = Math.min(Math.max(selX, PADX + 14), W - PADX - 14);
            return (
              <>
                <circle cx={selX} cy={yAt(sel.tempMaxF)} r="3.5" fill="#ee7e3e" stroke="#fff" strokeWidth="1.2" />
                <circle cx={selX} cy={yAt(sel.tempMinF)} r="3.5" fill="#3b82f6" stroke="#fff" strokeWidth="1.2" />
                <text
                  x={labelX}
                  y={Math.max(yAt(sel.tempMaxF) - 6, 11)}
                  fontSize="10"
                  fontWeight="600"
                  fill="#ffd6b8"
                  textAnchor="middle"
                >
                  {tempValue(sel.tempMaxF)}°
                </text>
                <text
                  x={labelX}
                  y={Math.min(yAt(sel.tempMinF) + 13, H - 2)}
                  fontSize="10"
                  fontWeight="600"
                  fill="#bdd6ff"
                  textAnchor="middle"
                >
                  {tempValue(sel.tempMinF)}°
                </text>
              </>
            );
          })()}
        </svg>

        {/* x-axis month labels */}
        <div className="mt-1 grid grid-cols-12 gap-0 px-2 text-center">
          {normals.map((n) => (
            <div
              key={n.month}
              className={clsx(
                "text-[9px] transition-colors",
                n.month === highlightMonth ? "font-semibold text-white" : "text-white/55",
              )}
            >
              {monthLabel(n.month)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Forecast({ days }: { days: ForecastDay[] }) {
  const { t, locale, tempValue, fmtWind } = useLocale();
  return (
    <div className="mt-3 rounded-lg bg-black/20 p-3 ring-1 ring-white/6">
      <div className="mb-2 text-[10px] uppercase tracking-wider text-white/40">
        {t("weather.forecastTitle")}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const dt = new Date(d.date);
          const wd = dt.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { weekday: "short" });
          return (
            <div
              key={d.date}
              title={t("weather.tooltipWind", { label: weatherLabel(d.weatherCode), wind: fmtWind(d.windMph) })}
              className="flex animate-rise flex-col items-center rounded-md bg-black/20 px-1 py-2 transition-colors hover:bg-black/30"
              style={{ animationDelay: `${0.45 + i * 0.04}s` }}
            >
              <div className="text-[10px] text-white/55">{wd}</div>
              <div className="my-0.5 text-base">{weatherEmoji(d.weatherCode)}</div>
              <div className="text-[11px] font-semibold text-white">{tempValue(d.tempMaxF)}°</div>
              <div className="text-[10px] text-white/50">{tempValue(d.tempMinF)}°</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-32 animate-pulse rounded-xl bg-white/5" />
      <div className="h-20 animate-pulse rounded-lg bg-white/5" />
    </div>
  );
}

interface RidbDetails {
  id: string;
  name: string;
  description: string | null;
  importantInfo: string | null;
  parking: string | null;
  directions: string | null;
  url: string | null;
  lastUpdated: string | null;
}

const DEMAND_TONE: Record<string, string> = {
  low: "text-emerald-300 bg-emerald-500/15 ring-emerald-400/30",
  moderate: "text-amber-200 bg-amber-500/15 ring-amber-400/30",
  high: "text-orange-200 bg-orange-500/15 ring-orange-400/30",
  lottery: "text-red-200 bg-red-500/15 ring-red-400/30",
};

function AlongTheWay({ pois }: { pois: POI[] }) {
  const { locale, t, fmtDistance, fmtElevation } = useLocale();
  return (
    <ul className="space-y-1.5">
      {pois.map((p, i) => {
        const Icon = POI_ICON[p.type];
        const tone = POI_TONE[p.type];
        const name = locale === "zh" && p.nameZh ? p.nameZh : p.name;
        const distance = p.m == null
          ? null
          : p.m === 0
            ? t("poi.atTrailhead")
            : t("poi.miMark", { m: locale === "zh" ? (p.m * 1.60934).toFixed(1) : p.m });
        return (
          <li
            key={i}
            className="flex items-start gap-2.5 rounded-md px-1 py-0.5 text-[12.5px] transition-colors hover:bg-white/5"
          >
            <span
              className={clsx(
                "mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1",
                tone,
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 text-white/85">
                <span className="truncate">{name}</span>
                {p.ft != null && (
                  <span className="shrink-0 font-mono text-[10.5px] text-white/45">
                    {fmtElevation(p.ft)}
                  </span>
                )}
              </div>
              {distance && (
                <div className="text-[10.5px] text-white/45">{distance}</div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function PermitInfoCard({ trailId }: { trailId: string }) {
  const { t, locale } = useLocale();
  const info = getPermitInfo(trailId);
  const [details, setDetails] = useState<RidbDetails | null>(null);
  const [showFull, setShowFull] = useState(false);

  // Fetch RIDB enriched data on mount (English only — RIDB is American gov data)
  useEffect(() => {
    setDetails(null);
    setShowFull(false);
    if (!info?.ridbId) return;
    const ac = new AbortController();
    fetch(`/api/permit/${info.ridbId}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!ac.signal.aborted && d && !d.error) setDetails(d);
      })
      .catch(() => {
        // includes AbortError on trail switch — silent
      });
    return () => ac.abort();
  }, [info?.ridbId]);

  if (!info) return null;
  const demandKey = `permit.demand.${info.demand}` as StringKey;
  const demandTone = DEMAND_TONE[info.demand];

  // Truncate official notes for collapsed state. RIDB notes only available in English.
  const officialNotes = locale === "en" ? details?.importantInfo : null;
  const COLLAPSED_LEN = 240;
  const needsTruncate = officialNotes && officialNotes.length > COLLAPSED_LEN;
  const displayedNotes = needsTruncate && !showFull
    ? officialNotes!.slice(0, COLLAPSED_LEN).replace(/\s+\S*$/, "") + "…"
    : officialNotes;

  return (
    <Section title={t("permit.heading")} accent="ember" delay={1.5}>
      <div className="space-y-2.5">
        <Row label={t("permit.authority")}>
          <span className="text-white/85">{info.authority[locale]}</span>
        </Row>
        <Row label={t("permit.window")}>
          <span className="text-white/85 leading-snug">{info.window[locale]}</span>
        </Row>
        <Row label={t("permit.demand")}>
          <span className={clsx("rounded-full px-2 py-0.5 text-[11px] ring-1", demandTone)}>
            {t(demandKey)}
          </span>
        </Row>
        <a
          href={info.url}
          target="_blank"
          rel="noopener"
          className="group mt-2 flex items-center justify-center gap-2 rounded-lg bg-ember-500/15 px-4 py-2.5 text-[13px] font-medium text-ember-200 ring-1 ring-ember-400/40 transition hover:bg-ember-500/25 hover:text-white"
        >
          <TicketCheck className="h-4 w-4" />
          {t("permit.applyButton")}
          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        {officialNotes && (
          <div className="mt-3 rounded-lg bg-black/20 p-3 ring-1 ring-white/6">
            <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/45">
              <span>{t("permit.officialNotes")}</span>
              {details?.lastUpdated && (
                <span className="text-white/35">
                  {t("permit.lastUpdated", { date: details.lastUpdated })}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-[12px] leading-relaxed text-white/75">
              {displayedNotes}
            </p>
            {needsTruncate && (
              <button
                onClick={() => setShowFull((v) => !v)}
                className="mt-1.5 text-[11px] text-ember-300/85 hover:text-ember-200"
              >
                {showFull ? t("permit.showLess") : t("permit.showMore")}
              </button>
            )}
            <div className="mt-2 text-[10px] text-white/30">{t("permit.dataSource")}</div>
          </div>
        )}
      </div>
    </Section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-[12px]">
      <span className="w-20 shrink-0 text-[10px] uppercase tracking-wider text-white/45">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function BackcountryTip() {
  const { t } = useLocale();
  return (
    <div className="animate-rise rounded-xl bg-violet-500/8 px-4 py-2.5 ring-1 ring-violet-400/25">
      <div className="flex items-start gap-2.5 text-[12px]">
        <span className="mt-0.5 text-base leading-none">🏔</span>
        <div>
          <div className="font-medium text-violet-200">
            {t("popularity.backcountry.desc")}
          </div>
          <div className="mt-0.5 text-[11.5px] leading-relaxed text-white/65">
            {t("popularity.backcountry.tip")}
          </div>
        </div>
      </div>
    </div>
  );
}

function FireWarning({ fires }: { fires: NearbyFire[] }) {
  const { t } = useLocale();
  const closest = fires[0];
  return (
    <div className="animate-rise overflow-hidden rounded-xl bg-gradient-to-br from-red-500/15 via-red-500/5 to-transparent ring-1 ring-red-400/40">
      <div className="flex items-start gap-2.5 px-4 pt-3 pb-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-500/20 ring-1 ring-red-400/40">
          <Flame className="h-4 w-4 text-red-300" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-red-200">{t("fire.title")}</div>
          <ul className="mt-1.5 space-y-1 text-[12px] text-red-100/85">
            {fires.map((f) => (
              <li key={f.fire.id} className="flex items-baseline justify-between gap-2">
                <span className="truncate">
                  <span className="font-medium text-red-100">{f.fire.name}</span>
                  <span className="text-red-100/60"> · {f.distanceKm} km · {f.fire.contained}% contained</span>
                </span>
                <span className="shrink-0 font-mono text-[10.5px] text-red-200/65">
                  {f.fire.acres.toLocaleString()} ac
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-[10.5px] text-red-200/55">
            {t("fire.checkBefore")} · {t("fire.dataSource")}
          </div>
        </div>
      </div>
    </div>
  );
}

function GearSection({
  trailId,
  gear,
  gearItems,
  season,
  type,
}: {
  trailId: string;
  gear: Record<GearCategory, ReturnType<typeof recommendGear>>;
  gearItems: ReturnType<typeof recommendGear>;
  season: Season;
  type: Trail["type"];
}) {
  const { t, locale, fmtWeight, fmtWeightShort } = useLocale();
  const { packed, toggle, clearAll } = usePackedGear(trailId);
  const [copiedList, setCopiedList] = useState(false);

  const total = totalGrams(gearItems);
  const packedTotal = gearItems.reduce(
    (sum, it) => sum + (packed.has(it.name) ? it.g ?? 0 : 0),
    0,
  );

  const handleCopyList = async () => {
    const lines = [
      `🎒 ${t("section.gearFor", {
        season: t(`seasonShort.${season}` as StringKey),
        type: t(`typeShort.${type}` as StringKey),
      })}`,
      `${t("gear.totalWeight", { w: fmtWeight(total) })}`,
      "",
    ];
    (Object.keys(CATEGORY_LABEL) as GearCategory[]).forEach((cat) => {
      const items = gear[cat];
      if (!items || items.length === 0) return;
      lines.push(`— ${t(`gearCat.${cat}` as StringKey)}`);
      items.forEach((it) => {
        const localized = localizeGear(it, locale);
        const prefix = it.critical ? "☐⚠" : "☐";
        const wt = it.g ? `  (${fmtWeightShort(it.g)})` : "";
        lines.push(`${prefix} ${localized.name}${wt}`);
      });
      lines.push("");
    });
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedList(true);
      window.setTimeout(() => setCopiedList(false), 2000);
    } catch {
      window.prompt("Copy this:", text);
    }
  };

  return (
    <Section
      title={t("section.gearFor", {
        season: t(`seasonShort.${season}` as StringKey),
        type: t(`typeShort.${type}` as StringKey),
      })}
      accent="ember"
      delay={6}
      right={
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-white/55">
            {t("gear.totalWeight", { w: fmtWeight(total) })}
          </span>
          {packed.size > 0 && (
            <>
              <span className="text-white/25">·</span>
              <span className="text-forest-200">
                {t("gear.packed", { n: packed.size })}
              </span>
              <button
                onClick={clearAll}
                className="rounded px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-white/40 hover:bg-white/10 hover:text-white"
              >
                {t("gear.resetChecks")}
              </button>
            </>
          )}
          <button
            onClick={handleCopyList}
            title={t("gear.copyListTooltip")}
            className={clsx(
              "rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider transition",
              copiedList
                ? "bg-forest-500/30 text-forest-100"
                : "text-white/45 hover:bg-white/10 hover:text-white",
            )}
          >
            {copiedList ? <Check className="h-3 w-3" /> : t("gear.copyList")}
          </button>
        </div>
      }
    >
      {(Object.keys(CATEGORY_LABEL) as GearCategory[]).map((cat, ci) => {
        const items = gear[cat];
        if (!items || items.length === 0) return null;
        const CatIcon = CATEGORY_ICON[cat];
        return (
          <div
            key={cat}
            className="mb-4 animate-rise"
            style={{ animationDelay: `${0.32 + ci * 0.05}s` }}
          >
            <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/55">
              <CatIcon className="h-3.5 w-3.5 text-forest-300" />
              {t(`gearCat.${cat}` as StringKey)}
              <span className="ml-auto text-[10px] font-normal text-white/30">{items.length}</span>
            </div>
            <ul className="space-y-1">
              {items.map((it) => (
                <GearRow key={it.name} item={it} category={cat} packed={packed.has(it.name)} onToggle={() => toggle(it.name)} />
              ))}
            </ul>
          </div>
        );
      })}
    </Section>
  );
}

function GearRow({
  item,
  category,
  packed,
  onToggle,
}: {
  item: ReturnType<typeof recommendGear>[number];
  category: GearCategory;
  packed: boolean;
  onToggle: () => void;
}) {
  const { t, locale, fmtWeightShort } = useLocale();
  const ItemIcon = iconForGear(item.name, category);
  const localized = localizeGear(item, locale);
  const tier = item.critical ? "critical" : item.essential ? "essential" : "optional";

  return (
    <li>
      <button
        onClick={onToggle}
        aria-pressed={packed}
        className={clsx(
          "group flex w-full items-start gap-2.5 rounded-md px-1.5 py-1 text-left text-[12.5px] transition-colors hover:bg-white/5",
          packed && "opacity-55",
        )}
      >
        <span
          className={clsx(
            "mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 transition-all",
            packed
              ? "bg-forest-500/25 text-forest-200 ring-forest-400/35"
              : tier === "critical"
                ? "bg-red-500/20 text-red-200 ring-red-400/40 shadow-[0_0_10px_rgba(248,113,113,0.25)] group-hover:bg-red-500/30"
                : tier === "essential"
                  ? "bg-ember-500/15 text-ember-300 ring-ember-500/25 group-hover:bg-ember-500/25"
                  : "bg-white/5 text-white/60 ring-white/8 group-hover:bg-white/10 group-hover:text-white/80",
          )}
        >
          {packed ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
          ) : (
            <ItemIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span
              className={clsx(
                tier === "critical" ? "text-white" : "text-white/90",
                packed && "line-through decoration-white/40",
              )}
            >
              {localized.name}
            </span>
            {item.g != null && (
              <span className="ml-auto shrink-0 font-mono text-[10px] text-white/40">
                {fmtWeightShort(item.g)}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            {tier === "critical" && (
              <span className="inline-flex items-center gap-0.5 rounded-sm bg-red-500/20 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-red-200 ring-1 ring-red-400/30">
                ⚠ {t("gear.critical")}
              </span>
            )}
            {tier === "essential" && (
              <span className="text-[9.5px] font-semibold uppercase tracking-wider text-ember-400/85">
                {t("gear.essential")}
              </span>
            )}
          </div>
          {localized.why && (
            <div className="mt-0.5 text-[11px] italic text-white/45">
              {localized.why}
            </div>
          )}
        </div>
      </button>
    </li>
  );
}

function CopyOfflineButton({
  trail,
  date,
  dateNormal,
  essentialGear,
  fireWarnings,
}: {
  trail: Trail;
  date: PickedDate;
  dateNormal: ReturnType<typeof normalForDate> | null;
  essentialGear: ReturnType<typeof recommendGear>;
  fireWarnings: NearbyFire[];
}) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url = typeof window !== "undefined"
      ? (() => {
          const u = new URL(window.location.href);
          u.searchParams.set("trail", trail.id);
          return u.toString();
        })()
      : `https://trailspark.app/?trail=${trail.id}`;
    const text = formatTrailForCopy({
      trail,
      locale,
      date,
      dateNormal,
      essentialGear,
      fireWarnings,
      shareUrl: url,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this:", text);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={copied ? t("offline.copied") : t("offline.copy")}
      title={t("offline.tooltip")}
      className="rounded-full p-1.5 text-white/55 transition hover:scale-110 hover:bg-white/10 hover:text-white"
    >
      {copied ? (
        <Check className="h-4 w-4 text-forest-300" />
      ) : (
        <ClipboardCopy className="h-4 w-4" />
      )}
    </button>
  );
}

function ShareButton({ trailId }: { trailId: string }) {
  const [copied, setCopied] = useState(false);
  const handleClick = async () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("trail", trailId);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback: select-prompt
      window.prompt("Copy this link:", url.toString());
    }
  };
  return (
    <button
      onClick={handleClick}
      aria-label="Copy share link"
      title={copied ? "Copied!" : "Copy share link"}
      className="rounded-full p-1.5 text-white/55 transition hover:scale-110 hover:bg-white/10 hover:text-white"
    >
      {copied ? (
        <Check className="h-4 w-4 text-forest-300" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
    </button>
  );
}
