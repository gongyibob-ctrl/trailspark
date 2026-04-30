// Curated permit info for the trails that need one. We don't hit the
// Recreation.gov API at runtime — that's a future enhancement that needs
// a key + per-trail RIDB IDs. For now we ship the actionable bits:
//   - which agency runs the permit
//   - the application timing
//   - direct link to the official application page
//   - a "demand" hint so users know what they're up against

export type PermitDemand = "low" | "moderate" | "high" | "lottery";

export interface PermitInfo {
  authority: { en: string; zh: string };
  /** When/how to apply, in plain language. */
  window: { en: string; zh: string };
  /** Official application URL (deep link to the permit page). */
  url: string;
  demand: PermitDemand;
}

export const PERMITS: Record<string, PermitInfo> = {
  "half-dome": {
    authority: { en: "Yosemite National Park", zh: "优胜美地国家公园" },
    window: {
      en: "Preseason lottery in March; daily lottery 2 days before each hike date.",
      zh: "3 月预季抽签；每日徒步前 2 天还有一次每日抽签。",
    },
    url: "https://www.recreation.gov/permits/234652",
    demand: "lottery",
  },
  "mt-whitney": {
    authority: { en: "Inyo National Forest", zh: "因约国家森林" },
    window: {
      en: "Lottery opens Feb 1, results mid-March. Permit required for any overnight or summit day.",
      zh: "每年 2 月 1 日开始抽签，3 月中旬出结果。任何过夜或登顶日均需许可。",
    },
    url: "https://www.recreation.gov/permits/233260",
    demand: "lottery",
  },
  jmt: {
    authority: { en: "Yosemite NPS (for north-bound starts)", zh: "优胜美地（北端起步）" },
    window: {
      en: "Apply 24 weeks ahead of start date; 60% of permits go via daily lottery.",
      zh: "出发日前 24 周开放申请；60% 名额走每日抽签。",
    },
    url: "https://www.recreation.gov/permits/445857",
    demand: "lottery",
  },
  "rae-lakes": {
    authority: { en: "Sequoia & Kings Canyon NP", zh: "红杉 & 国王峡谷国家公园" },
    window: {
      en: "Reservations open ~6 months ahead. Some walk-up permits available at Roads End.",
      zh: "出发日前约 6 个月开放预订；Roads End 还有少量当日窗口许可。",
    },
    url: "https://www.recreation.gov/permits/445856",
    demand: "high",
  },
  wonderland: {
    authority: { en: "Mt Rainier National Park", zh: "雷尼尔山国家公园" },
    window: {
      en: "Early-access lottery in early March; general reservations open mid-April.",
      zh: "3 月初先行抽签；4 月中旬普通预订开放。",
    },
    url: "https://www.recreation.gov/permits/4675321",
    demand: "lottery",
  },
  "shi-shi": {
    authority: { en: "Olympic National Park (coastal)", zh: "奥林匹克国家公园（海岸区）" },
    window: {
      en: "Reservations any time; summer dates fill quickly. Bear can rental separate.",
      zh: "全年可预订，夏季日期会被很快抢光；防熊罐另租。",
    },
    url: "https://www.recreation.gov/permits/4098362",
    demand: "moderate",
  },
  "high-divide": {
    authority: { en: "Olympic National Park (Sol Duc)", zh: "奥林匹克国家公园（Sol Duc）" },
    window: {
      en: "Reservations open 6 months in advance. Summer permits are competitive.",
      zh: "出发日前 6 个月开放预订；夏季名额抢手。",
    },
    url: "https://www.recreation.gov/permits/4098362",
    demand: "high",
  },
  "cascade-pass": {
    authority: { en: "North Cascades NP", zh: "北喀斯喀特国家公园" },
    window: {
      en: "Reservation 2 days–3 months out; some walk-up permits at Marblemount.",
      zh: "出发前 2 天至 3 个月可预订；Marblemount 有当日窗口许可。",
    },
    url: "https://www.recreation.gov/permits/4675317",
    demand: "moderate",
  },
  "south-sister": {
    authority: { en: "Three Sisters Wilderness", zh: "三姐妹荒野" },
    window: {
      en: "Central Cascades Wilderness Permit required May 26–Sep 24. Day-use included.",
      zh: "5 月 26 日至 9 月 24 日需中喀斯喀特荒野许可，含日游。",
    },
    url: "https://www.recreation.gov/permits/233273",
    demand: "high",
  },
  "fern-canyon": {
    authority: { en: "Prairie Creek Redwoods SP", zh: "Prairie Creek 红杉州立公园" },
    window: {
      en: "Free timed-entry permit required May 15 – Sep 15.",
      zh: "5 月 15 日至 9 月 15 日需免费的分时进入许可。",
    },
    url: "https://www.parks.ca.gov/?page_id=415",
    demand: "low",
  },
  "lost-coast": {
    authority: { en: "King Range NCA (BLM)", zh: "King Range 国家保护区（BLM）" },
    window: {
      en: "Reservations open 60 days before start. Bear can required.",
      zh: "出发前 60 天开放预订；强制使用防熊罐。",
    },
    url: "https://www.recreation.gov/permits/233272",
    demand: "high",
  },
  pct: {
    authority: { en: "PCTA Long-Distance Permit", zh: "PCTA 长距离许可" },
    window: {
      en: "Lottery-style window opens Nov 7 (round 1) and Jan (round 2) for the next season.",
      zh: "次年名额每年 11 月 7 日开放第一轮，次年 1 月开放第二轮。",
    },
    url: "https://www.pcta.org/discover-the-trail/permits/long-distance-permit/",
    demand: "lottery",
  },
};

export function getPermitInfo(trailId: string): PermitInfo | null {
  return PERMITS[trailId] ?? null;
}
