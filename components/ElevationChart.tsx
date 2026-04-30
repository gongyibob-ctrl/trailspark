"use client";

// Shared elevation chart used by both the curated TrailDetail (via
// ElevationProfile.tsx, which adds POI annotations) and UserTrailDetail
// (which feeds in raw GPX-derived samples). Theme picks the curve color so
// the two contexts are visually distinguishable.

import { TrendingUp } from "lucide-react";
import clsx from "clsx";
import { useLocale } from "@/lib/i18n";

export interface ChartSample {
  miles: number;
  feet: number;
}

export interface ChartData {
  samples: ChartSample[];
  totalMiles: number;
  minFt: number;
  maxFt: number;
  /** Cumulative gain (sum of positive deltas), feet. */
  totalGainFt: number;
}

export interface ElevationChartProps {
  data: ChartData;
  /** "forest" matches the curated trails; "violet" is for user uploads. */
  theme?: "forest" | "violet";
  /** Header right-side text (e.g., the cumulative gain caption). */
  headerRight?: React.ReactNode;
  /** Footer left text (defaults to "Trailhead {ft}"). */
  footerLeft?: React.ReactNode;
  /** Footer right text (defaults to total miles). */
  footerRight?: React.ReactNode;
  /** Optional overlay rendered inside the SVG, after the curve. */
  children?: React.ReactNode;
  /** Layout for SVG (defaults match production). */
  width?: number;
  height?: number;
}

const FOREST_GRADIENT = (
  <>
    <stop offset="0%" stopColor="#a0bda8" stopOpacity="0.5" />
    <stop offset="100%" stopColor="#41644e" stopOpacity="0.05" />
  </>
);
const VIOLET_GRADIENT = (
  <>
    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.45" />
    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
  </>
);

export function ElevationChart({
  data,
  theme = "forest",
  headerRight,
  footerLeft,
  footerRight,
  children,
  width = 400,
  height = 110,
}: ElevationChartProps) {
  const { t, fmtDistance, fmtElevation } = useLocale();

  const PADX = 12;
  const PADY = 8;
  const innerW = width - PADX * 2;
  const innerH = height - PADY * 2;

  const span = data.maxFt - data.minFt;
  const pad = Math.max(50, Math.round(span * 0.1));
  const yMin = Math.max(0, data.minFt - pad);
  const yMax = data.maxFt + pad;
  const yRange = Math.max(yMax - yMin, 1);

  const xAt = (m: number) =>
    PADX + (data.totalMiles ? (m / data.totalMiles) * innerW : 0);
  const yAt = (f: number) => PADY + ((yMax - f) / yRange) * innerH;

  const linePts = data.samples.map((s) => `${xAt(s.miles)},${yAt(s.feet)}`).join(" ");
  const last = data.samples[data.samples.length - 1];
  const areaPath = [
    `M ${xAt(data.samples[0].miles)},${yAt(yMin)}`,
    ...data.samples.map((s) => `L ${xAt(s.miles)},${yAt(s.feet)}`),
    `L ${xAt(last.miles)},${yAt(yMin)} Z`,
  ].join(" ");

  const lineStroke = theme === "violet" ? "#c4b5fd" : "url(#elevLine)";
  const headerNumber = theme === "violet" ? "text-violet-300" : "text-ember-400";
  const start = data.samples[0];

  const defaultFooterLeft = (
    <>
      {t("elevation.trailhead")} {fmtElevation(start.feet)}
    </>
  );
  const defaultFooterRight = fmtDistance(data.totalMiles);

  return (
    <div className="overflow-hidden rounded-lg bg-black/20 p-3 ring-1 ring-white/6">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-white/40">
        <span className="flex items-center gap-1.5 truncate">
          <TrendingUp className="h-3 w-3 shrink-0" />
          {t("elevation.label")}
        </span>
        <span className="shrink-0 whitespace-nowrap">
          {headerRight ?? (
            <>
              <span className={clsx(headerNumber)}>+{fmtElevation(data.totalGainFt)}</span>{" "}
              <span className="text-white/35">{t("elevation.cumulative")}</span>
            </>
          )}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
            {theme === "violet" ? VIOLET_GRADIENT : FOREST_GRADIENT}
          </linearGradient>
          {theme === "forest" && (
            <linearGradient id="elevLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7fb6ff" />
              <stop offset="50%" stopColor="#a0bda8" />
              <stop offset="100%" stopColor="#ee7e3e" />
            </linearGradient>
          )}
        </defs>

        <path d={areaPath} fill="url(#elevFill)" />
        <polyline
          points={linePts}
          fill="none"
          stroke={lineStroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Caller can layer in additional dots / annotations via children */}
        {children}
      </svg>

      <div className="mt-1 flex justify-between px-3 text-[10px] text-white/40">
        <span className="flex items-center gap-1">{footerLeft ?? defaultFooterLeft}</span>
        <span>{footerRight ?? defaultFooterRight}</span>
      </div>
    </div>
  );
}

/** Shared scale helper so callers (e.g., POI annotations) can compute their
 *  own positions consistent with the chart. */
export function buildScale(data: ChartData, width = 400, height = 110) {
  const PADX = 12;
  const PADY = 8;
  const innerW = width - PADX * 2;
  const innerH = height - PADY * 2;
  const span = data.maxFt - data.minFt;
  const pad = Math.max(50, Math.round(span * 0.1));
  const yMin = Math.max(0, data.minFt - pad);
  const yMax = data.maxFt + pad;
  const yRange = Math.max(yMax - yMin, 1);
  return {
    xAt: (m: number) => PADX + (data.totalMiles ? (m / data.totalMiles) * innerW : 0),
    yAt: (f: number) => PADY + ((yMax - f) / yRange) * innerH,
    yMin,
    yMax,
  };
}
