// Site-wide Open Graph image — what shows when trailspark.xyz is shared
// on Twitter, iMessage, Slack, Discord, etc. v4 positioning copy +
// inline brand SVG (no emoji — looks unprofessional in previews).
import { ImageResponse } from "next/og";

export const alt =
  "Trailspark — hand-crafted hiking trips for visitors to the US West Coast";
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
          padding: "72px 88px",
          background:
            "linear-gradient(135deg, #0a1612 0%, #14271e 45%, #1f3a2c 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top — brand mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 21L9.5 6L13.5 14L17 10L22 21H2Z"
              stroke="#c4d4c8"
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill="#a0bda8"
              fillOpacity="0.55"
            />
            <path
              d="M18 2.5L19.1 4.9L21.5 6L19.1 7.1L18 9.5L16.9 7.1L14.5 6L16.9 4.9Z"
              fill="#e3ece5"
            />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Trailspark
          </div>
        </div>

        {/* Center — positioning tagline. Each headline row is a separate
            div because Satori (the @vercel/og renderer) needs explicit
            display:flex on multi-child divs and <br> doesn't behave there. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.02,
              maxWidth: 1040,
            }}
          >
            <div>You don't know</div>
            <div style={{ color: "#a0bda8" }}>the West Coast.</div>
            <div>We do.</div>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: 980,
              lineHeight: 1.4,
            }}
          >
            Tell us your dates. We hand-craft a multi-day hiking trip — trails,
            permits, drives, gear — and reply within 24 hours.
          </div>
        </div>

        {/* Bottom — regions + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "rgba(255, 255, 255, 0.55)",
            fontSize: 22,
          }}
        >
          <div>California · Oregon · Washington</div>
          <div style={{ color: "rgba(160, 189, 168, 0.95)", fontWeight: 600 }}>
            trailspark.xyz
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
