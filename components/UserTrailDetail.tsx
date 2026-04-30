"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Ruler,
  TrendingUp,
  MapPin,
  Trash2,
  Upload,
} from "lucide-react";
import type { UserTrail } from "@/lib/uploads";
import { useLocale } from "@/lib/i18n";
import { haversineKm } from "@/lib/geo";
import {
  fetchTrailArchive,
  fetchForecast,
  monthlyNormals,
  normalForDate,
  type RawDaily,
  type ForecastDay,
} from "@/lib/weather";
import { Section, Stat } from "./Section";
import { ElevationChart, type ChartData } from "./ElevationChart";

interface UserTrailDetailProps {
  trail: UserTrail;
  onClose: () => void;
  onDelete: () => void;
}

const KM_TO_MI = 0.621371;

// Simplified detail panel for user-uploaded GPX. We don't have curated
// metadata (ecosystem, popularity, permits, POIs) so we only render what's
// computable from the GPX itself plus locale-aware weather at the trailhead.
export default function UserTrailDetail({ trail, onClose, onDelete }: UserTrailDetailProps) {
  const { t, locale, fmtDistance, fmtElevation, fmtTemp, fmtPrecip } = useLocale();
  const [archive, setArchive] = useState<RawDaily | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [weatherErr, setWeatherErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setArchive(null);
    setForecast(null);
    setWeatherErr(null);
    const [lng, lat] = trail.start;
    Promise.all([fetchTrailArchive(lat, lng), fetchForecast(lat, lng)])
      .then(([a, f]) => {
        if (ac.signal.aborted) return;
        setArchive(a);
        setForecast(f);
      })
      .catch((e) => {
        if (!ac.signal.aborted) setWeatherErr(e?.message ?? "weather error");
      });
    return () => ac.abort();
  }, [trail.id]);

  // Today as a stable yyyy-mm-dd string so the memo invalidates only when the
  // calendar day changes, not on every render.
  const todayKey = useMemo(() => new Date().toDateString(), []);
  const todayNormal = useMemo(() => {
    if (!archive) return null;
    const d = new Date(todayKey);
    return normalForDate(archive, d.getMonth() + 1, d.getDate());
  }, [archive, todayKey]);

  // Inline elevation profile from GPX feet array — memoized on trail id so a
  // re-render with the same upload doesn't rerun haversine.
  const chartData = useMemo(() => buildChartFromUpload(trail), [trail]);

  const uploadedDate = new Date(trail.uploadedAt).toLocaleDateString(
    locale === "zh" ? "zh-CN" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <aside
      key={trail.id}
      className="absolute right-0 top-0 z-30 flex h-full w-[460px] animate-slide-in-right flex-col glass"
    >
      <div className="relative px-5 pb-4 pt-5">
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <button
            onClick={() => {
              if (window.confirm(t("upload.confirmDelete"))) onDelete();
            }}
            aria-label={t("upload.delete")}
            title={t("upload.delete")}
            className="rounded-full p-1.5 text-white/55 transition hover:bg-red-500/15 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
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
          <span className="inline-block h-2 w-2 rounded-full bg-violet-400" />
          <span className="text-[11px] uppercase tracking-[0.16em] text-violet-300/80">
            {t("upload.tagCustom")} · {trail.filename}
          </span>
        </div>
        <h2 className="font-display text-2xl leading-tight text-white">{trail.name}</h2>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-white/55">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-violet-200 ring-1 ring-violet-400/30">
            <Upload className="h-3 w-3" />
            {t("upload.uploadedOn", { date: uploadedDate })}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6 pt-2">
        <div className="grid grid-cols-3 gap-2 [&>*]:animate-rise">
          <Stat icon={<Ruler className="h-3.5 w-3.5" />} label={t("stats.length")} value={fmtDistance(trail.miles)} />
          <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label={t("stats.gain")} value={fmtElevation(trail.gainFt)} />
          <Stat
            icon={<MapPin className="h-3.5 w-3.5" />}
            label={t("elevation.trailhead")}
            value={`${trail.start[1].toFixed(3)}, ${trail.start[0].toFixed(3)}`}
          />
        </div>

        <Section title={t("section.elevation")} accent="violet">
          {chartData && chartData.samples.length >= 2 ? (
            <ElevationChart data={chartData} theme="violet" />
          ) : (
            <div className="rounded-md bg-white/5 p-3 text-[11px] italic text-white/45">
              {t("elevation.noGeometry")}
            </div>
          )}
        </Section>

        <Section title={t("section.weatherAround", { date: monthDayLabel(locale) })} accent="blue">
          {weatherErr && (
            <div className="rounded-md bg-red-500/10 p-3 text-[12px] text-red-300">
              {t("weather.error", { err: weatherErr })}
            </div>
          )}
          {!weatherErr && !archive && (
            <div className="h-20 animate-pulse rounded-lg bg-white/5" />
          )}
          {todayNormal && (
            <div className="rounded-lg bg-black/25 p-4 ring-1 ring-white/8">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl leading-none text-white">{fmtTemp(todayNormal.avgHighF)}</span>
                <span className="text-base text-white/40">/</span>
                <span className="text-xl text-white/65">{fmtTemp(todayNormal.avgLowF)}</span>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-white/45">
                {t("weather.avgHighLow", { n: todayNormal.years })}
              </div>
              {todayNormal.precipInches > 0 && (
                <div className="mt-2 text-[11px] text-white/65">
                  {t("weather.precipAvg", { v: fmtPrecip(todayNormal.precipInches) })}
                </div>
              )}
            </div>
          )}
        </Section>
      </div>
    </aside>
  );
}

function monthDayLabel(locale: "en" | "zh"): string {
  const d = new Date();
  if (locale === "zh") return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildChartFromUpload(trail: UserTrail): ChartData | null {
  if (trail.points.length < 2 || trail.feet.length !== trail.points.length) return null;
  let cumKm = 0;
  const samples: ChartData["samples"] = [];
  for (let i = 0; i < trail.points.length; i++) {
    if (i > 0) cumKm += haversineKm(trail.points[i - 1], trail.points[i]);
    samples.push({
      miles: Math.round(cumKm * KM_TO_MI * 100) / 100,
      feet: trail.feet[i],
    });
  }
  let minFt = Infinity;
  let maxFt = -Infinity;
  let gain = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (s.feet < minFt) minFt = s.feet;
    if (s.feet > maxFt) maxFt = s.feet;
    if (i > 0) {
      const d = s.feet - samples[i - 1].feet;
      if (d > 0) gain += d;
    }
  }
  return {
    samples,
    totalMiles: samples[samples.length - 1].miles,
    minFt,
    maxFt,
    totalGainFt: Math.round(gain),
  };
}
