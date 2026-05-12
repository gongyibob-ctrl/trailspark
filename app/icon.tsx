// Generates the favicon at build time from the same SVG shapes used in
// components/Logo.tsx. Keeps the brand identity consistent everywhere.
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
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 20L10 7L14 14L17 11L21 20H3Z"
            stroke="#a0bda8"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="#a0bda8"
            fillOpacity="0.25"
          />
          <path
            d="M17.5 3L18.15 4.35L19.5 5L18.15 5.65L17.5 7L16.85 5.65L15.5 5L16.85 4.35Z"
            fill="#a0bda8"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
