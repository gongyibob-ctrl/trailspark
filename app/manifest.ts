// PWA manifest — lets iOS / Android users "Add to home screen" and
// Chrome show install prompts. Mostly an SEO + brand-consistency hygiene
// step; we don't pretend to be a full PWA (no service worker, no offline).
import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a1612",
    theme_color: "#0a1612",
    icons: [
      { src: "/icon",        sizes: "32x32",   type: "image/png" },
      { src: "/apple-icon",  sizes: "180x180", type: "image/png" },
    ],
    categories: ["travel", "lifestyle", "navigation"],
  };
}
