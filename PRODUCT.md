# Product Strategy

A living doc capturing what this product is, where it's headed, and the
reasoning behind the calls we've made. Read this first when resuming work
or onboarding a new collaborator (human or Claude session).

Last updated: 2026-05-11

---

## TL;DR

We're building a **hiking trip concierge for the US outdoor market**. Three
layers stacked over time:

1. **Free browse layer** — a high-quality hiking-trail catalog for the US
   West Coast (currently 75 hand-curated + 1,707 OSM-imported = 1,782
   trails). SEO + discovery flywheel.
2. **Paid trip planner** — AI agent designs a complete itinerary for a
   user's specific trip (parks, dates, fitness, lodging, drives, gear).
   $129/trip or $249/year.
3. **Paid SMS companion** — bundled with the planner. Proactive
   notifications + two-way conversation throughout the trip. This is the
   moat: not the plan itself, but the operational intelligence around it.

Target market: **English-speaking American outdoor enthusiasts** with WTP
$129–299, not Chinese consumers (low WTP). Chinese diaspora in the US is a
welcome bonus segment — they can use the English product.

Positioning line: **"AllTrails shows you where. We tell you how."**

---

## Positioning evolution

| Phase | Tagline | What it is |
|---|---|---|
| Original | "Hiking map for the West Coast" | A data tool |
| After OSM import | "Plan your West Coast hiking trip" | A planning service |
| **Current** | **"Your personal hiking concierge"** | A relationship that lasts the whole trip |

The Concierge framing matters because:
- It's a service category Americans understand ($$$ acceptable)
- It respects user autonomy (advisory, not directive)
- It evokes high-touch — and SMS companion makes it literally true

---

## Free tier — current state

### Trail catalog
- **75 hand-curated trails** (`lib/trails.ts`, `lib/trails-zh.ts`)
  - Full editorial: scenery rating, description, highlights, parking notes,
    Chinese translations
  - Marked `tier: "featured"` in the schema
- **1,707 OSM-imported trails** (`lib/trails-imported.json` →
  `lib/trails-imported.ts` exporting `IMPORTED_TRAILS`)
  - Auto-derived: difficulty, type, popularity (Wikipedia-tag-aware),
    templated description, elevation gain via USGS NED 10m DEM
  - `scenery: null` — grayed stars + "Be the first to rate"
  - `tier: "imported"`, `source: { osmId, wikipedia? }`
  - English-only; Chinese mode falls back to English

### Data pipeline (`scripts/`)
1. `fetch-osm-trails.mjs` — pull named hiking routes + ways from OSM by
   park boundary. Filters out fire roads, climbing approaches, MTB paths.
2. `enrich-osm-trails.mjs` — derive difficulty/type/popularity, fill park
   config (region, state, ecosystem, seasons). Writes `enriched-*.json`.
3. `elevation-pass.mjs` — sample geometries at ~100m, hit Open Topo Data
   USGS NED 10m DEM, compute cumulative gain. Caches raw elevations so
   algorithm tweaks don't burn API calls. Within ±20% of AllTrails truth.
4. `merge-imported.mjs` — collapse all enriched-*.json into one file,
   merge geometries into `lib/geometries.json`, regenerate the simplified
   `public/geometries.json`.

Parks covered: Yosemite, Sequoia, Kings Canyon, Mt Rainier, Olympic,
North Cascades, Crater Lake, Lassen, Joshua Tree, Death Valley, Pinnacles,
Channel Islands, Redwood, Point Reyes, Mt Hood NF.

### Two-tier UX strategy (not yet shipped)

The 1,782 trails are NOT a flat list. Imported trails are a *discovery
layer*, not a primary product.

| Surface | Featured (75) | Imported (1,707) |
|---|---|---|
| Map (default zoom) | Full-color pins | Hidden |
| Map (zoom > 11) | Full-color pins | Small gray pins, fade in |
| /trails index | Primary list, by region | Collapsed "More in this region" section |
| Trail detail page | Full editorial | Skeleton + "Community route — help improve" badge |
| Search | Top results | Below featured, also returned |
| Geometry loading | Ships in `public/geometries.json` eager | Lazy-fetched per trail on detail open |

This preserves the editorial product (75 hand-picked great hikes) while
giving long-tail SEO and planner-inventory coverage.

---

## Paid tier — AI Trip Concierge (not yet built)

### What the user buys
Not a PDF. Not a chatbot. **A relationship that runs from "I'm thinking
about a trip" to "I'm back home, refreshed."**

### Three phases of the trip experience

**Planning (T-30 days to T-1 day)**
- User answers 3–5 intake questions (when, who, fitness, vibe)
- Agent drafts a complete itinerary: trails, drives, lodging, permits,
  gear list, food, total cost
- User reacts; agent iterates (30-day unlimited revisions included)
- Outputs: shareable plan page + Google Maps/Gaia exports + printable
  brief

**Trip companion (T-1 day to T+0)**
- T-24h: tomorrow's brief (weather, departure time, gear last-check)
- T-0 morning: today's plan + adjustments based on conditions
- During trip: two-way SMS for any question
- Weather-aware replanning: "Sunrise has 30mph winds — swap Day 3 to
  Lower Yosemite?"
- Permit/lottery alerts: "You got Cathedral Lakes — add to Day 5?"

**Wrap (T+0 to T+7)**
- Post-trip check-in, photo upload prompt, gear feedback
- Suggestion seed for next year: "Loved Glacier Point? Try Mount Tallac
  next summer."

### The actual moat

Not the AI model. Anyone will have GPT-5 in 12 months. The moat is:
1. **Structured data + tool calls**: RIDB (have), NPS alerts, weather
   (have), Recreation.gov, Open Topo Data (have), permit lottery
   tracking. Connect them all = "professional"; don't = ChatGPT wrapper.
2. **Proactive operational intelligence**: time-aware nudges. AllTrails
   can't do this because it'd require taking opinionated positions, and
   their org structure is "broad and averaging."
3. **Relationship over time**: cross-trip memory ("you said your knees
   bothered you last year") creates dependency over years.

### Pricing

| Tier | Price | What | Target customer |
|---|---|---|---|
| Single Trip | **$129** | Plan + 30-day SMS companion | 1–2 trips/year traveler |
| All-Access | **$249/year** | Unlimited trips | 3+ trips/year enthusiast |
| Premium | **$499/year** | Multi-person coordination + commercial use | Guides, creators |

Per-trip is the conversion default. Subscription is for retention.

### Critical risks

1. **Liability on life-safety decisions.** Agent must REFUSE to give
   directive advice on avalanche conditions, river crossings, severe
   weather. Hard-coded into system prompt + TOS. This is the most
   under-thought area in competitive AI planners and a real lawsuit
   vector. Address from day 1.

2. **Latency in trip context.** User asks "should I bail?" → must get
   useful answer in <30s. Need fast LLM (Claude Haiku for quick replies),
   pre-cached context per active trip.

3. **AllTrails moves first.** 50M users + $200M raised. They COULD ship
   planning if they decide to. Window estimate: 12–18 months. Speed
   matters.

4. **API operational cost.** Each trip = 100–300 messages over the
   companion window. At $0.02/msg avg = $2–6 marginal LLM cost. Plus
   Twilio ~$0.01/msg = $1–3. Total ~$3–9 marginal on a $129 sale.
   Margins fine, but unbounded conversations could blow up — need caps.

---

## Tech stack (planned)

| Layer | Choice |
|---|---|
| App framework | Next.js 14 App Router on Vercel |
| Database | Postgres (Neon or Supabase) |
| LLM | Anthropic Claude (Sonnet for planning, Haiku for fast SMS replies) |
| SMS | Twilio (appears as iMessage on iPhone, SMS on Android) |
| Scheduled jobs | Vercel Cron + Inngest (for stateful workflows) |
| Payments | Stripe |
| Auth | Clerk or Vercel Auth |
| Existing data | RIDB API (`lib/ridb.ts`), Weather (`lib/weather.ts`) — already in repo |

---

## Roadmap

### Phase 1 — Free tier polish (current sprint, ~1–2 weeks of Claude time)
- Geometry double-layer split (curated eager, imported lazy)
- Tier UI: map zoom-dependent reveal, list section split, detail page badge
- Wikipedia description seed for the 35 wiki-linked imports
- Paid CTA placeholders (no payment yet, just UI hooks)
- Index page copy update: "75 hand-curated + 1,707 community routes"

### User work between Phase 1 and Phase 2 (2–3 weeks of Yibo time)
- **Manual concierge test**: handhold 3 friends through real trips via
  iMessage, no code. Validate the value, learn what they actually ask,
  refine intake questions.
- Pick MVP single park (likely Yosemite)
- Hire English outdoor copywriter for brand voice pass ($500–1500)
- Decide pricing test value

### Phase 2 — Paid v1: web planner (6–8 weeks)
- User auth + Stripe checkout
- Trip schema + dashboard
- Planner agent (Yosemite single-park scope)
- Output rendering: shareable plan page + PDF/Google Maps export

### Phase 3 — SMS companion v1: outbound only (4–5 weeks)
- Twilio integration
- Pre-trip 24h brief
- Day-of morning brief
- Post-trip wrap

### Phase 4 — SMS companion v2: two-way agent (5–7 weeks)
- Webhook + reply loop
- Conversation state + per-trip context window management
- Tool calls during trip: weather, conditions, permits

### Phase 5 — Data + ops maturity (5–7 weeks)
- Permit lottery monitoring
- NPS alert ingestion
- Customer support tooling (override / refund / manual takeover)

**Total: ~5–7 months from today to a paid product that's defensibly good.**

---

## Cost estimates

| Phase | Monthly cost |
|---|---|
| Phase 1 (current) | ~$45 (Vercel + DB) |
| Phase 2–5 build | $100–250 (add LLM dev usage, Twilio testing) |
| 100 paying users | $500–1500 |
| Gross margin on $129 sale | ~80% after API + Stripe + Twilio |

---

## Working relationship

**Claude executes ~85%:** code, architecture, prompts, integrations,
database design, deployment. I'm fast and won't tire.

**Yibo drives ~15% but it's the load-bearing 15%:**
- Product decisions (what to build, when, for whom)
- Real user validation (the manual concierge test)
- Brand / voice / copy that converts
- Pricing and market experiments
- Legal review (need a lawyer for TOS / liability)

**Cross-session memory:** I don't remember between sessions. On resume, I
read THIS DOC + `MEMORY.md` first to load context. Keep both fresh.

---

## Open decisions (need Yibo's input)

- [ ] Which single park for MVP? (Yosemite leading)
- [ ] Final pricing: $99 / $129 / $149 per trip?
- [ ] Brand name — keep "Trailspark" or rebrand for the concierge era?
- [ ] When to start paid layer build — after manual concierge test, or
  start prep work in parallel?
- [ ] Geographic scope: launch West Coast only? Expand when?
- [ ] Subscription vs per-trip primary CTA — A/B test plan?

---

## Things we explicitly decided NOT to do

- **Don't market in China.** WTP too low for trip-planning service.
- **Don't translate imported trails to Chinese.** The English fallback is
  an honest tier signal; don't burn budget eliminating it.
- **Don't try to beat AllTrails on browsing/UGC.** That ship sailed. We
  pick a different wedge (planning).
- **Don't ship the imported 1,707 as a flat list.** Two-tier UX or
  nothing.
- **Don't try to be an "AI for everything outdoors."** Narrow: trip
  planning + companion only.
- **Don't auto-generate trail descriptions with LLM at scale.** Google
  will penalize. Template-only for skeleton pages; hand-written or
  Wikipedia-seeded for featured.
- **Don't give directive advice on life-safety questions** in the AI
  agent — refuse and redirect to authorities (NPS, ranger station).
