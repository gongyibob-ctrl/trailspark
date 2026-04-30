import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRAILS, TRAIL_BY_ID } from "@/lib/trails";
import { TRAILS_ZH } from "@/lib/trails-zh";
import { getPermitInfo } from "@/lib/permits";
import { getTrailPOIs } from "@/lib/trail-pois";
import { formatLatLng } from "@/lib/geo";

const SITE_URL = "https://trailspark.xyz";

interface RouteParams {
  params: { id: string };
}

export function generateStaticParams() {
  return TRAILS.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: RouteParams): Metadata {
  const trail = TRAIL_BY_ID[params.id];
  if (!trail) return { title: "Trail not found" };
  const url = `${SITE_URL}/trails/${trail.id}`;
  const title = `${trail.name} — ${trail.parkUnit}`;
  const description = `${trail.description.slice(0, 155).replace(/\s+\S*$/, "")}…`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${trail.name} — Trailspark`,
      description,
      siteName: "Trailspark",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${trail.name} — Trailspark`,
      description,
    },
  };
}

const DIFFICULTY_LABEL = { easy: "Easy", moderate: "Moderate", hard: "Hard", extreme: "Extreme" } as const;
const TYPE_LABEL = { day: "Day hike", "multi-day": "Multi-day backpack", "thru-hike": "Thru-hike" } as const;
const SEASON_LABEL = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" } as const;

export default function TrailPage({ params }: RouteParams) {
  const trail = TRAIL_BY_ID[params.id];
  if (!trail) notFound();
  const url = `${SITE_URL}/trails/${trail.id}`;
  const pois = getTrailPOIs(trail.id);
  const permit = trail.permitRequired ? getPermitInfo(trail.id) : null;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${trail.trailhead.lat},${trail.trailhead.lng}&travelmode=driving`;

  // TouristAttraction is the most search-friendly schema for hiking trails.
  // Includes geo, address-by-region, and a description that Google may
  // surface in rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: trail.name,
    description: trail.description,
    url,
    isAccessibleForFree: !trail.permitRequired,
    publicAccess: true,
    geo: {
      "@type": "GeoCoordinates",
      latitude: trail.trailhead.lat,
      longitude: trail.trailhead.lng,
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: trail.state,
      addressCountry: "US",
    },
    containedInPlace: {
      "@type": "Place",
      name: trail.parkUnit,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Length", value: `${trail.lengthMiles} mi` },
      { "@type": "PropertyValue", name: "Elevation Gain", value: `${trail.elevationGainFt} ft` },
      { "@type": "PropertyValue", name: "Difficulty", value: DIFFICULTY_LABEL[trail.difficulty] },
      { "@type": "PropertyValue", name: "Trail Type", value: TYPE_LABEL[trail.type] },
      { "@type": "PropertyValue", name: "Best Seasons", value: trail.bestSeasons.map((s) => SEASON_LABEL[s]).join(", ") },
      { "@type": "PropertyValue", name: "Scenery Rating", value: `${trail.scenery} / 5` },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: trail.scenery,
      bestRating: 5,
      worstRating: 1,
      ratingCount: 1,
      reviewCount: 1,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trailspark", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: trail.parkUnit },
      { "@type": "ListItem", position: 3, name: trail.name, item: url },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-white/90">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-white/50">
        <Link href="/" className="hover:text-white">
          Trailspark
        </Link>
        <span className="mx-2 text-white/25">/</span>
        <span>{trail.parkUnit}</span>
        <span className="mx-2 text-white/25">/</span>
        <span className="text-white/80">{trail.name}</span>
      </nav>

      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.16em] text-forest-200/80">
          {trail.parkUnit} · {trail.state}
        </div>
        <h1 className="mt-1 font-display text-4xl leading-tight text-white">{trail.name}</h1>
        <p className="mt-3 text-[13px] text-white/55">
          {DIFFICULTY_LABEL[trail.difficulty]} · {TYPE_LABEL[trail.type]} · Best in{" "}
          {trail.bestSeasons.map((s) => SEASON_LABEL[s]).join(", ")}
        </p>
      </header>

      <section className="mb-8 grid grid-cols-3 gap-3 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
        <Stat label="Length" value={`${trail.lengthMiles} mi`} />
        <Stat label="Gain" value={`${trail.elevationGainFt.toLocaleString()} ft`} />
        <Stat label="Scenery" value={"★".repeat(trail.scenery) + "☆".repeat(5 - trail.scenery)} />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
          About this trail
        </h2>
        <p className="text-[15px] leading-relaxed text-white/85">{trail.description}</p>
      </section>

      {trail.highlights.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Highlights
          </h2>
          <ul className="space-y-1.5">
            {trail.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-[14px] text-white/80">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-forest-300" />
                {h}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
          Get there
        </h2>
        <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <div className="text-[13px] text-white/85">
            <strong className="text-white/60">Start:</strong>{" "}
            {trail.trailhead.name ?? "Trailhead"} · {formatLatLng(trail.trailhead.lat, trail.trailhead.lng)}
          </div>
          {trail.endpoint && (
            <div className="mt-1 text-[13px] text-white/85">
              <strong className="text-white/60">End:</strong>{" "}
              {trail.endpoint.name ?? "Endpoint"} · {formatLatLng(trail.endpoint.lat, trail.endpoint.lng)}
            </div>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-blue-500/15 px-3 py-1.5 text-[13px] font-medium text-blue-200 ring-1 ring-blue-400/30 hover:bg-blue-500/25 hover:text-white"
          >
            Open driving directions in Google Maps →
          </a>
          {trail.parking && (
            <p className="mt-3 border-t border-white/8 pt-3 text-[13px] leading-relaxed text-white/70">
              <strong className="text-white/55">Parking:</strong> {trail.parking}
            </p>
          )}
        </div>
      </section>

      {permit && (
        <section className="mb-8">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Permit
          </h2>
          <div className="rounded-xl bg-ember-500/10 p-4 ring-1 ring-ember-400/30">
            <div className="text-[13px] text-white/85">
              <strong className="text-ember-200">{permit.authority.en}</strong>
            </div>
            <p className="mt-1 text-[13px] text-white/75">{permit.window.en}</p>
            <a
              href={permit.url}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-block text-[13px] text-ember-200 underline-offset-2 hover:underline"
            >
              Apply for permit →
            </a>
          </div>
        </section>
      )}

      {pois.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Along the way
          </h2>
          <ul className="space-y-1.5">
            {pois.map((p, i) => (
              <li key={i} className="text-[14px] text-white/75">
                <span className="text-white/85">{p.name}</span>
                {p.m != null && <span className="ml-2 text-[12px] text-white/45">@ mile {p.m}</span>}
                {p.ft != null && (
                  <span className="ml-2 text-[12px] text-white/45">· {p.ft.toLocaleString()} ft</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-12 rounded-xl bg-forest-500/15 p-5 ring-1 ring-forest-400/30">
        <h2 className="text-base font-semibold text-white">Plan your visit on the interactive map</h2>
        <p className="mt-1 text-[13px] text-white/75">
          See {trail.name} on the live Trailspark map alongside weather averages, gear lists, an
          elevation profile, and nearby points of interest.
        </p>
        <Link
          href={`/?trail=${trail.id}`}
          className="mt-3 inline-block rounded-md bg-forest-500/40 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-forest-400/40 hover:bg-forest-500/55"
        >
          Open {trail.name} on the map →
        </Link>
      </section>

      <footer className="border-t border-white/8 pt-6 text-[12px] text-white/40">
        <Link href="/" className="hover:text-white/70">
          ← Back to all 75 West Coast trails
        </Link>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/45">{label}</div>
      <div className="mt-1 text-base font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}
