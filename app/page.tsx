import type { Metadata } from "next";
import Link from "next/link";
import { TRAIL_BY_ID, CURATED_TRAILS } from "@/lib/trails";
import { IMPORTED_TRAILS } from "@/lib/trails-imported";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { LandingHeroForm } from "@/components/LandingHeroForm";
import { Compass, MapPin, MessageSquare, Sparkles } from "lucide-react";

// Featured trails for the homepage grid. Hand-picked for visual variety and
// name recognition across all West Coast regions.
const FEATURED_IDS = [
  "half-dome",
  "skyline-paradise",
  "hurricane-hill",
  "garfield-peak",
  "fern-canyon",
  "ryan-mountain",
];

export const metadata: Metadata = {
  title: `${SITE_NAME} — Custom hiking trip plans for the US West Coast`,
  description:
    "Get a hand-crafted West Coast hiking trip plan in 24 hours. Trails, permits, parking, drives, gear — solved. Free during beta. Yosemite, Mt Rainier, Olympic, Crater Lake, Joshua Tree and 1,700+ named routes.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Custom hiking trip plans for the US West Coast`,
    description:
      "Stop spending 8 hours juggling tabs to plan a hiking trip. We hand-craft your day-by-day — trails, permits, drives, gear — in 24h.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      {/* HERO */}
      <section id="plan" className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
          style={{
            background:
              "radial-gradient(60% 60% at 70% 20%, #547d62 0%, transparent 60%), radial-gradient(60% 50% at 20% 80%, #ee7e3e 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-forest-300/90">
            Personalized hiking trip planning · West Coast
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl">
            AllTrails shows you where.
            <br />
            <span className="text-forest-200">We tell you how.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70">
            Tell us when you're going. We hand-craft your day-by-day plan —
            trails, permits, parking, drives, gear — and reply within 24 hours.
            Currently free while we shape the product with our first users.
          </p>
          <div className="mt-8 max-w-xl">
            <LandingHeroForm />
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/55">
            <Link href="/map" className="inline-flex items-center gap-1.5 hover:text-white">
              <MapPin className="h-4 w-4" /> Explore the map
            </Link>
            <Link href="/trails" className="inline-flex items-center gap-1.5 hover:text-white">
              <Compass className="h-4 w-4" /> Browse {CURATED_TRAILS.length + IMPORTED_TRAILS.length} trails
            </Link>
          </div>
        </div>
      </section>

      {/* WHY US — 3 VALUE PROPS */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-forest-300/90">
            What we do differently
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <ValueCard
              icon={<Sparkles className="h-5 w-5 text-forest-300" />}
              title="Curated, not crowdsourced"
              body={`${CURATED_TRAILS.length} hand-picked routes with full editorial — scenery rated, parking notes, season tested. Plus ${IMPORTED_TRAILS.length.toLocaleString()} community routes from OpenStreetMap.`}
            />
            <ValueCard
              icon={<Compass className="h-5 w-5 text-forest-300" />}
              title="Logistics, solved"
              body="Permit lotteries, parking lots that fill by 7am, gear lists by season and elevation, food estimates by mileage, drive times honest about traffic."
            />
            <ValueCard
              icon={<MessageSquare className="h-5 w-5 text-forest-300" />}
              title="Plans that adapt"
              body="We're on text the whole trip. Weather changes, lottery results drop, snow lingers — we re-route in real time so you're not stuck with a stale PDF."
            />
          </div>
        </div>
      </section>

      {/* FEATURED TRAILS GRID */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-forest-300/90">
              Trails we know well
            </h2>
            <Link href="/trails" className="text-[13px] text-white/55 hover:text-white">
              Browse all →
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/trails/${t.id}`}
                  className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-forest-300/30 hover:bg-white/[0.04]"
                >
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-forest-300/85">
                    {t.parkUnit}
                  </div>
                  <div className="mt-1.5 text-[17px] font-semibold text-white group-hover:text-forest-100">
                    {t.name}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[12px] text-white/55">
                    <span>{t.lengthMiles} mi</span>
                    <span className="text-white/20">·</span>
                    <span>{t.elevationGainFt.toLocaleString()} ft gain</span>
                    {t.scenery != null && (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="text-amber-300">{"★".repeat(t.scenery)}</span>
                      </>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-forest-300/90">
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            <Step n="1" title="Tell us when and who">
              Drop your email + a one-liner about the trip. Dates, group size,
              fitness level, vibe — whatever you've got.
            </Step>
            <Step n="2" title="We hand-craft the plan">
              Within 24 hours: a complete day-by-day with trails, permits,
              parking, drives, gear, food. Reply with anything to refine.
            </Step>
            <Step n="3" title="We adapt as you go">
              Weather, permits, conditions — we're on text the whole trip.
              You get a plan that survives contact with reality.
            </Step>
          </ol>
        </div>
      </section>

      {/* FOOTER CTA + LINKS */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-2xl border border-forest-300/20 bg-gradient-to-br from-forest-500/[0.10] to-ember-500/[0.05] p-8 sm:p-10">
          <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">
            Ready to plan your next trip?
          </h2>
          <p className="mt-3 max-w-xl text-[15px] text-white/70">
            Free during beta. Limited to our first 50 users — help us shape
            the product and you'll get our most attentive plans.
          </p>
          <div className="mt-6 max-w-lg">
            <LandingHeroForm />
          </div>
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
