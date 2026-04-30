"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Mountain, Filter, X, Heart, PanelLeftClose, PanelLeft } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import type { Difficulty, Region, Trail, TrailType } from "@/lib/types";
import { DIFFICULTY_COLOR } from "@/lib/types";
import { useLocale, type StringKey } from "@/lib/i18n";
import { TRAILS_ZH } from "@/lib/trails-zh";
import clsx from "clsx";

interface SidebarProps {
  trails: Trail[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onFilterChange: (filtered: Trail[]) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function Sidebar({
  trails,
  selectedId,
  onSelect,
  onFilterChange,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const [regions, setRegions] = useState<Set<Region>>(new Set());
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(new Set());
  const [types, setTypes] = useState<Set<TrailType>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { locale, setLocale, t } = useLocale();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trails.filter((tr) => {
      if (favoritesOnly && !favorites.has(tr.id)) return false;
      if (q) {
        const zh = TRAILS_ZH[tr.id];
        const haystack = `${tr.name} ${tr.parkUnit} ${zh?.parkUnit ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (regions.size && !regions.has(tr.region)) return false;
      if (difficulties.size && !difficulties.has(tr.difficulty)) return false;
      if (types.size && !types.has(tr.type)) return false;
      return true;
    });
  }, [trails, query, regions, difficulties, types, favoritesOnly, favorites]);

  // notify parent when filtered list changes
  useEffect(() => {
    onFilterChange(filtered);
  }, [filtered, onFilterChange]);

  const toggle = <T extends string>(set: Set<T>, val: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    setter(next);
  };

  const activeFilterCount =
    regions.size + difficulties.size + types.size + (favoritesOnly ? 1 : 0);

  const clearFilters = () => {
    setRegions(new Set());
    setDifficulties(new Set());
    setTypes(new Set());
    setFavoritesOnly(false);
    setQuery("");
  };

  return (
    <>
      <aside
        className={clsx(
          "absolute left-0 top-0 z-20 flex h-full w-[380px] flex-col glass transition-transform duration-300",
          collapsed ? "-translate-x-full ease-in" : "translate-x-0 ease-out",
        )}
        aria-hidden={collapsed}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-500/30 ring-1 ring-forest-400/30">
            <Mountain className="h-5 w-5 text-forest-200" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold tracking-tight text-white">Trailspark</div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-forest-200/70">
              {t("brand.tagline")} · {t("brand.trailsCount", { n: trails.length })}
            </div>
          </div>
          <LocaleToggle locale={locale} onChange={setLocale} />
          <button
            onClick={onToggleCollapsed}
            aria-label={t("sidebar.hide")}
            title={t("sidebar.hide")}
            className="rounded-md p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

      {/* Search */}
      <div className="px-5 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("sidebar.search")}
            className="w-full rounded-lg bg-black/30 py-2 pl-9 pr-9 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-forest-400/60"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/40 hover:bg-white/10 hover:text-white/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between gap-2 px-5 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={clsx(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition",
              filtersOpen
                ? "bg-forest-500/30 text-forest-100"
                : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            {t("sidebar.filters")}
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-ember-500 px-1.5 py-px text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            disabled={favorites.size === 0 && !favoritesOnly}
            className={clsx(
              "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-40",
              favoritesOnly
                ? "bg-rose-500/25 text-rose-200 ring-1 ring-rose-400/30"
                : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
            title={
              favorites.size === 0
                ? t("sidebar.favoritesTooltip.empty")
                : favoritesOnly
                  ? t("sidebar.favoritesTooltip.on")
                  : t("sidebar.favoritesTooltip.off", { n: favorites.size })
            }
          >
            <Heart
              className={clsx("h-3.5 w-3.5", favoritesOnly && "fill-rose-300")}
              strokeWidth={2}
            />
            <span className="text-[11px]">{favorites.size}</span>
          </button>
        </div>
        <span className="text-xs text-white/50">{t("sidebar.results", { n: filtered.length })}</span>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="animate-fade-in space-y-3 border-y border-white/10 bg-black/20 px-5 py-3">
          <FilterGroup
            label={t("sidebar.region")}
            options={(["yosemite-sierra","rainier","olympic","north-cascades","oregon","norcal","socal-desert","bigsur-bay","thru-hike"] as Region[]).map((v) => ({
              value: v,
              label: t(`region.${v}` as StringKey),
            }))}
            active={regions}
            onToggle={(v) => toggle(regions, v, setRegions)}
          />
          <FilterGroup
            label={t("sidebar.difficulty")}
            options={(["easy","moderate","hard","extreme"] as Difficulty[]).map((d) => ({
              value: d,
              label: t(`difficulty.${d}` as StringKey),
              color: DIFFICULTY_COLOR[d],
            }))}
            active={difficulties}
            onToggle={(v) => toggle(difficulties, v, setDifficulties)}
          />
          <FilterGroup
            label={t("sidebar.type")}
            options={(["day","multi-day","thru-hike"] as TrailType[]).map((tp) => ({
              value: tp,
              label: t(`type.${tp}` as StringKey),
            }))}
            active={types}
            onToggle={(v) => toggle(types, v, setTypes)}
          />
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="w-full rounded-md bg-white/5 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
            >
              {t("sidebar.clearFilters")}
            </button>
          )}
        </div>
      )}

      {/* Trail list */}
      <div className="flex-1 overflow-y-auto px-3 pb-5 pt-2">
        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-white/50">
            {t("sidebar.empty")}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {filtered.map((t, i) => (
              <TrailCard
                key={t.id}
                trail={t}
                selected={t.id === selectedId}
                favorite={favorites.has(t.id)}
                onClick={() => onSelect(t.id)}
                onToggleFavorite={() => toggleFavorite(t.id)}
                index={i}
              />
            ))}
          </ul>
        )}
      </div>
      </aside>

      {/* Floating expand button — only visible when collapsed */}
      <button
        onClick={onToggleCollapsed}
        aria-label={t("sidebar.show")}
        title={t("sidebar.show")}
        className={clsx(
          "absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-lg px-2.5 py-2 glass ring-1 ring-white/10 text-white/80 transition-all duration-300",
          "hover:bg-white/8 hover:text-white",
          collapsed
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-3 opacity-0",
        )}
      >
        <PanelLeft className="h-4 w-4" />
        <span className="text-[11px] font-medium uppercase tracking-wider">{t("sidebar.trails")}</span>
      </button>
    </>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  active,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string; color?: string }[];
  active: Set<T>;
  onToggle: (v: T) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isActive = active.has(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={clsx(
                "rounded-md border px-2 py-1 text-[11px] transition",
                isActive
                  ? "border-forest-400/50 bg-forest-500/40 text-white"
                  : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10",
              )}
            >
              {opt.color && (
                <span
                  className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                  style={{ background: opt.color }}
                />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrailCard({
  trail,
  selected,
  favorite,
  onClick,
  onToggleFavorite,
  index,
}: {
  trail: Trail;
  selected: boolean;
  favorite: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
  index: number;
}) {
  const { locale, t, fmtDistance, fmtElevation } = useLocale();
  const zh = TRAILS_ZH[trail.id];
  const parkUnitLabel = locale === "zh" && zh?.parkUnit ? zh.parkUnit : trail.parkUnit;
  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index * 0.025, 0.4)}s` }}
    >
      <div
        className={clsx(
          "trail-card group relative rounded-lg",
          selected
            ? "bg-forest-500/35 ring-1 ring-forest-400/50 shadow-[0_4px_18px_rgba(115,154,126,0.18)]"
            : "hover:bg-white/5",
        )}
      >
        <button onClick={onClick} className="w-full px-3 py-2.5 text-left">
          <div className="flex items-start gap-2.5 pr-7">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: DIFFICULTY_COLOR[trail.difficulty] }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{trail.name}</div>
              <div className="mt-0.5 truncate text-[11px] text-white/55">
                {parkUnitLabel}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-white/65">
                <span>{fmtDistance(trail.lengthMiles)}</span>
                <span className="text-white/30">·</span>
                <span>{t("sidebar.gain", { n: fmtElevation(trail.elevationGainFt) })}</span>
                {trail.permitRequired && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="text-ember-400">{t("sidebar.permit")}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={favorite ? t("detail.aria.favoriteRemove") : t("detail.aria.favoriteSave")}
          className={clsx(
            "absolute right-2 top-2 rounded-md p-1.5 opacity-60 transition-all",
            "hover:scale-110 hover:bg-white/10 hover:opacity-100",
            favorite && "opacity-100",
          )}
        >
          <Heart
            className={clsx(
              "h-3.5 w-3.5 transition-colors",
              favorite ? "fill-rose-400 text-rose-400" : "text-white/55",
            )}
            strokeWidth={2}
          />
        </button>
      </div>
    </li>
  );
}

function LocaleToggle({ locale, onChange }: { locale: "en" | "zh"; onChange: (l: "en" | "zh") => void }) {
  return (
    <div className="flex shrink-0 items-center rounded-md bg-white/5 p-0.5 ring-1 ring-white/10">
      {(["en", "zh"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={clsx(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition",
            locale === l ? "bg-forest-500/40 text-white" : "text-white/55 hover:text-white",
          )}
          aria-label={l === "en" ? "English" : "中文"}
        >
          {l === "en" ? "EN" : "中"}
        </button>
      ))}
    </div>
  );
}
