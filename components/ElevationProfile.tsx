"use client";

import { useEffect, useState } from "react";
import { TrendingUp, MapPin } from "lucide-react";
import { getElevationProfile, type ElevationProfile as Profile } from "@/lib/elevation";
import { isLoaded as geometriesLoaded } from "@/lib/geometries";
import { useLocale } from "@/lib/i18n";
import { getTrailPOIs } from "@/lib/trail-pois";
import { POI_HEX } from "@/lib/poi-icons";

export default function ElevationProfile({ trailId }: { trailId: string }) {
  const { t } = useLocale();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    setLoading(true);
    setProfile(null);
    setErr(null);

    const tryFetch = async (retries = 8) => {
      // Geometries are fetched lazily; wait briefly until they land
      for (let i = 0; i < retries && !geometriesLoaded(); i++) {
        await new Promise((r) => setTimeout(r, 150));
      }
      try {
        const p = await getElevationProfile(trailId);
        if (!aborted) {
          setProfile(p);
          setLoading(false);
        }
      } catch (e: any) {
        if (!aborted) {
          setErr(e?.message ?? "elevation fetch failed");
          setLoading(false);
        }
      }
    };
    tryFetch();
    return () => {
      aborted = true;
    };
  }, [trailId]);

  if (loading) {
    return <div className="h-24 animate-pulse rounded-lg bg-white/5" />;
  }
  if (err) {
    return (
      <div className="rounded-md bg-red-500/10 p-3 text-[12px] text-red-300">
        {t("elevation.loadFailed", { err })}
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="rounded-md bg-white/5 p-3 text-[11px] italic text-white/45">
        {t("elevation.noGeometry")}
      </div>
    );
  }

  return <Chart profile={profile} trailId={trailId} />;
}

function Chart({ profile, trailId }: { profile: Profile; trailId: string }) {
  const { t, locale, fmtDistance, fmtElevation, fmtElevationShort } = useLocale();
  // Annotate the chart with POIs that have a known mile mark — gives the
  // elevation profile a sense of "Mile 6 is when you hit the pass" instead
  // of a faceless wiggle.
  const poiMarkers = getTrailPOIs(trailId).filter((p) => p.m != null && p.m > 0);
  const W = 400;
  const H = 110;
  const PADX = 12;
  const PADY = 8;
  const innerW = W - PADX * 2;
  const innerH = H - PADY * 2;

  // Pad y range
  const span = profile.maxFt - profile.minFt;
  const pad = Math.max(50, Math.round(span * 0.1));
  const yMin = Math.max(0, profile.minFt - pad);
  const yMax = profile.maxFt + pad;
  const yRange = Math.max(yMax - yMin, 1);

  const xAt = (m: number) =>
    PADX + (profile.totalMiles ? (m / profile.totalMiles) * innerW : 0);
  const yAt = (f: number) => PADY + ((yMax - f) / yRange) * innerH;

  const linePts = profile.samples.map((s) => `${xAt(s.miles)},${yAt(s.feet)}`).join(" ");
  const areaPath = [
    `M ${xAt(profile.samples[0].miles)},${yAt(yMin)}`,
    ...profile.samples.map((s) => `L ${xAt(s.miles)},${yAt(s.feet)}`),
    `L ${xAt(profile.samples[profile.samples.length - 1].miles)},${yAt(yMin)} Z`,
  ].join(" ");

  const high = profile.samples[profile.highIdx];
  const start = profile.samples[0];
  const end = profile.samples[profile.samples.length - 1];

  const ticks = [
    Math.round(yMax / 100) * 100,
    Math.round(((yMax + yMin) / 2) / 100) * 100,
    Math.round(yMin / 100) * 100,
  ];

  return (
    <div className="overflow-hidden rounded-lg bg-black/20 p-3 ring-1 ring-white/6">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-white/40">
        <span className="flex items-center gap-1.5 truncate">
          <TrendingUp className="h-3 w-3 shrink-0" />
          {t("elevation.label")}
        </span>
        <span className="shrink-0 whitespace-nowrap">
          <span className="text-ember-400">+{fmtElevation(profile.totalGainFt)}</span>{" "}
          <span className="text-white/35">{t("elevation.cumulative")}</span>
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
            <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a0bda8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#41644e" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="elevLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7fb6ff" />
              <stop offset="50%" stopColor="#a0bda8" />
              <stop offset="100%" stopColor="#ee7e3e" />
            </linearGradient>
          </defs>

          {/* y-axis dotted gridlines (label sits inside the chart, right-aligned) */}
          {ticks.map((tickFt) => (
            <g key={tickFt}>
              <line
                x1={PADX}
                x2={W - PADX}
                y1={yAt(tickFt)}
                y2={yAt(tickFt)}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="2 4"
              />
              <text
                x={W - PADX - 2}
                y={yAt(tickFt) - 2}
                fontSize="9"
                fill="rgba(255,255,255,0.4)"
                textAnchor="end"
              >
                {fmtElevationShort(tickFt)}
              </text>
            </g>
          ))}

          {/* area fill */}
          <path d={areaPath} fill="url(#elevFill)" />
          {/* curve */}
          <polyline
            points={linePts}
            fill="none"
            stroke="url(#elevLine)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* POI annotations along the curve */}
          {poiMarkers.map((p, i) => {
            // Use the POI's own elevation if known, else look up the closest
            // sample on the curve so the dot lands on the trail line.
            let feet = p.ft;
            if (feet == null) {
              const target = p.m!;
              let best = profile.samples[0];
              let bestD = Math.abs(best.miles - target);
              for (const s of profile.samples) {
                const d = Math.abs(s.miles - target);
                if (d < bestD) {
                  bestD = d;
                  best = s;
                }
              }
              feet = best.feet;
            }
            const cx = xAt(p.m!);
            const cy = yAt(feet);
            const name = locale === "zh" && p.nameZh ? p.nameZh : p.name;
            return (
              <g key={`poi-${i}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="2.8"
                  fill={POI_HEX[p.type]}
                  stroke="#fff"
                  strokeWidth="0.8"
                  opacity="0.9"
                >
                  <title>{name}</title>
                </circle>
              </g>
            );
          })}

          {/* start dot */}
          <circle cx={xAt(start.miles)} cy={yAt(start.feet)} r="3" fill="#7fb6ff" stroke="#fff" strokeWidth="1" />
          {/* high point dot + label (clamp text away from chart edges) */}
          <circle cx={xAt(high.miles)} cy={yAt(high.feet)} r="3.5" fill="#ee7e3e" stroke="#fff" strokeWidth="1.2" />
          <text
            x={Math.min(Math.max(xAt(high.miles), PADX + 36), W - PADX - 36)}
            y={Math.max(yAt(high.feet) - 7, 12)}
            fontSize="10"
            fontWeight="600"
            fill="#ffd6b8"
            textAnchor="middle"
          >
            ▲ {fmtElevationShort(high.feet)}
          </text>
          {/* end dot */}
          <circle cx={xAt(end.miles)} cy={yAt(end.feet)} r="3" fill="#a0bda8" stroke="#fff" strokeWidth="1" />
        </svg>

        {/* axis labels */}
        <div className="mt-1 flex justify-between px-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" />
            {t("elevation.trailhead")} {fmtElevation(start.feet)}
          </span>
          <span>{fmtDistance(profile.totalMiles)}</span>
        </div>
      </div>
    </div>
  );
}
