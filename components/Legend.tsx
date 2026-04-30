"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronUp, ChevronDown } from "lucide-react";

// Same paths as the pin glyphs in Map.tsx so the legend matches what's on the map.
function TentGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 20 L 12 4 L 21 20 Z" />
      <path d="M12 20 L 12 14" />
    </svg>
  );
}
function CompassGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <polygon
        points="16 8 14 14 8 16 10 10"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
import { DIFFICULTY_COLOR, type Difficulty } from "@/lib/types";
import { useLocale, type StringKey } from "@/lib/i18n";

const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "hard", "extreme"];

export default function Legend() {
  const { t } = useLocale();
  const [open, setOpen] = useState(true);

  return (
    <div className="pointer-events-auto select-none">
      <div className="glass overflow-hidden rounded-lg ring-1 ring-white/8 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-white/85"
        >
          <span>{t("legend.title")}</span>
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>

        <div
          className={clsx(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-2 border-t border-white/8 px-3 py-2">
              <div className="space-y-1">
                {DIFFICULTIES.map((d) => (
                  <div key={d} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="block h-2.5 w-6 rounded-full"
                      style={{ background: DIFFICULTY_COLOR[d] }}
                    />
                    <span className="text-white/75">{t(`difficulty.${d}` as StringKey)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 border-t border-white/8 pt-2 text-[11px] text-white/65">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <TentGlyph className="h-3 w-3 text-white/85" />
                  </span>
                  {t("type.multi-day")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <CompassGlyph className="h-3 w-3 text-white/85" />
                  </span>
                  {t("type.thru-hike")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
