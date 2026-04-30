import type { Metadata, Viewport } from "next";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

const SITE_URL = "https://trailspark.xyz";
const SITE_NAME = "Trailspark";
const SITE_DESCRIPTION =
  "An interactive map of 75 hand-curated hiking trails on the US West Coast — Yosemite, Mt Rainier, Olympic, Crater Lake, Joshua Tree and more. Real weather averages, gear lists by season, permit info, and elevation profiles.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trailspark — Hiking Trail Map for the US West Coast",
    template: "%s · Trailspark",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "hiking trails",
    "West Coast hiking",
    "California hiking",
    "Oregon hiking",
    "Washington hiking",
    "Yosemite hiking",
    "Mt Rainier hiking",
    "Olympic National Park",
    "Crater Lake",
    "Joshua Tree",
    "Pacific Crest Trail",
    "John Muir Trail",
    "Half Dome",
    "trail map",
    "hike planner",
    "elevation profile",
    "trail weather",
    "hiking permits",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Trailspark — Hiking Trail Map for the US West Coast",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trailspark — Hiking Trail Map for the US West Coast",
    description: SITE_DESCRIPTION,
  },
  category: "travel",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a1612",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: ["en", "zh"],
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
