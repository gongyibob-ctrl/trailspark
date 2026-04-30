import { ImageResponse } from "next/og";

export const alt = "Trailspark — interactive map of West Coast hiking trails";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0a1612 0%, #14271e 45%, #1f3a2c 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(115, 154, 126, 0.35)",
              border: "1px solid rgba(160, 189, 168, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🥾
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Trailspark
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            75 hand-curated hiking trails on the US West Coast
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255, 255, 255, 0.65)",
              maxWidth: 1000,
            }}
          >
            Real weather averages · gear by season · permits · elevation
            profiles · GPS-based nearby trails
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "rgba(255, 255, 255, 0.55)",
            fontSize: 22,
          }}
        >
          <div>Yosemite · Rainier · Olympic · Crater Lake · Joshua Tree</div>
          <div style={{ color: "rgba(160, 189, 168, 0.85)" }}>trailspark.xyz</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
