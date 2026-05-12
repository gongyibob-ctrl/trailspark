# PMF Validation Playbook

A 4-week working doc for Yibo. The product is shipped (trailspark.xyz).
The goal of these 4 weeks is to find out **if anyone actually pays for
this**. No new code features. Just real customers.

> Read this WEEK BY WEEK. Don't skip ahead. Each week's output decides
> the next week's tactics.

---

## North Star metric

> By end of Week 4: **at least 3 strangers have paid $99+** for a manual
> trip plan, **OR** I have enough no-pay signal to pivot the positioning.

That's the gate. Below 3 paid customers = no PMF, don't build Phase 2.

---

## Persona to target this round: **B** (US-based Asian / Chinese diaspora)

Why B first (not A or C):
- You are this persona — deepest empathy, fastest iteration
- Cheap channels: 小红书, WeChat 美国户外群, 朋友圈
- Already-validated WTP (this segment buys $35 AllTrails Pro, $200 outdoor gear without flinching)
- Real-time Chinese feedback loop

**Operational definition of qualified lead:**
- Lives in US (Bay Area / Seattle / LA / NYC / Boston)
- Plans to do a multi-day hiking trip in next 3 months
- Comfortable using English for the trail content, prefers Chinese for support
- Household income ≥ $150k

---

## WEEK 1 — Manual concierge 3 friends (free)

**Goal:** Learn what real users ask for. Refine the intake form. Stress-test
the 24h delivery promise.

### Action
- Pick 3 friends from your phone contacts who:
  - Hike or want to hike
  - Have a real trip in the next 2 months
  - Are honest enough to give you brutal feedback
- Send them this message (paraphrase to your voice):

> "Hey [name] — I'm beta-testing this hiking trip planning service.
> I'll hand-craft a complete plan for your next West Coast trip (trails,
> drives, permits, gear list, day-by-day). Free, just need 30 min of
> your feedback after. Trip dates in next 2 months? Reply with your
> rough plan and I'll send you a Google Doc within 48h."

### Deliverable per friend
- Google Doc with day-by-day itinerary
- Embedded Google Maps for drives
- Gear list adjusted for trip dates
- Permit lottery / reservation status (ACTUAL screenshots from Recreation.gov)
- Backup plan if weather turns

### What to record per friend
| Field | Capture |
|---|---|
| Time it took you to make the plan | hours |
| Hardest part of researching | free text |
| Most appreciated part of the plan | free text (from their feedback) |
| Would they have paid $99? $199? | direct answer |
| Would they refer a friend? | direct answer |
| What's missing in the plan? | free text |

Use a simple Google Sheet: 3 rows × 6 columns.

### Success criteria for Week 1
- All 3 plans delivered within 48h ✅
- At least 2 of 3 say "I would have paid $99" ✅
- You have a feel for: median plan complexity, hardest research bottleneck

### Failure mode to watch
- If 2+ friends say "actually I would've just used AllTrails" → your
  intake didn't get them to articulate the complexity. Refine.
- If plans took 6+ hours each → unit economics broken at $99. Either
  charge more or narrow scope.

---

## WEEK 2 — Land 5 Reddit / 小红书 leads (free)

**Goal:** Stranger demand. Friends will say nice things; strangers reveal
whether positioning lands.

### Channel 1: Reddit (English, persona A overlap)

Sub-by-sub tactics. **One post per sub, spread across 3-4 days.**

**r/Yosemite (~95k members)**
Search for posts with "first time", "visiting from", "planning". Pick 3-5
recent ones. **Comment with genuine value** — actual trail picks for their
constraints. End with:
> "I've been building tools for this — if you'd like a more detailed
> day-by-day, DM me. Free during my beta."

**r/CampingandHiking (~3.5M)**
Title: *"Free West Coast hiking trip planning — beta testers wanted"*
Body: brief story (you built trailspark.xyz, beta phase, want to plan 5
free trips, looking for people who are visiting from outside CA/OR/WA).

**r/wildernessbackpacking, r/PNW, r/Hiking** — similar.

### Channel 2: 小红书 (Chinese, persona B core)

Search tags: 美西公园, 加州徒步, 优胜美地攻略

**One post**, photo-led (use a screenshot of the trailspark.xyz map zoomed
to Yosemite, or a hand-drawn 5-day itinerary you sketched). Title:

> "美西国家公园 5 天行程，免费帮你定制（前 5 位 beta 测试者）"

Body: brief credibility (你做的产品 trailspark.xyz)、痛点 (research 太累)、
免费名额 5 个、求反馈、留邮箱方式。

### Channel 3: WeChat 美国户外群 (Chinese, persona B core)

If you're in any "美国华人徒步群" / "湾区 outdoor"/"户外旅行" groups, post
similar offer. Native channel for this persona.

### What to record
For each lead, capture in your sheet:
- Channel they came from
- Did they fit Persona B (or A)?
- What was their initial ask
- Did they finally book a free plan?
- Drop-off point if they didn't (replied once and ghosted, never gave email, etc.)

### Success criteria for Week 2
- **10–30 expressions of interest** total across channels (replies, DMs,
  email captures via the form on trailspark.xyz)
- **5 qualified leads** that match Persona B definition
- All 5 sign up for a free beta plan

### Failure mode to watch
- 小红书 post < 50 views → image / title not compelling. Re-design.
- Reddit ratio of replies → email < 10% → the in-comment CTA is too
  soft, or value isn't clear.
- 0 leads from WeChat → groups aren't dense enough. Skip and double
  down on 小红书.

---

## WEEK 3 — Deliver 5 free plans, ask the $99 question

**Goal:** Convert "interest" into "would they pay." This is the real PMF
moment.

### Action
- Hand-craft each plan exactly like Week 1 friends
- Track time-per-plan carefully (target: ≤4 hours each — informs pricing)
- Deliver via Google Doc + email; offer 1 round of revision

### The $99 question (run this AFTER they receive the plan, not before)

3 days after delivery, email each customer:

> Hi [name], hope your trip planning is going well. Quick favor:
> in the future this service will be $99 per trip plan. Two questions:
>
> 1. If this had cost $99 when you signed up, would you still have
>    booked? (yes / no / "depends — explain")
> 2. If yes, what's the highest you would have paid for this exact plan?
>    ($79 / $99 / $129 / $199 / $299)
>
> Honest answer is more valuable to me than a polite one. Thanks!

### What to record per customer (new sheet rows, Week 2 + Week 3)
| Field | Capture |
|---|---|
| Persona (A/B/C) | self-identify |
| Trip complexity (days, parks) | numbers |
| Time you spent planning | hours |
| Cost per hour at $99 | derived |
| Would they have paid $99? | yes/no/maybe |
| Max they'd have paid | $79/$99/$129/$199/$299 |
| Words they used to describe what they got | direct quotes — gold for marketing copy |
| Did they refer a friend? | tracked next week |

### Success criteria for Week 3
- 5/5 free plans delivered, all within 48h
- **3+ customers say "yes, I would have paid $99"**
- Median max-WTP ≥ $129

### Failure mode to watch
- < 3 yes-to-$99 → price too high for the value perceived. Either
  (a) deliver more value (more interactive, faster, etc.), (b) drop
  to $49 and pivot to volume, or (c) ride higher with very-long-trip
  customers only.
- All "yes" but mostly $79 max → market price is $49–79, lower
  margin. Recalibrate or upmarket.

---

## WEEK 4 — Decision week

By end of Week 4, you have data from ~8 real customers (3 friends + 5
strangers). Use this matrix:

| Outcome | Decision |
|---|---|
| **5+ said "yes $99"** + clear customer profile + < 4h per plan | ✅ **GO**. Start Phase 2 build (AI agent for the most common trip shape). Tell remaining waitlist they can buy at $99 starting Week 5. |
| **2–4 said "yes $99"** + signals concentrated in one trip type (e.g., all Yosemite, all 5-day) | ⚠️ **NARROW**. Re-launch positioning around that single use case. Run another 2-week validation. |
| **0–1 said "yes $99"** | ❌ **PIVOT**. Don't build Phase 2 yet. Run 5 follow-up interviews with the no-pay customers: "What WOULD you have paid for that you couldn't get elsewhere?" |

### The hardest call: "wait, am I just discount-fishing?"

Customers who got a free thing rarely report willingness to pay
honestly. Tell yourself: **the real test is whether they refer a paying
customer.** If 0 of the 5 free customers refers anyone in 30 days, it
wasn't valuable enough.

So add this question to the post-trip email (Week 5+):

> "If you know someone planning a West Coast hiking trip, would you
> introduce them to me? I'll happily give them the same beta deal."

Count referrals over the next 30 days. **3+ unsolicited referrals from
5 customers = strong PMF signal**, much stronger than the $99 question.

---

## Things to NOT do during validation

- ❌ Don't build new features. Resist the urge.
- ❌ Don't hire anyone. You're the entire service.
- ❌ Don't write more landing copy. The site is good enough.
- ❌ Don't change pricing tiers. $99 single price, see what happens.
- ❌ Don't make landing pages for each persona yet. One page, one form.
- ❌ Don't run paid ads. Channel discovery is part of the validation —
  you need to know what FREE channels work first.

## Things to DO

- ✅ Track everything in one Google Sheet
- ✅ Record every customer call / message thread (consent + ask)
- ✅ Save 5+ direct customer quotes for future marketing
- ✅ Note time spent per plan — unit economics
- ✅ Save every "wait, can it also..." question — Phase 2 feature list

---

## Resources to use during plans

You already have these tools available — use them while concierging:

- **trailspark.xyz/map** — your own product, scan trails by region
- **trailspark.xyz/trails** — index, group trails by region
- **recreation.gov** — permits (Yosemite Half Dome, Mt Whitney, Wonderland, etc.)
- **NPS.gov** — official park alerts + conditions
- **NOAA point forecast** (forecast.weather.gov) — weather averages
- **AllTrails** — for trail reviews / current conditions / photos
  (don't link out to it in your plans; use it as research only)
- **Google Maps + driving directions** — drives
- **WTA.org** (Washington Trails) — PNW trip reports
- **CalTopo** — terrain detail for backpacks
- **Open Weather** — multi-day forecast

---

## When you finish each week, append a section here

Append a `## Week N debrief` section to this file with:
- Numbers (leads, plans delivered, time spent)
- 3 surprises
- 3 things to change
- Decision for next week

That way when Claude resumes context, the validation history is right
here in the repo. Don't keep it in a separate Notion / Google Doc.

---

## The single sentence that should be true in 4 weeks

> "5 strangers paid $99 each for a hiking trip plan I made by hand, and
> 3 of them told a friend."

If that's true, build Phase 2. If not, the positioning needs another
round. Either outcome is fine — both are progress.
