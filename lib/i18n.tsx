"use client";

import { useEffect, useState } from "react";

export type Locale = "en" | "zh";

const STORAGE_KEY = "trailspark.locale";
const CHANGE_EVENT = "trailspark:locale-changed";

// ---------------- Dictionary ----------------

export const STRINGS = {
  // Brand / chrome
  "brand.tagline":              { en: "US West Coast", zh: "美国西海岸" },
  "brand.trailsCount":          { en: "{n} trails",     zh: "{n} 条路线" },
  "brand.footer":               { en: "Trailspark · West Coast MVP", zh: "Trailspark · 西海岸 MVP" },

  // Sidebar
  "sidebar.search":             { en: "Search trails or parks...", zh: "搜索路线或国家公园..." },
  "sidebar.filters":            { en: "Filters", zh: "筛选" },
  "sidebar.results":            { en: "{n} results", zh: "{n} 条结果" },
  "sidebar.empty":              { en: "No trails match your filters.", zh: "没有符合筛选条件的路线。" },
  "sidebar.clearFilters":       { en: "Clear all filters", zh: "清除全部筛选" },
  "sidebar.region":             { en: "Region", zh: "区域" },
  "sidebar.difficulty":         { en: "Difficulty", zh: "难度" },
  "sidebar.type":               { en: "Type", zh: "类型" },
  "sidebar.favoritesTooltip.empty": { en: "Tap the heart on any trail to save", zh: "点击任意路线的爱心收藏" },
  "sidebar.favoritesTooltip.on":    { en: "Showing favorites only", zh: "仅显示已收藏" },
  "sidebar.favoritesTooltip.off":   { en: "Show favorites ({n})", zh: "显示已收藏（{n}）" },
  "sidebar.hide":               { en: "Hide trail list", zh: "收起列表" },
  "sidebar.show":               { en: "Show trail list", zh: "展开列表" },
  "sidebar.trails":             { en: "Trails", zh: "路线" },
  "sidebar.permit":             { en: "Permit", zh: "需许可" },
  "sidebar.gain":                { en: "{n} gain", zh: "爬升 {n}" },

  // Detail panel - top
  "detail.permitRequired":      { en: "Permit required", zh: "需许可" },
  "detail.aria.close":          { en: "Close", zh: "关闭" },
  "detail.aria.share":          { en: "Copy share link", zh: "复制分享链接" },
  "detail.aria.shareCopied":    { en: "Copied!", zh: "已复制" },
  "detail.aria.favoriteSave":   { en: "Save to favorites", zh: "收藏" },
  "detail.aria.favoriteRemove": { en: "Remove from favorites", zh: "取消收藏" },

  // Stats
  "stats.length":               { en: "Length", zh: "长度" },
  "stats.gain":                 { en: "Gain",   zh: "爬升" },
  "stats.state":                { en: "State",  zh: "州" },

  // Section titles
  "section.about":              { en: "About",              zh: "概览" },
  "section.elevation":          { en: "Elevation Profile",  zh: "海拔剖面" },
  "section.highlights":         { en: "Highlights",         zh: "亮点" },
  "section.bestTime":           { en: "Best Time to Hike",  zh: "最佳徒步时间" },
  "section.weatherAround":      { en: "Weather around {date}", zh: "{date} 前后天气" },
  "section.gearFor":            { en: "Gear for {season} {type}", zh: "{season}{type}装备清单" },

  // Elevation profile
  "elevation.label":            { en: "Elevation profile", zh: "海拔剖面" },
  "elevation.cumulative":       { en: "cumulative",        zh: "累计爬升" },
  "elevation.trailhead":        { en: "Trailhead",         zh: "起点" },
  "elevation.loadFailed":       { en: "Couldn't load elevation: {err}", zh: "海拔数据加载失败：{err}" },
  "elevation.noGeometry":       {
    en: "No trail geometry available — elevation profile is only shown for trails with mapped routes.",
    zh: "暂无路线几何数据 —— 仅有完整路径的路线才能显示海拔剖面。",
  },

  // Date picker
  "datepicker.planOn":          { en: "Plan a hike on", zh: "计划徒步日期" },
  "datepicker.inBest":          { en: "In best season",  zh: "最佳季节" },
  "datepicker.offPeak":         { en: "Off-peak",        zh: "非旺季" },
  "datepicker.dayOf":           { en: "Day of {month}",  zh: "{month}的第几日" },
  "datepicker.bestTooltip":     { en: "Best season for this trail", zh: "此路线的最佳月份" },

  // Weather panel
  "weather.avgHighLow":         { en: "Avg high / low (past {n} yrs)", zh: "近 {n} 年同期均温" },
  "weather.high":               { en: "High", zh: "高温" },
  "weather.low":                { en: "Low",  zh: "低温" },
  "weather.snowLikely":         { en: "Snow likely", zh: "可能下雪" },
  "weather.precipAvg":          { en: "{v} avg precip", zh: "平均降水 {v}" },
  "weather.precipDays":         { en: "~{a} of {b} years saw rain", zh: "近 {b} 年内约 {a} 年有降雨" },
  "weather.variability":        {
    en: "High spread of {v}°F means weather is variable on this date — pack layers.",
    zh: "气温波动达 {v}°，建议多带几层衣物以应对天气变化。",
  },
  "weather.yearRound":          { en: "Year-round avg high / low °F", zh: "全年平均高温 / 低温" },
  "weather.forecastTitle":      { en: "Live 7-day forecast at trailhead", zh: "起点未来 7 天预报" },
  "weather.error":              { en: "Couldn't load weather: {err}", zh: "天气数据加载失败：{err}" },
  "weather.tooltipWind":        { en: "{label} · wind {wind}", zh: "{label} · 风速 {wind}" },

  // Gear
  "gear.essential":             { en: "essential", zh: "必备" },
  "gear.officialLink":          { en: "Official trail info", zh: "官方信息" },
  "gear.trailhead":             { en: "Trailhead: {coords}", zh: "起点坐标：{coords}" },
  "gear.popup.click":           { en: "Click to view full details", zh: "点击查看完整详情" },

  // Map / popup
  "map.loading":                { en: "Loading map…", zh: "地图加载中…" },
  "map.error.title":            { en: "Map failed to load", zh: "地图加载失败" },
  "map.error.hint":             { en: "Check your internet connection — base tiles are loaded from",
                                   zh: "请检查网络连接 — 底图来自" },
  "map.error.code":             { en: "Open the browser DevTools (⌥⌘I) Network tab and retry.",
                                   zh: "打开浏览器开发者工具（⌥⌘I）→ Network 标签查看详情。" },

  // Legend
  "legend.title":               { en: "Legend", zh: "图例" },

  // Permit pill / tags
  "tag.permit":                 { en: "Permit", zh: "需许可" },

  // Wildfire warning
  "fire.title":                 { en: "Active wildfire nearby", zh: "附近有活跃野火" },
  "fire.distance":              { en: "{name} · {km} km away · {contained}% contained",
                                   zh: "{name} · 距此 {km} 公里 · 已控制 {contained}%" },
  "fire.acres":                 { en: "{n} acres", zh: "{n} 英亩" },
  "fire.dataSource":             { en: "Live data: NIFC", zh: "实时数据：NIFC" },
  "fire.checkBefore":           { en: "Check official park alerts before going.", zh: "出发前请查询公园官方警报。" },

  // Permit info
  "permit.heading":             { en: "Permit details", zh: "许可详情" },
  "permit.authority":           { en: "Issued by", zh: "签发机构" },
  "permit.window":              { en: "Application window", zh: "申请时间" },
  "permit.demand":              { en: "Demand", zh: "竞争激烈程度" },
  "permit.applyButton":         { en: "Apply on official site", zh: "前往官方申请" },
  "permit.demand.low":          { en: "Low — usually available", zh: "低 · 通常都有名额" },
  "permit.demand.moderate":     { en: "Moderate — book early", zh: "中等 · 建议早申请" },
  "permit.demand.high":         { en: "High — competitive", zh: "高 · 竞争激烈" },
  "permit.demand.lottery":      { en: "Very high — lottery only", zh: "极高 · 仅抽签" },
  "permit.officialNotes":       { en: "Official park notes", zh: "官方提示" },
  "permit.showMore":             { en: "Show full notes", zh: "查看完整内容" },
  "permit.showLess":             { en: "Show less", zh: "收起" },
  "permit.dataSource":           { en: "Live from Recreation.gov", zh: "来自 Recreation.gov" },
  "permit.lastUpdated":          { en: "Updated {date}", zh: "更新于 {date}" },

  // Difficulty
  "difficulty.easy":            { en: "Easy",      zh: "简单" },
  "difficulty.moderate":        { en: "Moderate",  zh: "中等" },
  "difficulty.hard":            { en: "Hard",      zh: "困难" },
  "difficulty.extreme":         { en: "Extreme",   zh: "极难" },

  // Type
  "type.day":                   { en: "Day Hike",            zh: "一日徒步" },
  "type.multi-day":             { en: "Multi-day Backpack",  zh: "多日穿越" },
  "type.thru-hike":             { en: "Thru-Hike",           zh: "长距离穿越" },

  // Type short labels for the gear-section dynamic title
  "typeShort.day":              { en: "day hike",   zh: "一日徒步" },
  "typeShort.multi-day":        { en: "backpack",   zh: "多日露营" },
  "typeShort.thru-hike":        { en: "thru-hike",  zh: "长距离穿越" },

  // Region
  "region.yosemite-sierra":     { en: "Yosemite & High Sierra",   zh: "优胜美地 & 高内华达山脉" },
  "region.rainier":             { en: "Mt Rainier",                zh: "雷尼尔山" },
  "region.olympic":              { en: "Olympic NP",                zh: "奥林匹克国家公园" },
  "region.north-cascades":      { en: "North Cascades",            zh: "北喀斯喀特" },
  "region.oregon":              { en: "Oregon Cascades & Gorge",   zh: "俄勒冈喀斯喀特 & 河谷" },
  "region.norcal":              { en: "Northern California",       zh: "北加州" },
  "region.socal-desert":        { en: "Southern CA & Desert",      zh: "南加州 & 沙漠" },
  "region.bigsur-bay":          { en: "Big Sur & Bay Area",        zh: "大苏尔 & 旧金山湾区" },
  "region.thru-hike":           { en: "Iconic Thru-Hikes",         zh: "标志性长距离穿越" },

  // Ecosystem
  "ecosystem.alpine":           { en: "Alpine",               zh: "高山" },
  "ecosystem.subalpine":        { en: "Subalpine",            zh: "亚高山" },
  "ecosystem.volcanic":         { en: "Volcanic",             zh: "火山地貌" },
  "ecosystem.rainforest":       { en: "Temperate Rainforest", zh: "温带雨林" },
  "ecosystem.coastal":          { en: "Coastal",              zh: "海岸" },
  "ecosystem.desert":           { en: "Desert",               zh: "沙漠" },
  "ecosystem.redwood":          { en: "Redwood Forest",       zh: "红杉林" },
  "ecosystem.chaparral":        { en: "Chaparral",            zh: "灌木林" },
  "ecosystem.gorge":            { en: "River Gorge",          zh: "河谷峡谷" },

  // Season (for date picker + best season chips)
  "season.spring":              { en: "Spring", zh: "春季" },
  "season.summer":              { en: "Summer", zh: "夏季" },
  "season.fall":                { en: "Fall",   zh: "秋季" },
  "season.winter":              { en: "Winter", zh: "冬季" },

  // Season short (for "Gear for summer thru-hike" type compositions)
  "seasonShort.spring":         { en: "spring", zh: "春季" },
  "seasonShort.summer":         { en: "summer", zh: "夏季" },
  "seasonShort.fall":           { en: "fall",   zh: "秋季" },
  "seasonShort.winter":         { en: "winter", zh: "冬季" },

  // Gear category labels
  "gearCat.footwear":           { en: "Footwear",         zh: "鞋袜" },
  "gearCat.clothing":           { en: "Clothing",         zh: "衣物" },
  "gearCat.navigation":         { en: "Navigation",       zh: "导航" },
  "gearCat.hydration":          { en: "Hydration",        zh: "饮水" },
  "gearCat.food":               { en: "Food",             zh: "食物" },
  "gearCat.safety":             { en: "Safety",           zh: "安全" },
  "gearCat.shelter":            { en: "Shelter & Sleep",  zh: "住宿与睡眠" },
  "gearCat.electronics":        { en: "Electronics",      zh: "电子设备" },
  "gearCat.extras":             { en: "Extras",           zh: "其他" },

  // Months
  "monthShort.1":               { en: "Jan", zh: "1月" },
  "monthShort.2":               { en: "Feb", zh: "2月" },
  "monthShort.3":               { en: "Mar", zh: "3月" },
  "monthShort.4":               { en: "Apr", zh: "4月" },
  "monthShort.5":               { en: "May", zh: "5月" },
  "monthShort.6":               { en: "Jun", zh: "6月" },
  "monthShort.7":               { en: "Jul", zh: "7月" },
  "monthShort.8":               { en: "Aug", zh: "8月" },
  "monthShort.9":               { en: "Sep", zh: "9月" },
  "monthShort.10":              { en: "Oct", zh: "10月" },
  "monthShort.11":              { en: "Nov", zh: "11月" },
  "monthShort.12":              { en: "Dec", zh: "12月" },

  "monthFull.1":                { en: "January",   zh: "1 月" },
  "monthFull.2":                { en: "February",  zh: "2 月" },
  "monthFull.3":                { en: "March",     zh: "3 月" },
  "monthFull.4":                { en: "April",     zh: "4 月" },
  "monthFull.5":                { en: "May",       zh: "5 月" },
  "monthFull.6":                { en: "June",      zh: "6 月" },
  "monthFull.7":                { en: "July",      zh: "7 月" },
  "monthFull.8":                { en: "August",    zh: "8 月" },
  "monthFull.9":                { en: "September", zh: "9 月" },
  "monthFull.10":               { en: "October",   zh: "10 月" },
  "monthFull.11":               { en: "November",  zh: "11 月" },
  "monthFull.12":               { en: "December",  zh: "12 月" },
} as const;

export type StringKey = keyof typeof STRINGS;

function template(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function t(
  key: StringKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return template(entry[locale], vars);
}

// ---------------- Unit formatters ----------------

const MI_TO_KM = 1.60934;
const FT_TO_M = 0.3048;
const IN_TO_MM = 25.4;
const MPH_TO_KMH = 1.60934;

export function fmtDistance(miles: number, locale: Locale): string {
  if (locale === "zh") {
    const km = miles * MI_TO_KM;
    return `${km < 10 ? km.toFixed(1) : Math.round(km).toLocaleString()} 公里`;
  }
  return `${miles} mi`;
}

export function fmtElevation(feet: number, locale: Locale): string {
  if (locale === "zh") {
    return `${Math.round(feet * FT_TO_M).toLocaleString()} 米`;
  }
  return `${feet.toLocaleString()} ft`;
}

/** Returns just the numeric portion (no unit), useful in dense tables. */
export function fmtElevationShort(feet: number, locale: Locale): string {
  if (locale === "zh") return `${Math.round(feet * FT_TO_M).toLocaleString()}m`;
  return `${feet.toLocaleString()}′`;
}

/** Convert a value originally in °F to the displayed unit (without the degree sign). */
export function tempValue(f: number, locale: Locale): number {
  if (locale === "zh") return Math.round(((f - 32) * 5) / 9);
  return Math.round(f);
}

export function fmtTemp(f: number, locale: Locale): string {
  return `${tempValue(f, locale)}°`;
}

export function fmtPrecip(inches: number, locale: Locale): string {
  if (locale === "zh") {
    const mm = inches * IN_TO_MM;
    return `${mm < 1 ? mm.toFixed(1) : Math.round(mm)} 毫米`;
  }
  return `${inches.toFixed(2)}″`;
}

export function fmtWind(mph: number, locale: Locale): string {
  if (locale === "zh") {
    return `${Math.round(mph * MPH_TO_KMH)} 公里/小时`;
  }
  return `${Math.round(mph)} mph`;
}

// ---------------- Locale hook ----------------

function read(): Locale {
  if (typeof window === "undefined") return "en";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "zh" || v === "en" ? v : "en";
}
function write(l: Locale) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {}
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>("en");

  // Hydrate after mount to avoid SSR/CSR mismatch
  useEffect(() => {
    setLocale(read());
    const onChange = () => setLocale(read());
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = (next: Locale) => {
    write(next);
    setLocale(next);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  // Bind locale to t() so callers can just `tt('key')`
  const tt = (key: StringKey, vars?: Record<string, string | number>) => t(key, locale, vars);

  return {
    locale,
    setLocale: update,
    t: tt,
    fmtDistance: (mi: number) => fmtDistance(mi, locale),
    fmtElevation: (ft: number) => fmtElevation(ft, locale),
    fmtElevationShort: (ft: number) => fmtElevationShort(ft, locale),
    fmtTemp: (f: number) => fmtTemp(f, locale),
    tempValue: (f: number) => tempValue(f, locale),
    fmtPrecip: (inches: number) => fmtPrecip(inches, locale),
    fmtWind: (mph: number) => fmtWind(mph, locale),
  };
}

// ---------------- Locale helpers (non-hook) ----------------

/** For places that already have locale in scope (e.g., inside HTML strings) */
export function monthShort(m: number, locale: Locale): string {
  return t(`monthShort.${m}` as StringKey, locale);
}
export function monthFull(m: number, locale: Locale): string {
  return t(`monthFull.${m}` as StringKey, locale);
}

export function weekdayShort(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { weekday: "short" });
}

/** Render a {month, day} as "Apr 30" / "4 月 30 日" — used in section titles
 *  and the date-picker headline. */
export function formatPickedShort(d: { month: number; day: number }, locale: Locale): string {
  if (locale === "zh") return `${d.month} 月 ${d.day} 日`;
  return `${monthShort(d.month, locale)} ${d.day}`;
}

/** Choose a locale-appropriate value with a fallback. The pattern
 *  `locale === "zh" && zhValue ? zhValue : enValue` was duplicated across
 *  TrailCard and TrailDetail — this collapses it. */
export function pickLocalized<T>(
  locale: Locale,
  zhValue: T | null | undefined,
  enValue: T,
): T {
  return locale === "zh" && zhValue != null ? zhValue : enValue;
}
