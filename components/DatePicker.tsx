"use client";

import clsx from "clsx";
import { CalendarDays, Sparkles } from "lucide-react";
import {
  DAYS_IN_MONTH,
  type PickedDate,
  clampDay,
} from "@/lib/dates";
import { useLocale, type StringKey } from "@/lib/i18n";

interface DatePickerProps {
  value: PickedDate;
  onChange: (next: PickedDate) => void;
  bestMonths: Set<number>;
}

export default function DatePicker({ value, onChange, bestMonths }: DatePickerProps) {
  const { t, locale } = useLocale();
  const isBest = bestMonths.has(value.month);
  const maxDay = DAYS_IN_MONTH[value.month - 1];

  const headline = locale === "zh"
    ? `${value.month} 月 ${value.day} 日`
    : `${t(`monthFull.${value.month}` as StringKey)} ${value.day}`;
  const monthShortLabel = (m: number) => t(`monthShort.${m}` as StringKey);

  return (
    <div className="space-y-3">
      {/* Big date headline */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/45">
            <CalendarDays className="h-3 w-3" />
            {t("datepicker.planOn")}
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span
              key={`${value.month}-${value.day}`}
              className="animate-tick font-display text-2xl font-medium leading-none text-white"
            >
              {headline}
            </span>
            {isBest ? (
              <span className="flex items-center gap-1 rounded-full border border-forest-300/40 bg-forest-500/20 px-2 py-0.5 text-[10px] font-medium text-forest-100">
                <Sparkles className="h-3 w-3" />
                {t("datepicker.inBest")}
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/55">
                {t("datepicker.offPeak")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Month strip */}
      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: 12 }, (_, idx) => {
          const m = idx + 1;
          const active = m === value.month;
          const best = bestMonths.has(m);
          return (
            <button
              key={m}
              onClick={() => onChange({ month: m, day: clampDay(m, value.day) })}
              className={clsx(
                "relative rounded-md py-1.5 text-[10px] font-medium uppercase tracking-wide transition-all",
                active
                  ? "scale-[1.08] bg-forest-500/45 text-white shadow-[0_2px_12px_rgba(115,154,126,0.35)] ring-1 ring-forest-300/40"
                  : best
                    ? "bg-forest-500/10 text-forest-200 hover:bg-forest-500/20"
                    : "bg-white/5 text-white/55 hover:bg-white/10",
              )}
              title={best ? t("datepicker.bestTooltip") : undefined}
            >
              {monthShortLabel(m)}
              {best && !active && (
                <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-forest-200 drop-shadow-[0_0_4px_rgba(160,189,168,0.9)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day slider */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
          <span>{t("datepicker.dayOf", { month: monthShortLabel(value.month) })}</span>
          <span className="font-mono text-white/65">
            {value.day} / {maxDay}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={maxDay}
          value={value.day}
          onChange={(e) => onChange({ month: value.month, day: Number(e.target.value) })}
          className="day-slider"
        />
      </div>
    </div>
  );
}
