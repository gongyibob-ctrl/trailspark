// Per-trail OG image. When someone shares /trails/half-dome, the preview
// card shows the trail name + park + headline stats instead of the generic
// site-wide OG. Generated on demand by @vercel/og.
//
// Note: we intentionally do NOT export `generateImageMetadata` enumerating
// all 1,782 trails — that would force static generation of every PNG at
// build time. On-demand + edge caching is plenty for this scale.

import { ImageResponse } from "next/og";
import { TRAIL_BY_ID } from "@/lib/trails";
import { DIFFICULTY_LABEL } from "@/lib/labels";

export const alt = "Trailspark trail preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DIFFICULTY_BG: Record<string, string> = {
  easy:     "rgba(34, 197, 94, 0.18)",
  moderate: "rgba(59, 130, 246, 0.18)",
  hard:     "rgba(249, 115, 22, 0.20)",
  extreme:  "rgba(220, 38, 38, 0.22)",
};
const DIFFICULTY_BORDER: Record<string, string> = {
  easy:     "rgba(34, 197, 94, 0.55)",
  moderate: "rgba(59, 130, 246, 0.55)",
  hard:     "rgba(249, 115, 22, 0.60)",
  extreme:  "rgba(220, 38, 38, 0.65)",
};

export default async function Image({ params }: { params: { id: string } }) {
  const trail = TRAIL_BY_ID[params.id];

  // Fallback for missing-trail (should be rare — generateStaticParams covers
  // all known ids, but defensive in case of stale links).
  if (!trail) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a1612",
            color: "white",
            fontSize: 64,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Trailspark
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background:
            "linear-gradient(135deg, #0a1612 0%, #14271e 50%, #1f3a2c 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top row — brand mark, park unit, difficulty pill */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21L9.5 6L13.5 14L17 10L22 21H2Z" stroke="#c4d4c8" strokeWidth="1.6" strokeLinejoin="round" fill="#a0bda8" fillOpacity="0.55" />
              <path d="M18 2.5L19.1 4.9L21.5 6L19.1 7.1L18 9.5L16.9 7.1L14.5 6L16.9 4.9Z" fill="#e3ece5" />
            </svg>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>Trailspark</div>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              padding: "10px 18px",
              borderRadius: 999,
              background: DIFFICULTY_BG[trail.difficulty] ?? "rgba(255,255,255,0.08)",
              border: `1px solid ${DIFFICULTY_BORDER[trail.difficulty] ?? "rgba(255,255,255,0.2)"}`,
              color: "white",
            }}
          >
            {DIFFICULTY_LABEL[trail.difficulty]}
          </div>
        </div>

        {/* Middle — park unit (eyebrow) + trail name (huge) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#a0bda8",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {trail.parkUnit}
          </div>
          <div
            style={{
              fontSize: trail.name.length > 30 ? 72 : 92,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.02,
              maxWidth: 1040,
            }}
          >
            {trail.name}
          </div>
        </div>

        {/* Bottom — stats row */}
        <div style={{ display: "flex", gap: 56, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 56 }}>
            <Stat label="Distance" value={`${trail.lengthMiles} mi`} />
            <Stat label="Elevation" value={`${trail.elevationGainFt.toLocaleString()} ft`} />
            <Stat label="Type" value={trail.type === "thru-hike" ? "Thru-hike" : trail.type === "multi-day" ? "Multi-day" : "Day hike"} />
          </div>
          <div style={{ color: "rgba(160, 189, 168, 0.95)", fontWeight: 600, fontSize: 20 }}>
            trailspark.xyz
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: "white" }}>{value}</div>
    </div>
  );
}
