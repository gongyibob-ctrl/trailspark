import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trailspark — Custom hiking trip plans for the US West Coast",
    template: "%s · Trailspark",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    // What we are (v4 positioning)
    "hiking trip planner",
    "West Coast hiking trip",
    "custom hiking itinerary",
    "national parks trip planning",
    "multi-day hiking trip",
    "hiking trip concierge",
    // Where
    "California hiking trip",
    "Oregon hiking trip",
    "Washington hiking trip",
    "Yosemite trip planning",
    "Mt Rainier itinerary",
    "Olympic National Park trip",
    "Crater Lake hiking",
    "Pacific Crest Trail planning",
    "John Muir Trail planning",
    // Long-tail intent
    "how to plan a Yosemite trip",
    "first time hiking California",
    "PCT permit help",
    "Half Dome permit lottery",
    "backpacking trip planning service",
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
    title: "Trailspark — Custom hiking trip plans for the US West Coast",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trailspark — Custom hiking trip plans for the US West Coast",
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
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/trails?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// Brand identity for Google Knowledge Panel / search rich results.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/apple-icon`,
  description:
    "Hand-crafted multi-day hiking trip plans for visitors to the US West Coast — California, Oregon, Washington. Trails, permits, drives, gear, all in one plan delivered in 24 hours.",
  areaServed: [
    { "@type": "AdministrativeArea", name: "California" },
    { "@type": "AdministrativeArea", name: "Oregon" },
    { "@type": "AdministrativeArea", name: "Washington" },
  ],
  knowsAbout: [
    "hiking", "backpacking", "national parks",
    "trail planning", "permit lotteries", "trip itineraries",
    "Yosemite", "Mount Rainier", "Olympic National Park",
    "Crater Lake", "Pacific Crest Trail", "John Muir Trail",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
