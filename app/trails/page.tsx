import type { Metadata } from "next";
import Link from "next/link";
import { TRAILS, CURATED_TRAILS } from "@/lib/trails";
import { IMPORTED_TRAILS } from "@/lib/trails-imported";
import type { Region, Trail } from "@/lib/types";
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
  title: `All trails — ${CURATED_TRAILS.length} hand-curated + ${IMPORTED_TRAILS.length} community West Coast hikes`,
  description:
    `Browse every hike on Trailspark — ${CURATED_TRAILS.length} hand-curated trails plus ${IMPORTED_TRAILS.length} community routes across Yosemite, Mt Rainier, Olympic, Crater Lake, Joshua Tree, and the Pacific Crest Trail, grouped by region.`,
  alternates: { canonical: `${SITE_URL}/trails` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/trails`,
    title: "All trails — Trailspark directory",
    description:
      `${CURATED_TRAILS.length} hand-curated West Coast hiking trails with full editorial, plus ${IMPORTED_TRAILS.length} community routes for deeper exploration.`,
    siteName: "Trailspark",
  },
};

// Featured by scenery rating (rated first, alpha within tier).
// Imported has no scenery; sort by length descending so anchors (long thru-hikes,
// big classics) surface at the top of the collapsed section.
function sortFeatured(a: Trail, b: Trail) {
  const sa = a.scenery ?? -1;
  const sb = b.scenery ?? -1;
  return sb - sa || a.name.localeCompare(b.name);
}
function sortImported(a: Trail, b: Trail) {
  return b.lengthMiles - a.lengthMiles || a.name.localeCompare(b.name);
}

function TrailRow({ trail }: { trail: Trail }) {
  return (
    <li>
      <Link
        href={`/trails/${trail.id}`}
        className="group flex items-baseline justify-between gap-3 rounded-md px-3 py-2 ring-1 ring-transparent transition hover:bg-white/[0.04] hover:ring-white/10"
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium text-white group-hover:text-forest-200">
            {trail.name}
          </div>
          <div className="truncate text-[11.5px] text-white/50">{trail.parkUnit}</div>
        </div>
        <div className="shrink-0 text-right text-[11px] text-white/55">
          <div>
            {trail.lengthMiles} mi · {trail.elevationGainFt.toLocaleString()} ft
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">
            {DIFFICULTY_LABEL[trail.difficulty]} ·{" "}
            {trail.scenery != null ? (
              <span className="text-amber-300">{"★".repeat(trail.scenery)}</span>
            ) : (
              <span className="text-white/20">☆☆☆☆☆</span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function TrailsIndex() {
  // Bucket featured vs imported per region.
  const featuredByRegion = {} as Record<Region, Trail[]>;
  const importedByRegion = {} as Record<Region, Trail[]>;
  for (const r of REGION_ORDER) {
    featuredByRegion[r] = [];
    importedByRegion[r] = [];
  }
  for (const t of TRAILS) {
    (t.tier === "imported" ? importedByRegion : featuredByRegion)[t.region].push(t);
  }
  for (const r of REGION_ORDER) {
    featuredByRegion[r].sort(sortFeatured);
    importedByRegion[r].sort(sortImported);
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
        <Link href="/" className="text-[12px] text-white/45 hover:text-white/75">
          ← Back to map
        </Link>
        <h1 className="mt-2 font-display text-4xl text-white">All trails</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/65">
          {CURATED_TRAILS.length} hand-curated West Coast hikes with full editorial — stats,
          parking, permits, weather averages, Chinese translations. Plus {IMPORTED_TRAILS.length}{" "}
          community routes from OpenStreetMap for deeper exploration of every park.
        </p>
      </header>

      {REGION_ORDER.map((region) => {
        const featured = featuredByRegion[region];
        const imported = importedByRegion[region];
        if (featured.length === 0 && imported.length === 0) return null;
        return (
          <section key={region} className="mb-10">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-200/85">
              {REGION_LABEL[region]} · {featured.length + imported.length}
            </h2>
            {featured.length > 0 && (
              <ul className="space-y-1">
                {featured.map((t) => <TrailRow key={t.id} trail={t} />)}
              </ul>
            )}
            {imported.length > 0 && (
              <details className="group mt-2 rounded-md ring-1 ring-white/[0.06]">
                <summary className="cursor-pointer select-none px-3 py-2 text-[11.5px] text-white/55 hover:text-white/80">
                  <span className="text-white/70 group-open:text-white/85">
                    Show {imported.length} more community route{imported.length === 1 ? "" : "s"} in {REGION_LABEL[region]}
                  </span>
                  <span className="ml-2 text-white/30 group-open:hidden">▾</span>
                  <span className="ml-2 hidden text-white/30 group-open:inline">▴</span>
                </summary>
                <ul className="space-y-1 px-1 pb-2 pt-1">
                  {imported.map((t) => <TrailRow key={t.id} trail={t} />)}
                </ul>
              </details>
            )}
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
