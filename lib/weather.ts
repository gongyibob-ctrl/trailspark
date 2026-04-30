// Open-Meteo client. No API key required.
//
// Strategy: fetch 5 years of daily archive in one call per trailhead, then derive
// month-by-month and date-specific aggregates client-side. Lets the user pick any
// date and get historical norms for that exact calendar day without re-fetching.

export interface RawDaily {
  dates: string[];
  tempMax: (number | null)[]; // °C
  tempMin: (number | null)[]; // °C
  precip: (number | null)[]; // mm
}

export interface MonthlyNormal {
  month: number; // 1-12
  tempMaxF: number;
  tempMinF: number;
  precipInches: number;
  snowLikely: boolean;
}

export interface DateNormal {
  month: number;
  day: number;
  avgHighF: number;
  avgLowF: number;
  rangeHighF: [number, number]; // min seen high, max seen high
  rangeLowF: [number, number];
  precipInches: number; // avg daily precip × window
  precipDays: number; // out of `years`
  snowLikely: boolean;
  years: number; // sample size
}

export interface ForecastDay {
  date: string;
  tempMaxF: number;
  tempMinF: number;
  precipInches: number;
  weatherCode: number;
  windMph: number;
}

const ARCHIVE_BASE = "https://archive-api.open-meteo.com/v1/archive";
const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";

const cToF = (c: number) => (c * 9) / 5 + 32;
const mmToIn = (mm: number) => mm / 25.4;

interface ArchiveResponse {
  daily?: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
  };
}

/** One network call per trail. Returns 5 most-recent full years of daily archive. */
export async function fetchTrailArchive(lat: number, lng: number): Promise<RawDaily> {
  const endYear = new Date().getFullYear() - 1;
  const startYear = endYear - 4;
  const url = `${ARCHIVE_BASE}?latitude=${lat}&longitude=${lng}&start_date=${startYear}-01-01&end_date=${endYear}-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=celsius&precipitation_unit=mm&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo archive ${res.status}`);
  const data = (await res.json()) as ArchiveResponse;
  if (!data.daily) throw new Error("Open-Meteo: no daily data");
  return {
    dates: data.daily.time,
    tempMax: data.daily.temperature_2m_max,
    tempMin: data.daily.temperature_2m_min,
    precip: data.daily.precipitation_sum,
  };
}

/** Aggregate by month → 12 entries. Used by the climate chart. */
export function monthlyNormals(raw: RawDaily): MonthlyNormal[] {
  const acc: Record<number, { maxSum: number; minSum: number; precipSum: number; minTempMin: number; count: number }> = {};
  for (let m = 1; m <= 12; m++) acc[m] = { maxSum: 0, minSum: 0, precipSum: 0, minTempMin: 99, count: 0 };

  raw.dates.forEach((d, i) => {
    const month = Number(d.split("-")[1]);
    const tmax = raw.tempMax[i];
    const tmin = raw.tempMin[i];
    const prec = raw.precip[i] ?? 0;
    if (tmax == null || tmin == null) return;
    const a = acc[month];
    a.maxSum += tmax;
    a.minSum += tmin;
    a.precipSum += prec;
    if (tmin < a.minTempMin) a.minTempMin = tmin;
    a.count += 1;
  });

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const a = acc[m];
    const days = a.count || 1;
    const tempMaxC = a.maxSum / days;
    const tempMinC = a.minSum / days;
    const precipMm = (a.precipSum / days) * 30;
    return {
      month: m,
      tempMaxF: Math.round(cToF(tempMaxC)),
      tempMinF: Math.round(cToF(tempMinC)),
      precipInches: Math.round(mmToIn(precipMm) * 10) / 10,
      snowLikely: a.minTempMin < -2 && precipMm > 25,
    };
  });
}

/**
 * Aggregate over a ±halfWindow-day window around (month, day) across all years.
 * A 7-day window smooths daily noise while keeping the picked date meaningful.
 */
export function normalForDate(
  raw: RawDaily,
  month: number,
  day: number,
  halfWindow = 3,
): DateNormal {
  const targetDoY = dayOfYear(month, day);
  const highs: number[] = [];
  const lows: number[] = [];
  const precips: number[] = [];
  let precipDays = 0;
  let coldWetDays = 0;
  const years = new Set<number>();

  raw.dates.forEach((d, i) => {
    const [y, m, dd] = d.split("-").map(Number);
    const tmax = raw.tempMax[i];
    const tmin = raw.tempMin[i];
    const prec = raw.precip[i] ?? 0;
    if (tmax == null || tmin == null) return;
    // distance from target day-of-year, wrap-around
    const doY = dayOfYear(m, dd);
    let dist = Math.abs(doY - targetDoY);
    if (dist > 182) dist = 365 - dist;
    if (dist > halfWindow) return;
    years.add(y);
    highs.push(tmax);
    lows.push(tmin);
    precips.push(prec);
    if (prec > 1) precipDays += 1;
    if (tmin < -1 && prec > 5) coldWetDays += 1;
  });

  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
  const sampleCount = Math.max(highs.length, 1);
  // approximate "this date" from the (2*halfWindow+1)-day window: scale down precip days to match a per-date estimate
  const window = 2 * halfWindow + 1;
  const samplesPerDay = sampleCount / window;
  const approxPrecipDaysOnDate = precipDays / Math.max(samplesPerDay, 1);

  return {
    month,
    day,
    avgHighF: Math.round(cToF(avg(highs))),
    avgLowF: Math.round(cToF(avg(lows))),
    rangeHighF: [Math.round(cToF(Math.min(...highs))), Math.round(cToF(Math.max(...highs)))],
    rangeLowF: [Math.round(cToF(Math.min(...lows))), Math.round(cToF(Math.max(...lows)))],
    precipInches: Math.round(mmToIn(avg(precips)) * 100) / 100,
    precipDays: Math.round(approxPrecipDaysOnDate * 10) / 10,
    snowLikely: coldWetDays > 0,
    years: years.size,
  };
}

function dayOfYear(month: number, day: number): number {
  const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cum[month - 1] + day;
}

interface ForecastResponse {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
  };
}

export async function fetchForecast(lat: number, lng: number): Promise<ForecastDay[]> {
  const url = `${FORECAST_BASE}?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max&temperature_unit=celsius&precipitation_unit=mm&wind_speed_unit=mph&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo forecast ${res.status}`);
  const data = (await res.json()) as ForecastResponse;
  if (!data.daily) throw new Error("Open-Meteo: no forecast data");
  return data.daily.time.map((d, i) => ({
    date: d,
    tempMaxF: Math.round(cToF(data.daily!.temperature_2m_max[i])),
    tempMinF: Math.round(cToF(data.daily!.temperature_2m_min[i])),
    precipInches: Math.round(mmToIn(data.daily!.precipitation_sum[i]) * 100) / 100,
    weatherCode: data.daily!.weather_code[i],
    windMph: Math.round(data.daily!.wind_speed_10m_max[i]),
  }));
}

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Fog";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "—";
}

export function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 49) return "🌫";
  if (code <= 59) return "🌦";
  if (code <= 69) return "🌧";
  if (code <= 79) return "❄️";
  if (code <= 84) return "🌧";
  if (code <= 99) return "⛈";
  return "🌡";
}
