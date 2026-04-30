"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { getElevationProfile, type ElevationProfile as Profile } from "@/lib/elevation";
import { isLoaded as geometriesLoaded } from "@/lib/geometries";
import { useLocale } from "@/lib/i18n";
import { getTrailPOIs } from "@/lib/trail-pois";
import { POI_HEX, pickPoiName } from "@/lib/poi-icons";
import { ElevationChart, buildScale, type ChartData } from "./ElevationChart";

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
      // Geometries arrive lazily — wait briefly for them
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

  if (loading) return <div className="h-24 animate-pulse rounded-lg bg-white/5" />;
  if (err)
    return (
      <div className="rounded-md bg-red-500/10 p-3 text-[12px] text-red-300">
        {t("elevation.loadFailed", { err })}
      </div>
    );
  if (!profile)
    return (
      <div className="rounded-md bg-white/5 p-3 text-[11px] italic text-white/45">
        {t("elevation.noGeometry")}
      </div>
    );

  return <CuratedChart profile={profile} trailId={trailId} />;
}

function CuratedChart({ profile, trailId }: { profile: Profile; trailId: string }) {
  const { locale, fmtElevation, fmtElevationShort } = useLocale();
  const data: ChartData = {
    samples: profile.samples,
    totalMiles: profile.totalMiles,
    minFt: profile.minFt,
    maxFt: profile.maxFt,
    totalGainFt: profile.totalGainFt,
  };
  const scale = buildScale(data);
  const W = 400;
  const PADX = 12;

  const ticks = [
    Math.round(scale.yMax / 100) * 100,
    Math.round(((scale.yMax + scale.yMin) / 2) / 100) * 100,
    Math.round(scale.yMin / 100) * 100,
  ];

  const high = profile.samples[profile.highIdx];
  const start = profile.samples[0];
  const end = profile.samples[profile.samples.length - 1];

  // POI dots — fall back to nearest sample's elevation when poi.ft missing
  const poiMarkers = getTrailPOIs(trailId).filter((p) => p.m != null && p.m > 0);

  return (
    <ElevationChart
      data={data}
      theme="forest"
      footerLeft={
        <>
          <MapPin className="h-2.5 w-2.5" />
          {/* eslint-disable-next-line react/jsx-key */}
          <CuratedTrailheadLabel feet={start.feet} />
        </>
      }
    >
      {/* y-axis dotted gridlines, label inside the chart */}
      {ticks.map((tickFt) => (
        <g key={tickFt}>
          <line
            x1={PADX}
            x2={W - PADX}
            y1={scale.yAt(tickFt)}
            y2={scale.yAt(tickFt)}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="2 4"
          />
          <text
            x={W - PADX - 2}
            y={scale.yAt(tickFt) - 2}
            fontSize="9"
            fill="rgba(255,255,255,0.4)"
            textAnchor="end"
          >
            {fmtElevationShort(tickFt)}
          </text>
        </g>
      ))}

      {/* POI annotations */}
      {poiMarkers.map((p, i) => {
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
        return (
          <circle
            key={`poi-${i}`}
            cx={scale.xAt(p.m!)}
            cy={scale.yAt(feet)}
            r="2.8"
            fill={POI_HEX[p.type]}
            stroke="#fff"
            strokeWidth="0.8"
            opacity="0.9"
          >
            <title>{pickPoiName(p, locale)}</title>
          </circle>
        );
      })}

      {/* Start / high / end dots + the high-point label */}
      <circle
        cx={scale.xAt(start.miles)}
        cy={scale.yAt(start.feet)}
        r="3"
        fill="#7fb6ff"
        stroke="#fff"
        strokeWidth="1"
      />
      <circle
        cx={scale.xAt(high.miles)}
        cy={scale.yAt(high.feet)}
        r="3.5"
        fill="#ee7e3e"
        stroke="#fff"
        strokeWidth="1.2"
      />
      <text
        x={Math.min(Math.max(scale.xAt(high.miles), PADX + 36), W - PADX - 36)}
        y={Math.max(scale.yAt(high.feet) - 7, 12)}
        fontSize="10"
        fontWeight="600"
        fill="#ffd6b8"
        textAnchor="middle"
      >
        ▲ {fmtElevationShort(high.feet)}
      </text>
      <circle
        cx={scale.xAt(end.miles)}
        cy={scale.yAt(end.feet)}
        r="3"
        fill="#a0bda8"
        stroke="#fff"
        strokeWidth="1"
      />
    </ElevationChart>
  );
}

function CuratedTrailheadLabel({ feet }: { feet: number }) {
  const { t, fmtElevation } = useLocale();
  return (
    <>
      {t("elevation.trailhead")} {fmtElevation(feet)}
    </>
  );
}
