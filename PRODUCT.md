# Product Strategy

A living doc capturing what this product is, where it's headed, and the
reasoning behind the calls we've made. Read this first when resuming work
or onboarding a new collaborator (human or Claude session).

Last updated: 2026-05-11

---

## TL;DR

**We design hand-crafted multi-day hiking trips for visitors to the US
West Coast.** Our target user *does not know* which trails to do — they
just know they have N days, a region preference, a fitness level, and a
vibe. We pick the trails, plan the drives, handle the permits, and ship
a day-by-day plan in 24 hours.

- Manual-concierge MVP today; AI-augmented later.
- Free browse layer (75 hand-curated + 1,707 community trails) supports
  SEO discovery and gives the human/AI a structured catalog to plan from.
- Paid layer: $99–299 per trip plan, depending on complexity.
- Companion SMS during the trip (planned).

Positioning line: **"You don't know the West Coast. We do."**

---

## What we are NOT

- **Not a day-hike planner.** Planning a single 4-mile hike doesn't
  benefit from AI or human coordination — anyone can do that with
  Google + AllTrails. We don't even surface the "Plan this trip" CTA
  on day-hike pages.
- **Not an AllTrails competitor on browsing/UGC.** They have 50M users,
  decades of reviews, and offline maps. We will lose that fight. We
  pick a different wedge: the *planning service* for people who don't
  know what trails exist.
- **Not a generic travel agent.** We're hiking-first. The trip is
  organized around trails. Hotels, food, drives are in service of the
  hike, not the other way around.

---

## Positioning evolution (why this took several iterations)

| Phase | Tagline | Implicit assumption about user |
|---|---|---|
| v1 | "Hiking map for the West Coast" | User knows a specific trail |
| v2 | "Plan your West Coast hiking trip" | User knows the park / region |
| v3 | "Your personal hiking concierge" | User wants ongoing support |
| **v4 (current)** | **"You don't know the West Coast. We do."** | **User knows nothing — just dates and vibe** |

v4 is the most defensible because it inverts the AllTrails / OnX / Gaia
assumption (user already chose a destination). We serve the people those
products fail: out-of-region visitors who can't pick from 30,000 trails.

---

## Target user — 3 personas, lead with B

| | Persona | Pain | WTP | How to reach |
|---|---|---|---|---|
| **A** | Out-of-state Americans (NYC tech worker, Texas couple) | "I have 2 weeks of PTO, want to do California parks, don't know where to start" | $99–199 | Reddit r/Yosemite r/PNW r/CampingandHiking |
| **B** ⭐ | US-based Asian / Chinese diaspora (Bay Area / Seattle / LA, $200k+ HH income) | Strong vacation discretion, *zero time* to research, want to take parents / partner / kids and look like a thoughtful planner | $99–199 | 小红书 美西公园 tag, WeChat 美国户外群, 朋友圈 |
| **C** | International visitors (mainland China / Europe / Australia honeymoon or family trip) | Severe language barrier on NPS.gov / Recreation.gov, no clue about gear, scared of US wilderness, willing to pay because cost is small fraction of total trip | $199–399 | 小红书, 飞机上看 Trip.com, 携程攻略评论 |

**Why lead with B for validation:**
- Yibo is part of this group → deepest empathy
- Cheap to reach (WeChat groups, 小红书) and language-native
- WTP already validated by other paid services they use ($35/yr AllTrails Pro, $500 hotel rooms, $1500 flights — $99 trip plan fits the mental budget)
- Fast iteration loop (Chinese feedback in real time)

Expand to A after B works. Skip C until A is proven; international payment friction adds complexity.

---

## Free tier — current state

### Trail catalog
- **75 hand-curated trails** (`lib/trails.ts`, `lib/trails-zh.ts`) — full
  editorial: scenery rating, description, highlights, parking notes,
  Chinese translations. `tier: "featured"`.
- **1,707 OSM-imported trails** (`lib/trails-imported.json`) — auto-derived
  difficulty/type/popularity, templated descriptions, DEM elevation gain,
  scenery null pending user ratings. `tier: "imported"`.

### Site structure
- `/` — landing page (hero + intake form + value cards + featured grid)
- `/map` — interactive map (trailspark.xyz/map). Imported trails cluster
  into bubbles below zoom 11 so the West-Coast view stays clean.
- `/trails` — directory page. Featured per region first, then collapsed
  "More community routes" section per region.
- `/trails/[id]` — per-trail static page (1,782 static-generated pages
  for SEO). Multi-day / thru-hike entries get the inquiry form; day hikes
  get a softer "Visiting from out of town?" link back to `/`.

### Data pipeline (`scripts/`)
1. `fetch-osm-trails.mjs` — Overpass API across 15 park boundaries
2. `enrich-osm-trails.mjs` — fills region/state/ecosystem/difficulty
3. `elevation-pass.mjs` — USGS NED10m DEM → gain (±20% of AllTrails)
4. `merge-imported.mjs` — collapses output → `lib/trails-imported.json`
5. `wikipedia-seed.mjs` — replaces 11 wiki-linked trail descriptions
   with Wikipedia summary

### Lead capture
- `app/api/inquiry/route.ts` — POST endpoint, sends email via Resend to
  `gongyibob@gmail.com` and console.logs every submission (Vercel logs
  serve as backup paper trail). Source field distinguishes:
  - `landing-hero` / `landing-footer` — trip planning interest, no trail picked
  - `<trail-id>` — submitted from a multi-day/thru-hike trail page

---

## Paid tier — what we'll build, once PMF is verified

### What the user buys
A relationship running from "I'm thinking about a trip" to "I'm back, refreshed."

**Planning (T-30 days → T-1)**
- 5-question intake (dates, region, experience, group, preferences)
- Day-by-day plan delivered in ≤24h: trail picks, drives, permits,
  parking, lodging, gear, food, contingencies
- Free revisions for 30 days

**Trip companion (T-1 day → T+0)** — SMS-based
- T-24h: tomorrow's brief (weather, departure time, gear check)
- Day-of: morning brief + adjustments
- Two-way: "Should I bail on this peak?", "What if it snows?"

**Wrap (T+0 → T+7)**
- Post-trip check-in, suggestions for next year

### Pricing
| Tier | Price | What | Customer |
|---|---|---|---|
| Single Trip Plan | **$99–199** | Hand-crafted plan + 30-day SMS companion. Price scales with complexity (3-day single-park vs 14-day multi-park). | 1–2 trips/year traveler |
| All-Access | **$249/year** | Unlimited trips | 3+ trips/year enthusiast |
| Premium | **$499/year** | Multi-person coordination, commercial use | Guides, creators |

**Final pricing decided post-validation.** $99 is the floor (matches the
Sean Ellis "would you pay" test). Premium for very long thru-hikes (JMT,
PCT sections) may go $249+ given complexity.

### The moat (not the AI itself)
1. **Structured catalog**: 1,782 trails with metadata an AI can reason
   over. Building this took weeks. Competitors restart from 0.
2. **Proactive operational intelligence**: SMS-time-aware re-routing.
   AllTrails can't ship this — they're org-structured for "broad &
   averaging," and planning requires opinion.
3. **Cross-trip memory**: "you said your knees bothered you last year."
   LTV per customer compounds over years.

### Critical risks
1. **Liability on life-safety decisions.** Agent must REFUSE directive
   advice on avalanche, river crossings, severe weather; redirect to
   NPS / ranger. Hard-code from day 1. Real lawsuit vector competitors
   ignore.
2. **AllTrails moves first.** $200M raised, 50M users. Window estimate:
   12–18 months. Speed matters.
3. **API cost runaway** on long SMS conversations. Need per-trip caps.

---

## Roadmap

### Phase 1 — Free tier ✅ (mostly shipped)
- 1,782 trails live, two-tier UX, lazy geometry, tier badges, inquiry
  form, Resend email, landing page, global header, favicon, branding,
  clustered imported pins.

### Phase 1.5 — PMF VALIDATION ⚠️ (DO THIS NOW — see VALIDATION.md)
- **No new code features.** Yibo manually concierges 5 friends + 5
  Reddit/小红书 strangers through real trips. Outcome decides Phase 2.

### Phase 2 — Paid v1 (only after Phase 1.5 shows PMF signal)
- User auth + Stripe checkout
- Single-park planner agent (likely Yosemite first)
- Output: shareable plan page + PDF + Google Maps export

### Phase 3 — SMS companion v1 (outbound only)
- T-24h brief, day-of brief, post-trip wrap via Twilio

### Phase 4 — SMS two-way agent
- Conversation state + tool calls for weather/permit/conditions

### Phase 5 — Real-data integrations + ops maturity
- Permit lottery monitoring, NPS alerts, customer support tooling

**Total: 5–7 months Phase 2→5 once PMF is validated.**

---

## Tech stack

| Layer | Choice |
|---|---|
| App | Next.js 14 App Router on Vercel |
| Database | Postgres (Neon or Supabase) — not yet provisioned |
| LLM | Anthropic Claude (Sonnet for planning, Haiku for fast SMS replies) |
| SMS | Twilio |
| Email | Resend (already wired) |
| Scheduled jobs | Vercel Cron + Inngest |
| Payments | Stripe |
| Auth | Clerk or Vercel Auth |

---

## Cost estimates

| Phase | Monthly |
|---|---|
| Phase 1 (current, free tier only) | ~$45 (Vercel + domain) |
| Phase 2–5 build | $100–250 (add LLM dev usage, Twilio testing) |
| 100 paying users | $500–1500 |
| Gross margin on $129 trip | ~80% after API + Stripe + Twilio |

---

## Working relationship (Yibo + Claude)

**Claude executes ~85%:** code, architecture, prompts, integrations,
deployments. Fast and tireless.

**Yibo drives the load-bearing 15%:**
- Product decisions
- Real user validation (the manual concierge work)
- Brand / voice / copy that converts
- Pricing experiments
- Legal review

**Cross-session memory:** Claude reads `PRODUCT.md` + `VALIDATION.md` +
`MEMORY.md` on resume to load context. Keep these fresh as the source
of truth.

---

## Open decisions (need Yibo's input post-validation)

- [ ] After 5 manual concierge runs: which persona converts best?
- [ ] After 10 paid leads: final pricing tier breakpoints?
- [ ] Brand name — keep "Trailspark" or rename to match concierge identity?
- [ ] Single-park MVP for Phase 2 — Yosemite, Olympic, or pan-regional?
- [ ] When to launch SMS companion vs ship Phase 2 plan first?

---

## Things we explicitly decided NOT to do

- **Don't market in mainland China.** WTP too low for trip-planning
  service. (US-based Chinese diaspora is a different segment — they pay.)
- **Don't show "Plan this trip" on day-hike pages.** Single day hikes
  don't need AI planning. The CTA only appears on multi-day / thru-hike
  entries; day hikes get a soft "Visiting from out of town?" link.
- **Don't split intake into "road trip vs thru-hike".** Real trips are
  hybrid (drive in, day hike, drive on, backpack one night). One unified
  intake form; the planner decides the mix.
- **Don't ship more features before PMF validation.** The current product
  is enough to capture demand. More features without paying customers is
  procrastination.
- **Don't translate imported trails to Chinese.** English fallback is an
  honest tier signal.
- **Don't try to beat AllTrails on browsing/UGC.** That ship sailed.
- **Don't auto-generate trail descriptions with LLM at scale.** Google
  will penalize. Template-only for skeleton pages; hand-written or
  Wikipedia-seeded for featured.
- **Don't give directive advice on life-safety questions** in the AI
  agent — refuse and redirect to authorities (NPS, ranger station).
