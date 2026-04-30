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
} from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import type { Season, Trail } from "@/lib/types";
import {
  DIFFICULTY_COLOR,
  DIFFICULTY_LABEL,
  ECOSYSTEM_LABEL,
  TYPE_LABEL,
} from "@/lib/types";
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
import {
  bestMonths as computeBestMonths,
  formatPickedShort,
  initialDateForBestSeasons,
  seasonForDate,
  MONTH_NAMES_SHORT,
  type PickedDate,
} from "@/lib/dates";
import DatePicker from "./DatePicker";
import ElevationProfile from "./ElevationProfile";
import { recommendGear, groupByCategory, CATEGORY_LABEL, type GearCategory } from "@/lib/gear";
import { CATEGORY_ICON, iconForGear } from "@/lib/gear-icons";
import clsx from "clsx";

interface TrailDetailProps {
  trail: Trail | null;
  onClose: () => void;
}

export default function TrailDetail({ trail, onClose }: TrailDetailProps) {
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const [date, setDate] = useState<PickedDate>(() =>
    trail ? initialDateForBestSeasons(trail.bestSeasons) : { month: 7, day: 15 },
  );
  const [archive, setArchive] = useState<RawDaily | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

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
  const gear = useMemo(() => {
    if (!trail) return null;
    return groupByCategory(recommendGear(trail, season));
  }, [trail, season]);

  if (!trail) return null;

  const diffColor = DIFFICULTY_COLOR[trail.difficulty];

  return (
    <aside
      key={trail.id}
      className="absolute right-0 top-0 z-30 flex h-full w-[460px] animate-slide-in-right flex-col glass"
    >
      {/* Header */}
      <div className="relative px-6 pb-4 pt-5">
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <ShareButton trailId={trail.id} />
          <button
            onClick={() => toggleFavorite(trail.id)}
            aria-label={favorites.has(trail.id) ? "Remove from favorites" : "Save to favorites"}
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
            aria-label="Close"
            className="rounded-full p-1.5 text-white/55 transition hover:rotate-90 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: diffColor }} />
          <span className="text-[11px] uppercase tracking-[0.16em] text-white/55">
            {trail.parkUnit}
          </span>
        </div>
        <h2 className="font-display text-2xl leading-tight text-white">{trail.name}</h2>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge className={`diff-${trail.difficulty}`}>{DIFFICULTY_LABEL[trail.difficulty]}</Badge>
          <Badge className="border-white/15 bg-white/5 text-white/80">
            {TYPE_LABEL[trail.type]}
          </Badge>
          <Badge className="border-white/15 bg-white/5 text-white/80">
            {ECOSYSTEM_LABEL[trail.ecosystem]}
          </Badge>
          {trail.permitRequired && (
            <Badge className="border-ember-500/30 bg-ember-500/15 text-ember-400">
              <TicketCheck className="mr-1 inline h-3 w-3" />
              Permit required
            </Badge>
          )}
        </div>
      </div>

      {/* Content scroll */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 [&>*]:animate-rise" style={stagger(0)}>
          <Stat icon={<Ruler className="h-3.5 w-3.5" />} label="Length" value={`${trail.lengthMiles} mi`} />
          <Stat
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Gain"
            value={`${trail.elevationGainFt.toLocaleString()} ft`}
          />
          <Stat icon={<Mountain className="h-3.5 w-3.5" />} label="State" value={trail.state} />
        </div>

        {/* Description */}
        <Section title="About" delay={1}>
          <p className="text-[13.5px] leading-relaxed text-white/80">{trail.description}</p>
        </Section>

        {/* Elevation profile */}
        <Section title="Elevation Profile" delay={2}>
          <ElevationProfile trailId={trail.id} />
        </Section>

        {/* Highlights */}
        <Section title="Highlights" delay={3}>
          <ul className="space-y-1.5">
            {trail.highlights.map((h, i) => (
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
          title="Best Time to Hike"
          delay={4}
          right={
            <BestSeasonsLine seasons={trail.bestSeasons} />
          }
        >
          <DatePicker value={date} onChange={handleDateChange} bestMonths={bestMonthsSet} />
        </Section>

        {/* Weather for the picked date */}
        <Section
          title={`Weather around ${formatPickedShort(date)}`}
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
              Couldn't load weather: {weatherError}
            </div>
          )}
          {dateNormal && <DateWeatherCard normal={dateNormal} />}
          {monthly && <ClimateChart normals={monthly} highlightMonth={date.month} />}
          {forecast && <Forecast days={forecast} />}
        </Section>

        {/* Gear */}
        <Section
          title={`Gear for ${season} ${trail.type === "day" ? "day hike" : trail.type === "thru-hike" ? "thru-hike" : "backpack"}`}
          delay={6}
        >
          {gear &&
            (Object.keys(CATEGORY_LABEL) as GearCategory[]).map((cat, ci) => {
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
                    {CATEGORY_LABEL[cat]}
                    <span className="ml-auto text-[10px] font-normal text-white/30">
                      {items.length}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {items.map((it) => {
                      const ItemIcon = iconForGear(it.name, cat);
                      return (
                        <li
                          key={it.name}
                          className="group flex items-start gap-2.5 rounded-md px-1.5 py-1 text-[12.5px] transition-colors hover:bg-white/5"
                        >
                          <span
                            className={clsx(
                              "mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 transition-all",
                              it.essential
                                ? "bg-ember-500/15 text-ember-300 ring-ember-500/25 group-hover:bg-ember-500/25"
                                : "bg-white/5 text-white/60 ring-white/8 group-hover:bg-white/10 group-hover:text-white/80",
                            )}
                          >
                            <ItemIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-white/90">{it.name}</span>
                              {it.essential && (
                                <span className="text-[9.5px] font-semibold uppercase tracking-wider text-ember-400/85">
                                  essential
                                </span>
                              )}
                            </div>
                            {it.why && (
                              <div className="mt-0.5 text-[11px] italic text-white/45">
                                {it.why}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
        </Section>

        {trail.externalUrl && (
          <a
            href={trail.externalUrl}
            target="_blank"
            rel="noopener"
            className="group flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition hover:border-forest-400/40 hover:bg-forest-500/15 hover:text-white"
          >
            Official trail info
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}

        <div className="flex items-center gap-2 text-[11px] text-white/40">
          <MapPin className="h-3 w-3" />
          Trailhead: {trail.trailhead.lat.toFixed(4)}, {trail.trailhead.lng.toFixed(4)}
        </div>
      </div>
    </aside>
  );
}

function stagger(i: number): React.CSSProperties {
  // applies the same delay to all immediate children using the [&>*] arbitrary selector
  return { ["--stagger" as any]: `${0.1 + i * 0.06}s`, animationDelay: `${0.08 + i * 0.06}s` };
}

function Section({
  title,
  right,
  children,
  delay = 0,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className="animate-rise" style={{ animationDelay: `${0.08 + delay * 0.07}s` }}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
          {title}
        </h3>
        {right}
      </div>
      {children}
    </div>
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
    <div className="rounded-lg bg-gradient-to-br from-white/8 to-white/3 px-3 py-2 ring-1 ring-white/8">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-[15px] font-semibold text-white">{value}</div>
    </div>
  );
}

function BestSeasonsLine({ seasons }: { seasons: Season[] }) {
  const label = seasons.map((s) => s[0].toUpperCase() + s.slice(1)).join(" · ");
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-forest-500/15 px-2 py-0.5 text-[10px] text-forest-200">
      <Sparkles className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

function DateWeatherCard({ normal }: { normal: ReturnType<typeof normalForDate> }) {
  const highSpread = normal.rangeHighF[1] - normal.rangeHighF[0];
  return (
    <div
      key={`${normal.month}-${normal.day}`}
      className="animate-rise rounded-xl bg-gradient-to-br from-white/8 to-white/2 p-4 ring-1 ring-white/10"
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl leading-none text-white">
              {normal.avgHighF}°
            </span>
            <span className="text-base text-white/40">/</span>
            <span className="text-xl text-white/65">{normal.avgLowF}°</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-white/45">
            Avg high / low (past {normal.years} yrs)
          </div>
        </div>
        {normal.snowLikely && (
          <div className="flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-[11px] text-blue-200 ring-1 ring-blue-400/20">
            <Snowflake className="h-3 w-3" />
            Snow likely
          </div>
        )}
      </div>

      {/* Range bar */}
      <div className="mt-3 space-y-2">
        <RangeBar
          label="High"
          range={normal.rangeHighF}
          avg={normal.avgHighF}
          color="from-ember-400 to-ember-600"
        />
        <RangeBar
          label="Low"
          range={normal.rangeLowF}
          avg={normal.avgLowF}
          color="from-blue-300 to-blue-500"
        />
      </div>

      <div className="mt-3 flex gap-2 border-t border-white/8 pt-3 text-[11px] text-white/65">
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-blue-300" />
          {normal.precipInches}″ avg precip
        </div>
        <div className="text-white/30">·</div>
        <div className="text-white/55">
          ~{normal.precipDays} of {normal.years} years saw rain
        </div>
      </div>
      {Math.abs(highSpread) > 25 && (
        <div className="mt-2 flex items-start gap-1 text-[10.5px] text-white/45">
          <Thermometer className="mt-px h-3 w-3" />
          <span>
            High spread of {highSpread}°F means weather is variable on this date — pack layers.
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
  const lo = range[0];
  const hi = range[1];
  // Anchor the bar within a fixed temp window for visual stability
  const VIEW_MIN = -20;
  const VIEW_MAX = 110;
  const span = VIEW_MAX - VIEW_MIN;
  const left = ((lo - VIEW_MIN) / span) * 100;
  const width = ((hi - lo) / span) * 100;
  const avgPos = ((avg - VIEW_MIN) / span) * 100;
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-[10px] text-white/45">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="font-mono text-white/65">
          {lo}° – {hi}°F
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
    <div className="mt-3 rounded-lg bg-white/5 p-3 ring-1 ring-white/8">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
        <span>Year-round avg high / low °F</span>
        <span>
          {rawMin}° – {rawMax}°
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="110"
          preserveAspectRatio="none"
          className="overflow-visible"
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

          {/* y-axis dotted gridlines */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PADX}
                x2={W - PADX}
                y1={yAt(t)}
                y2={yAt(t)}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="2 4"
              />
              <text
                x={W - PADX + 2}
                y={yAt(t) + 3}
                fontSize="9"
                fill="rgba(255,255,255,0.35)"
              >
                {t}°
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

          {/* selected-month dots + labels */}
          <circle cx={selX} cy={yAt(sel.tempMaxF)} r="3.5" fill="#ee7e3e" stroke="#fff" strokeWidth="1.2" />
          <circle cx={selX} cy={yAt(sel.tempMinF)} r="3.5" fill="#3b82f6" stroke="#fff" strokeWidth="1.2" />
          <text
            x={selX}
            y={yAt(sel.tempMaxF) - 6}
            fontSize="10"
            fontWeight="600"
            fill="#ffd6b8"
            textAnchor="middle"
          >
            {sel.tempMaxF}°
          </text>
          <text
            x={selX}
            y={yAt(sel.tempMinF) + 13}
            fontSize="10"
            fontWeight="600"
            fill="#bdd6ff"
            textAnchor="middle"
          >
            {sel.tempMinF}°
          </text>
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
              {MONTH_NAMES_SHORT[n.month - 1]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Forecast({ days }: { days: ForecastDay[] }) {
  return (
    <div className="mt-3 rounded-lg bg-white/5 p-3 ring-1 ring-white/8">
      <div className="mb-2 text-[10px] uppercase tracking-wider text-white/40">
        Live 7-day forecast at trailhead
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const dt = new Date(d.date);
          const wd = dt.toLocaleDateString("en-US", { weekday: "short" });
          return (
            <div
              key={d.date}
              title={`${weatherLabel(d.weatherCode)} · wind ${d.windMph} mph`}
              className="flex animate-rise flex-col items-center rounded-md bg-black/20 px-1 py-2 transition-colors hover:bg-black/30"
              style={{ animationDelay: `${0.45 + i * 0.04}s` }}
            >
              <div className="text-[10px] text-white/55">{wd}</div>
              <div className="my-0.5 text-base">{weatherEmoji(d.weatherCode)}</div>
              <div className="text-[11px] font-semibold text-white">{d.tempMaxF}°</div>
              <div className="text-[10px] text-white/50">{d.tempMinF}°</div>
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
