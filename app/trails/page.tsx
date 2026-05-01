import type { Metadata } from "next";
import Link from "next/link";
import { TRAILS } from "@/lib/trails";
import type { Region } from "@/lib/types";
import { SITE_URL } from "@/lib/site";
import { DIFFICULTY_LABEL, REGION_LABEL } from "@/lib/labels";

const REGION_ORDER: Region[] = [
  "yosemite-sierra",
  "rainier",
  "north-cascades",
  "olympic",
  "oregon",
  "norcal",
  "bigsur-bay",
  "socal-desert",
  "thru-hike",
];

export const metadata: Metadata = {
  title: "All trails — directory of 75 West Coast hikes",
  description:
    "Browse every hike on Trailspark — 75 hand-curated trails across Yosemite, Mt Rainier, Olympic, Crater Lake, Joshua Tree, and the Pacific Crest Trail, grouped by region.",
  alternates: { canonical: `${SITE_URL}/trails` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/trails`,
    title: "All trails — Trailspark directory",
    description:
      "75 hand-curated West Coast hiking trails: stats, weather, parking, permits, and elevation profiles.",
    siteName: "Trailspark",
  },
};

export default function TrailsIndex() {
  const byRegion: Record<Region, typeof TRAILS> = {
    "yosemite-sierra": [],
    rainier: [],
    olympic: [],
    "north-cascades": [],
    oregon: [],
    norcal: [],
    "socal-desert": [],
    "bigsur-bay": [],
    "thru-hike": [],
  };
  for (const t of TRAILS) byRegion[t.region].push(t);
  for (const r of Object.keys(byRegion) as Region[]) {
    byRegion[r].sort((a, b) => b.scenery - a.scenery || a.name.localeCompare(b.name));
  }

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trailspark hiking trail directory",
    numberOfItems: TRAILS.length,
    itemListElement: TRAILS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/trails/${t.id}`,
      name: t.name,
    })),
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-white/90">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <header className="mb-10">
        <Link
          href="/"
          className="text-[12px] text-white/45 hover:text-white/75"
        >
          ← Back to map
        </Link>
        <h1 className="mt-2 font-display text-4xl text-white">All trails</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/65">
          {TRAILS.length} hand-curated West Coast hiking routes — from short interpretive loops
          to multi-week thru-hikes. Grouped by region. Click any trail for a full guide with
          stats, parking, permits, weather averages, and the route on an interactive map.
        </p>
      </header>

      {REGION_ORDER.map((region) => {
        const trails = byRegion[region];
        if (trails.length === 0) return null;
        return (
          <section key={region} className="mb-10">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-200/85">
              {REGION_LABEL[region]} · {trails.length}
            </h2>
            <ul className="space-y-1">
              {trails.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/trails/${t.id}`}
                    className="group flex items-baseline justify-between gap-3 rounded-md px-3 py-2 ring-1 ring-transparent transition hover:bg-white/[0.04] hover:ring-white/10"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium text-white group-hover:text-forest-200">
                        {t.name}
                      </div>
                      <div className="truncate text-[11.5px] text-white/50">{t.parkUnit}</div>
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-white/55">
                      <div>
                        {t.lengthMiles} mi · {t.elevationGainFt.toLocaleString()} ft
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">
                        {DIFFICULTY_LABEL[t.difficulty]} ·{" "}
                        <span className="text-amber-300">{"★".repeat(t.scenery)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <footer className="mt-12 border-t border-white/8 pt-6 text-[12px] text-white/45">
        <Link href="/" className="hover:text-white/75">
          ← Back to interactive map
        </Link>
      </footer>
    </main>
  );
}
