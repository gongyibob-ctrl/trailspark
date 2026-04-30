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
import clsx from "clsx";
import type { UserTrail } from "@/lib/uploads";
import { useLocale } from "@/lib/i18n";
import {
  fetchTrailArchive,
  fetchForecast,
  monthlyNormals,
  normalForDate,
  type RawDaily,
  type ForecastDay,
} from "@/lib/weather";

interface UserTrailDetailProps {
  trail: UserTrail;
  onClose: () => void;
  onDelete: () => void;
}

// Simplified detail panel for user-uploaded GPX. We don't have curated
// metadata (ecosystem, popularity, permits, POIs) so we only render what's
// computable from the GPX itself plus locale-aware weather at the trailhead.
export default function UserTrailDetail({ trail, onClose, onDelete }: UserTrailDetailProps) {
  const { t, locale, fmtDistance, fmtElevation, fmtElevationShort, fmtTemp, fmtPrecip } = useLocale();
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

  // Today's normals as a quick proxy for "is this hikeable now"
  const today = new Date();
  const todayNormal = useMemo(
    () => (archive ? normalForDate(archive, today.getMonth() + 1, today.getDate()) : null),
    [archive],
  );

  // Inline elevation profile from GPX feet array
  const profile = useMemo(() => buildProfileFromUpload(trail), [trail]);

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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 [&>*]:animate-rise">
          <Stat icon={<Ruler className="h-3.5 w-3.5" />} label={t("stats.length")} value={fmtDistance(trail.miles)} />
          <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label={t("stats.gain")} value={fmtElevation(trail.gainFt)} />
          <Stat icon={<MapPin className="h-3.5 w-3.5" />} label={t("elevation.trailhead")} value={`${trail.start[1].toFixed(3)}, ${trail.start[0].toFixed(3)}`} />
        </div>

        {/* Elevation profile (built from GPX, not Open-Meteo) */}
        <Section title={t("section.elevation")} accent="forest">
          {profile && profile.samples.length >= 2 ? (
            <UserElevationChart profile={profile} fmtElevationShort={fmtElevationShort} fmtElevation={fmtElevation} fmtDistance={fmtDistance} />
          ) : (
            <div className="rounded-md bg-white/5 p-3 text-[11px] italic text-white/45">
              {t("elevation.noGeometry")}
            </div>
          )}
        </Section>

        {/* Weather at the trailhead — same Open-Meteo source as curated trails */}
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

function Section({ title, accent, children }: { title: string; accent: "forest" | "blue"; children: React.ReactNode }) {
  const bar = accent === "forest" ? "bg-forest-300" : "bg-blue-400";
  return (
    <section className="animate-rise rounded-xl bg-white/[0.03] ring-1 ring-white/10">
      <header className="px-4 pt-3.5 pb-2">
        <h3 className="flex items-center gap-2 text-[13.5px] font-semibold text-white">
          <span className={clsx("h-3.5 w-[3px] rounded-full", bar)} />
          {title}
        </h3>
      </header>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/30 px-3.5 py-2.5 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/55">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}

interface UploadProfile {
  samples: { miles: number; feet: number }[];
  totalMiles: number;
  minFt: number;
  maxFt: number;
  totalGainFt: number;
}

function buildProfileFromUpload(trail: UserTrail): UploadProfile | null {
  if (trail.points.length < 2 || trail.feet.length !== trail.points.length) return null;
  // Cumulative miles via haversine on the thinned points
  let cumKm = 0;
  const samples: UploadProfile["samples"] = [];
  for (let i = 0; i < trail.points.length; i++) {
    if (i > 0) {
      const a = trail.points[i - 1];
      const b = trail.points[i];
      const R = 6371;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(b[1] - a[1]);
      const dLng = toRad(b[0] - a[0]);
      const lat1 = toRad(a[1]);
      const lat2 = toRad(b[1]);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      cumKm += 2 * R * Math.asin(Math.sqrt(h));
    }
    samples.push({
      miles: Math.round(cumKm * 0.621371 * 100) / 100,
      feet: trail.feet[i],
    });
  }
  let minFt = Infinity, maxFt = -Infinity, gain = 0;
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

function UserElevationChart({
  profile,
  fmtElevation,
  fmtElevationShort,
  fmtDistance,
}: {
  profile: UploadProfile;
  fmtElevation: (ft: number) => string;
  fmtElevationShort: (ft: number) => string;
  fmtDistance: (mi: number) => string;
}) {
  const W = 400;
  const H = 110;
  const PADX = 12;
  const PADY = 8;
  const innerW = W - PADX * 2;
  const innerH = H - PADY * 2;

  const span = profile.maxFt - profile.minFt;
  const pad = Math.max(50, Math.round(span * 0.1));
  const yMin = Math.max(0, profile.minFt - pad);
  const yMax = profile.maxFt + pad;
  const yRange = Math.max(yMax - yMin, 1);
  const xAt = (m: number) => PADX + (profile.totalMiles ? (m / profile.totalMiles) * innerW : 0);
  const yAt = (f: number) => PADY + ((yMax - f) / yRange) * innerH;

  const linePts = profile.samples.map((s) => `${xAt(s.miles)},${yAt(s.feet)}`).join(" ");
  const areaPath = [
    `M ${xAt(profile.samples[0].miles)},${yAt(yMin)}`,
    ...profile.samples.map((s) => `L ${xAt(s.miles)},${yAt(s.feet)}`),
    `L ${xAt(profile.samples[profile.samples.length - 1].miles)},${yAt(yMin)} Z`,
  ].join(" ");

  return (
    <div className="overflow-hidden rounded-lg bg-black/20 p-3 ring-1 ring-white/6">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
        <span>Elevation profile</span>
        <span>
          <span className="text-violet-300">+{fmtElevation(profile.totalGainFt)}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="110" preserveAspectRatio="none">
        <defs>
          <linearGradient id="userElev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#userElev)" />
        <polyline
          points={linePts}
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-1 flex justify-between px-3 text-[10px] text-white/40">
        <span>{fmtElevation(profile.samples[0].feet)}</span>
        <span>{fmtDistance(profile.totalMiles)}</span>
      </div>
    </div>
  );
}
