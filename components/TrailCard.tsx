// Style F trail card — poster layout + GPS trace colored by difficulty.
// Server component; SVG path computed at render time from the coords prop.
// Used in the landing-page Featured grid.

import Link from "next/link";
import { pathFromCoords } from "@/lib/svg-trace";
import type { Trail } from "@/lib/types";

const DIFFICULTY_HUE: Record<string, { stroke: string; pillBg: string; pillBorder: string; glow: string }> = {
  easy:     { stroke: "#65d289", pillBg: "rgba(101,210,137,0.16)", pillBorder: "rgba(101,210,137,0.40)", glow: "rgba(101,210,137,0.55)" },
  moderate: { stroke: "#6ea8ff", pillBg: "rgba(110,168,255,0.16)", pillBorder: "rgba(110,168,255,0.40)", glow: "rgba(110,168,255,0.55)" },
  hard:     { stroke: "#ff9658", pillBg: "rgba(255,150,88,0.16)",  pillBorder: "rgba(255,150,88,0.40)",  glow: "rgba(255,150,88,0.55)"  },
  extreme:  { stroke: "#ff6b6b", pillBg: "rgba(255,107,107,0.16)", pillBorder: "rgba(255,107,107,0.40)", glow: "rgba(255,107,107,0.55)" },
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  extreme: "Extreme",
};

interface Props {
  trail: Trail;
  /** Raw [lng, lat] coordinate array — usually loaded from
   *  lib/featured-coords.json or a similar pre-extracted slice. */
  coords?: number[][];
}

export function TrailCard({ trail, coords }: Props) {
  const path = coords ? pathFromCoords(coords) : "";
  const hue = DIFFICULTY_HUE[trail.difficulty] ?? DIFFICULTY_HUE.moderate;
  const diffLabel = DIFFICULTY_LABEL[trail.difficulty] ?? trail.difficulty;

  return (
    <Link
      href={`/trails/${trail.id}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#14271e] to-[#1f3a2c] transition hover:border-white/15 hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
    >
      {/* Difficulty-tinted radial wash in the top-right corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(60% 50% at 70% 30%, ${hue.glow} 0%, transparent 65%)`,
          opacity: 0.18,
        }}
      />

      {/* GPS trace — full-bleed accent */}
      {path && (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute -right-[20%] -top-[10%] z-[1] h-[110%] w-[130%]"
        >
          <path
            d={path}
            fill="none"
            stroke={hue.stroke}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: `drop-shadow(0 0 8px ${hue.stroke}) drop-shadow(0 0 16px ${hue.glow})`,
            }}
          />
        </svg>
      )}

      {/* Content */}
      <div className="relative z-[2] flex h-full flex-col p-5">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-forest-300">
          {trail.parkUnit}
        </div>

        <h3 className="mt-auto pt-16 font-display text-[28px] font-bold leading-[1.04] tracking-[-0.015em] text-white group-hover:text-forest-100">
          {trail.name}
        </h3>

        <div className="mt-3.5 flex items-center gap-4 border-t border-white/[0.08] pt-3 text-[11.5px] text-white/55">
          <span>
            <span className="font-bold text-white">{trail.lengthMiles}</span> mi
          </span>
          <span>
            <span className="font-bold text-white">{trail.elevationGainFt.toLocaleString()}</span> ft
          </span>
          <span
            className="ml-auto rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{
              background: hue.pillBg,
              borderColor: hue.pillBorder,
              color: hue.stroke,
            }}
          >
            {diffLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
