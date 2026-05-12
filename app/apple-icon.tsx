// Apple touch icon — 180x180 for iOS Safari home-screen bookmarks and
// iMessage / WhatsApp link previews. Larger canvas means we can give
// the brand mark more breathing room and a richer color treatment.
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #14271e 0%, #1f3a2c 60%, #2c4a35 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Soft glow behind the peaks */}
          <ellipse cx="12" cy="16" rx="11" ry="4.5" fill="#a0bda8" fillOpacity="0.18" />
          {/* Peaks */}
          <path
            d="M2 21L9.5 6L13.5 14L17 10L22 21H2Z"
            stroke="#c4d4c8"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="#a0bda8"
            fillOpacity="0.55"
          />
          {/* Spark */}
          <path
            d="M18 2.5L19.1 4.9L21.5 6L19.1 7.1L18 9.5L16.9 7.1L14.5 6L16.9 4.9Z"
            fill="#e3ece5"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
