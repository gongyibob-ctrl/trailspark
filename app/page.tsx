import type { Metadata } from "next";
import Link from "next/link";
import { TRAIL_BY_ID, CURATED_TRAILS } from "@/lib/trails";
import { IMPORTED_TRAILS } from "@/lib/trails-imported";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { LandingTripWizard } from "@/components/LandingTripWizard";
import { TrailCard } from "@/components/TrailCard";
import { FEATURED_IDS } from "@/lib/featured";
import featuredCoords from "@/lib/featured-coords.json";
import { Compass, MapPin, MessageSquare, Sparkles } from "lucide-react";

// TODO: swap with an NPS public-domain photo (commercial-safe, no
// attribution required) — Half Dome at sunset fits the positioning.
const HERO_PHOTO_BASE = "https://images.unsplash.com/photo-1503614472-8c93d56e92ce";
const heroPhotoAt = (w: number) => `${HERO_PHOTO_BASE}?w=${w}&fm=webp&q=78&auto=format`;
const HERO_PHOTO_URL    = heroPhotoAt(2400);
const HERO_PHOTO_SRCSET = [800, 1200, 1800, 2400].map((w) => `${heroPhotoAt(w)} ${w}w`).join(", ");
const HERO_PHOTO_CREDIT = "Photo: Bailey Zindel / Unsplash";

export const metadata: Metadata = {
  title: `${SITE_NAME} — AI-designed West Coast hiking trips for visitors`,
  description:
    "Visiting California, Oregon, or Washington? Tell us your dates. Our AI designs your complete multi-day hiking trip — trails, drives, permits, gear — in 24 hours. Free during beta.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI-designed hiking trips for the US West Coast`,
    description:
      "You don't know the West Coast. We do. Tell us your dates — our AI designs the trip.",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: `${SITE_NAME} — Custom West Coast hiking trip planning`,
  provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  areaServed: [
    { "@type": "AdministrativeArea", name: "California" },
    { "@type": "AdministrativeArea", name: "Oregon" },
    { "@type": "AdministrativeArea", name: "Washington" },
  ],
  description:
    "Personalized hiking trip itineraries for the US West Coast. Trails, permits, parking, drives, gear, day-by-day plan delivered within 24 hours.",
};

export default function LandingPage() {
  const featured = FEATURED_IDS.map((id) => TRAIL_BY_ID[id]).filter(Boolean);

  return (
    <main className="min-h-screen bg-[#0a1612] text-white/90">
      {/* Preload the hero LCP image; the preloader needs srcset/sizes too,
          otherwise mobile downloads the 2400px version then again at the
          right width. */}
      <link
        rel="preload"
        as="image"
        href={HERO_PHOTO_URL}
        imageSrcSet={HERO_PHOTO_SRCSET}
        imageSizes="100vw"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      {/* dvh fallback so iOS Safari's collapsing address bar doesn't
          leave a gap at the bottom of the hero. */}
      <section
        id="plan"
        className="relative flex items-center overflow-hidden border-b border-white/[0.06] min-h-[calc(100vh-3.5rem)] [min-height:calc(100dvh-3.5rem)]"
      >
        <img
          src={HERO_PHOTO_URL}
          srcSet={HERO_PHOTO_SRCSET}
          sizes="100vw"
          alt=""
          aria-hidden
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,22,18,0.75) 0%, rgba(10,22,18,0.30) 55%, rgba(10,22,18,0.22) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,22,18,0.15) 0%, rgba(10,22,18,0.60) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
          {/* Heavy multi-layer text-shadow on every hero string — Moraine
              Lake's bright halves (water reflection, sky) wash out plain
              white at the photo's middle. */}
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest-200 sm:text-[12px]"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}
          >
            AI-designed hiking trips · For visitors to the US West Coast
          </p>
          <h1
            className="mt-3 font-display text-[40px] leading-[1.04] tracking-tight text-white sm:mt-4 sm:text-[56px] sm:leading-[1.02] lg:text-[72px]"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.45)" }}
          >
            You don't know the West Coast.
            <br />
            <span className="text-forest-200">We do.</span>
          </h1>
          <p
            className="mt-5 max-w-2xl text-[15px] font-medium leading-relaxed text-white sm:mt-6 sm:text-[17px]"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)" }}
          >
            Tell us your dates. Our AI picks the trails, plans the drives,
            handles permits and gear — and emails you a complete day-by-day
            plan within 24 hours.
          </p>
          <div className="mt-6 max-w-2xl sm:mt-8">
            <LandingTripWizard source="landing-hero" />
          </div>
          <div
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] font-medium text-white/85 sm:mt-10 sm:text-[13px]"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
          >
            <Link href="/map" className="inline-flex items-center gap-1.5 hover:text-white">
              <MapPin className="h-4 w-4" /> Explore the map
            </Link>
            <Link href="/trails" className="inline-flex items-center gap-1.5 hover:text-white">
              <Compass className="h-4 w-4" /> Browse {CURATED_TRAILS.length + IMPORTED_TRAILS.length} trails
            </Link>
          </div>
        </div>

        <div className="absolute bottom-2 right-3 z-10 text-[10px] text-white/35">
          {HERO_PHOTO_CREDIT}
        </div>
      </section>

      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-forest-300/90">
            What we do differently
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <ValueCard
              icon={<Sparkles className="h-5 w-5 text-forest-300" />}
              title="You don't pick the trails"
              body={`Tell us when you're coming and what kind of trip you want. Our AI matches you to ${CURATED_TRAILS.length} hand-curated and ${IMPORTED_TRAILS.length.toLocaleString()} community-mapped routes — by your fitness, group, and preferences.`}
            />
            <ValueCard
              icon={<Compass className="h-5 w-5 text-forest-300" />}
              title="Logistics, solved"
              body="Permit lotteries, parking lots that fill by 7am, drive times honest about traffic, gear lists by season and elevation, food estimates by mileage. The 8 hours of research you don't have to do."
            />
            <ValueCard
              icon={<MessageSquare className="h-5 w-5 text-forest-300" />}
              title="Plans that adapt"
              body="We're on text the whole trip. Weather changes, snow lingers, you're tired — we re-route on the fly so you're not stuck with a stale PDF."
            />
          </div>
        </div>
      </section>

      {/* Coords pre-extracted into lib/featured-coords.json so we don't
          ship the 7 MB simplified geometries bundle for 6 cards. */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-forest-300">
              Trails we know well
            </h2>
            <Link href="/trails" className="text-[13px] text-white/55 hover:text-white">
              Browse all →
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <li key={t.id}>
                <TrailCard
                  trail={t}
                  coords={(featuredCoords as Record<string, number[][]>)[t.id]}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-forest-300/90">
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            <Step n="1" title="Tell us your dates and style">
              Email + duration + region (or "open"). Your fitness, group,
              what you want from the trip. No trail picks needed — we handle that.
            </Step>
            <Step n="2" title="AI designs your plan">
              Within 24 hours: a complete day-by-day with trail picks, drives,
              permits, parking, gear, food. Reply with anything to refine.
            </Step>
            <Step n="3" title="We adapt as you go">
              Weather, permits, snow, your knees — we're on text the whole trip.
              You get a plan that survives contact with reality.
            </Step>
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-2xl border border-forest-300/20 bg-gradient-to-br from-forest-500/[0.10] to-ember-500/[0.05] p-8 text-center sm:p-12">
          <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">
            Ready to plan?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/70">
            Free during beta · we're hand-onboarding our first 50 trips. Tell us
            your dates and we'll send a plan within 24 hours.
          </p>
          <Link
            href="/#plan"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-forest-400 px-6 py-3 text-[15px] font-bold text-black transition hover:bg-forest-300"
          >
            Start planning my trip →
          </Link>
        </div>

        <nav className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-6 text-[12.5px] text-white/45">
          <Link href="/map" className="hover:text-white/80">Map</Link>
          <Link href="/trails" className="hover:text-white/80">All trails</Link>
          <a href={`${SITE_URL}/sitemap.xml`} className="hover:text-white/80">Sitemap</a>
          <span className="ml-auto">© {new Date().getFullYear()} {SITE_NAME}</span>
        </nav>
      </section>
    </main>
  );
}

function ValueCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-500/[0.15]">
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">{body}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-500/20 text-[13px] font-semibold text-forest-200">
        {n}
      </div>
      <h3 className="mt-3 text-[15.5px] font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/65">{children}</p>
    </li>
  );
}
