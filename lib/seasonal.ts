// Seasonal advisories — fire when the user picks a date that's relevant.
//
// Two kinds:
//   - "warning"  → red/amber tone; means "this could ruin your trip" (route
//     closed, cables down, gear that's mandatory by season).
//   - "info"     → forest tone; means "here's something nice to know" (peak
//     bloom window, autumn larches, mosquito season, permit lottery deadline).
//
// `monthRange` is inclusive on both ends and wraps the year boundary, so
// `[11, 2]` means Nov + Dec + Jan + Feb.

export type AdvisoryTone = "warning" | "info";

export interface SeasonalAdvisory {
  monthRange: [number, number]; // 1-12, inclusive, may wrap year
  tone: AdvisoryTone;
  message: { en: string; zh: string };
}

function inRange(month: number, [start, end]: [number, number]): boolean {
  if (start <= end) return month >= start && month <= end;
  // Wraps year (e.g., Nov–Feb)
  return month >= start || month <= end;
}

export const ADVISORIES: Record<string, SeasonalAdvisory[]> = {
  "half-dome": [
    {
      monthRange: [11, 4],
      tone: "warning",
      message: {
        en: "Cables are down. The route now requires technical climbing skills and gear.",
        zh: "钢缆已撤。此季节需技术登山技能和装备方可上顶。",
      },
    },
    {
      monthRange: [5, 5],
      tone: "info",
      message: {
        en: "Cables typically go up the Friday before Memorial Day — check the official page before going.",
        zh: "钢缆通常在 Memorial Day 前一周才架起，出发前请查官网确认。",
      },
    },
  ],
  "mist-trail": [
    {
      monthRange: [4, 6],
      tone: "info",
      message: {
        en: "Peak waterfall flow — bring a rain shell, you will get drenched.",
        zh: "瀑布水量最大期，记得带雨壳，肯定会被淋湿。",
      },
    },
    {
      monthRange: [8, 10],
      tone: "info",
      message: {
        en: "Falls slow to a trickle in late summer — most photogenic in spring.",
        zh: "夏末瀑布水量很小，春季拍照效果最好。",
      },
    },
  ],
  "upper-yosemite-falls": [
    {
      monthRange: [8, 10],
      tone: "info",
      message: {
        en: "Falls are usually dry by August — go April–June for full flow.",
        zh: "瀑布到 8 月通常已干涸，4–6 月最壮观。",
      },
    },
  ],
  "mt-whitney": [
    {
      monthRange: [11, 5],
      tone: "warning",
      message: {
        en: "Winter conditions: ice axe and crampons required, route is technical above Trail Camp.",
        zh: "冬季路况：Trail Camp 以上为技术路线，必须携带冰镐和冰爪。",
      },
    },
    {
      monthRange: [2, 3],
      tone: "info",
      message: {
        en: "Summer permit lottery opens Feb 1 — apply now if hiking June–September.",
        zh: "夏季许可抽签 2 月 1 日开放——如打算 6–9 月去，现在就要申请。",
      },
    },
  ],
  jmt: [
    {
      monthRange: [11, 4],
      tone: "warning",
      message: {
        en: "Off-season — high passes are buried in snow, water sources frozen, no realistic resupply.",
        zh: "非旺季——高山口积雪封路，水源冻结，无法补给。",
      },
    },
    {
      monthRange: [11, 1],
      tone: "info",
      message: {
        en: "Permit reservation window opens 24 weeks before start — book now for next summer.",
        zh: "许可申请窗口在出发日前 24 周开放——现在就为明年夏天预订。",
      },
    },
    {
      monthRange: [7, 7],
      tone: "info",
      message: {
        en: "Mosquito peak in early July — head net mandatory above 9k ft.",
        zh: "7 月初为蚊虫高峰，9000 英尺以上必备防蚊头网。",
      },
    },
  ],
  "rae-lakes": [
    {
      monthRange: [11, 5],
      tone: "warning",
      message: {
        en: "Glen Pass is snow-covered most years until late June — check ranger reports.",
        zh: "Glen Pass 山口大多数年份到 6 月底仍有积雪——出发前查询护林站。",
      },
    },
  ],
  "tahoe-rim": [
    {
      monthRange: [11, 5],
      tone: "warning",
      message: {
        en: "Higher elevations stay snowed-in until June; many segments only practical July–October.",
        zh: "高海拔段到 6 月仍有积雪——许多路段只在 7–10 月可行。",
      },
    },
  ],

  wonderland: [
    {
      monthRange: [11, 6],
      tone: "warning",
      message: {
        en: "Off-season — most of the route is under snow, river crossings dangerous.",
        zh: "非旺季——大部分路线被雪覆盖，过河非常危险。",
      },
    },
    {
      monthRange: [3, 3],
      tone: "info",
      message: {
        en: "Early-access lottery opens early March — competitive!",
        zh: "先行抽签 3 月初开放——竞争激烈！",
      },
    },
    {
      monthRange: [7, 8],
      tone: "info",
      message: {
        en: "Wildflower peak: Spray Park, Indian Bar, Summerland are at their best.",
        zh: "野花最盛期：Spray Park / Indian Bar / Summerland 此时最美。",
      },
    },
  ],
  "skyline-paradise": [
    {
      monthRange: [11, 6],
      tone: "warning",
      message: {
        en: "Snow-covered most of the year — avalanche-aware skills required Dec–Apr.",
        zh: "全年大部分时间积雪覆盖，12–4 月需具备雪崩判断能力。",
      },
    },
    {
      monthRange: [7, 7],
      tone: "info",
      message: {
        en: "Peak wildflower bloom in late July — the Skyline meadows explode with color.",
        zh: "7 月末野花花期高峰——草甸百花齐放。",
      },
    },
  ],

  "high-divide": [
    {
      monthRange: [11, 6],
      tone: "warning",
      message: {
        en: "Snowfields linger on the divide until July — winter route is mountaineering.",
        zh: "山脊积雪可延续到 7 月——冬季为登山级别路线。",
      },
    },
    {
      monthRange: [8, 9],
      tone: "info",
      message: {
        en: "Peak bear-watching season — they're feeding on berries in the meadows.",
        zh: "黑熊观察最佳期——它们在草甸觅食浆果。",
      },
    },
  ],

  "maple-pass": [
    {
      monthRange: [9, 10],
      tone: "info",
      message: {
        en: "Larches turn gold late September through mid-October — peak is fleeting, ~10 days.",
        zh: "落叶松金黄期：9 月底至 10 月中旬——高峰只有约 10 天。",
      },
    },
    {
      monthRange: [11, 6],
      tone: "warning",
      message: {
        en: "Snow-covered with avalanche risk — outside the summer-fall window only for trained mountaineers.",
        zh: "积雪有雪崩风险——夏秋窗口期外仅适合受过训练的登山者。",
      },
    },
  ],
  "cascade-pass": [
    {
      monthRange: [11, 6],
      tone: "warning",
      message: {
        en: "Snow-covered Nov–June; Sahale Glacier route requires technical skills off-season.",
        zh: "11–6 月积雪覆盖；Sahale 冰川路段非旺季需技术登山。",
      },
    },
    {
      monthRange: [9, 10],
      tone: "info",
      message: {
        en: "Larch viewing window — autumn colors peak late September.",
        zh: "落叶松观赏期——秋色 9 月末达到顶峰。",
      },
    },
  ],

  timberline: [
    {
      monthRange: [10, 6],
      tone: "warning",
      message: {
        en: "Eliot Glacier crossing dangerous outside July–September. Plan around the snow window.",
        zh: "Eliot 冰川过河在 7–9 月外极其危险，请按雪季窗口安排。",
      },
    },
  ],
  "south-sister": [
    {
      monthRange: [11, 6],
      tone: "warning",
      message: {
        en: "Off-season requires snow travel skills above Moraine Lake.",
        zh: "Moraine Lake 以上路段非旺季需要雪地行走技能。",
      },
    },
    {
      monthRange: [5, 9],
      tone: "info",
      message: {
        en: "Central Cascades Wilderness Permit required May 26 – Sep 24.",
        zh: "5 月 26 日至 9 月 24 日需中喀斯喀特荒野许可。",
      },
    },
  ],
  "garfield-peak": [
    {
      monthRange: [11, 6],
      tone: "warning",
      message: {
        en: "Rim Drive closed by snow Oct–June. Trail is buried in snow.",
        zh: "Rim Drive 10–6 月因雪封闭，步道积雪无法通行。",
      },
    },
  ],

  "lassen-peak": [
    {
      monthRange: [11, 6],
      tone: "warning",
      message: {
        en: "Park highway closed by snow until June or July most years.",
        zh: "公园主路通常因雪封闭至 6 月或 7 月。",
      },
    },
  ],
  "fern-canyon": [
    {
      monthRange: [5, 9],
      tone: "warning",
      message: {
        en: "Timed-entry permit required May 15 – Sep 15 — no entry without it.",
        zh: "5 月 15 日至 9 月 15 日需分时进入许可——无许可不得进入。",
      },
    },
  ],
  "lost-coast": [
    {
      monthRange: [12, 3],
      tone: "warning",
      message: {
        en: "Winter storms make black-sand beaches treacherous; tide windows shrink.",
        zh: "冬季风暴让黑沙滩极其危险，安全潮汐窗口缩短。",
      },
    },
    {
      monthRange: [4, 5],
      tone: "info",
      message: {
        en: "Roosevelt elk calving — keep distance, especially around Sea Lion Gulch.",
        zh: "罗斯福麋鹿育崽期——尤其在 Sea Lion Gulch 附近保持距离。",
      },
    },
  ],

  "ryan-mountain": [
    {
      monthRange: [6, 9],
      tone: "warning",
      message: {
        en: "Summer heat: 100°F+ common — start at sunrise or skip until fall.",
        zh: "夏季酷热：100°F (38°C) 以上常见——日出前出发或秋天再去。",
      },
    },
  ],
  "telescope-peak": [
    {
      monthRange: [11, 5],
      tone: "warning",
      message: {
        en: "Summit usually has snow into June; access road may be closed.",
        zh: "山顶到 6 月可能仍有积雪，进山路可能封闭。",
      },
    },
  ],

  pct: [
    {
      monthRange: [11, 1],
      tone: "info",
      message: {
        en: "Long-distance permit lottery: round 1 opens Nov 7, round 2 opens January for next season.",
        zh: "长距离许可抽签：11 月 7 日开放第一轮，次年 1 月开放第二轮。",
      },
    },
    {
      monthRange: [4, 5],
      tone: "info",
      message: {
        en: "Northbound thru-hike start window — most hikers depart Campo April 15 – May 10.",
        zh: "北向长穿越出发窗口——多数徒步者在 4 月 15 日至 5 月 10 日从 Campo 出发。",
      },
    },
  ],
  "shi-shi": [
    {
      monthRange: [11, 3],
      tone: "info",
      message: {
        en: "Winter storms bring giant beached driftwood and dramatic seas — but expect rain.",
        zh: "冬季风暴会带来巨型漂流木和壮观海景——但会下雨。",
      },
    },
  ],
};

export function getAdvisoriesForDate(
  trailId: string,
  month: number,
): SeasonalAdvisory[] {
  const list = ADVISORIES[trailId];
  if (!list) return [];
  return list.filter((a) => inRange(month, a.monthRange));
}
