"use client";

import clsx from "clsx";
import { Star } from "lucide-react";

export type SectionAccent = "neutral" | "forest" | "ember" | "blue" | "violet";

const ACCENT_BAR: Record<SectionAccent, string> = {
  neutral: "bg-white/40",
  forest: "bg-forest-300",
  ember: "bg-ember-400",
  blue: "bg-blue-400",
  violet: "bg-violet-400",
};

interface SectionProps {
  title: string;
  accent?: SectionAccent;
  right?: React.ReactNode;
  children: React.ReactNode;
  /** Stagger delay in seconds × index. Pass undefined to skip the rise animation. */
  delay?: number;
  /** When true, content has its own padding — the section adds none. */
  flush?: boolean;
}

export function Section({
  title,
  accent = "neutral",
  right,
  children,
  delay,
  flush = false,
}: SectionProps) {
  const style = delay != null ? { animationDelay: `${0.08 + delay * 0.07}s` } : undefined;
  return (
    <section
      className={clsx(
        "rounded-xl bg-white/[0.03] ring-1 ring-white/10",
        delay != null && "animate-rise",
      )}
      style={style}
    >
      <header className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
        <h3 className="flex items-center gap-2 text-[13.5px] font-semibold tracking-tight text-white">
          <span className={`h-3.5 w-[3px] rounded-full ${ACCENT_BAR[accent]}`} />
          {title}
        </h3>
        {right && <div className="shrink-0">{right}</div>}
      </header>
      <div className={flush ? "" : "px-4 pb-4"}>{children}</div>
    </section>
  );
}

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const STAR_INDEXES = [1, 2, 3, 4, 5] as const;

/** Scenery rating, rendered as 5 stars with the first n filled. */
export function SceneryStars({
  n,
  size = "sm",
  title,
}: {
  n: number;
  size?: "sm" | "md";
  title?: string;
}) {
  const px = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={title} title={title}>
      {STAR_INDEXES.map((i) => (
        <Star
          key={i}
          className={clsx(px, i <= n ? "fill-amber-300 text-amber-300" : "text-white/25")}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/** Dark-tinted stat card used in the detail-panel header strip. */
export function Stat({ icon, label, value }: StatProps) {
  return (
    <div className="rounded-xl bg-black/30 px-3.5 py-2.5 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/55">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-[16px] font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}
