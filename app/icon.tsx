// Browser-tab favicon (32x32). Same brand shapes as components/Logo.tsx
// but scaled up to fill the viewport — a 24x24 SVG inside a 32x32 frame
// shrinks to ~12px detail at 16x16 device rendering, which is illegible.
// At full-bleed 28x28 the peaks read clearly even at 16x16.
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a1612",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Mountain peaks — beefier stroke + higher fill for small-size legibility */}
          <path
            d="M2 21L9.5 6L13.5 14L17 10L22 21H2Z"
            stroke="#a0bda8"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#a0bda8"
            fillOpacity="0.45"
          />
          {/* Spark — slightly larger 4-point star, fully opaque so it survives at 16x16 */}
          <path
            d="M18 3L18.85 4.65L20.5 5.5L18.85 6.35L18 8L17.15 6.35L15.5 5.5L17.15 4.65Z"
            fill="#c4d4c8"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
