"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { TRAILS, TRAIL_BY_ID } from "@/lib/trails";
import Sidebar from "@/components/Sidebar";
import TrailDetail from "@/components/TrailDetail";
import Legend from "@/components/Legend";
import type { Trail } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

// Map needs to be client-only (uses window/canvas)
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const QUERY_PARAM = "trail";

function readTrailFromURL(): string | null {
  if (typeof window === "undefined") return null;
  const id = new URL(window.location.href).searchParams.get(QUERY_PARAM);
  return id && TRAIL_BY_ID[id] ? id : null;
}

function writeTrailToURL(id: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (id) url.searchParams.set(QUERY_PARAM, id);
  else url.searchParams.delete(QUERY_PARAM);
  // Use replaceState so we don't pollute the back-button history with every click
  window.history.replaceState({}, "", url);
}

export default function Page() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [filteredTrails, setFilteredTrails] = useState<Trail[]>(TRAILS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useLocale();

  // Hydrate selection from URL on mount
  useEffect(() => {
    const fromUrl = readTrailFromURL();
    if (fromUrl) {
      setSelectedId(fromUrl);
      setFlyToId(fromUrl);
    }
    // Listen for back/forward
    const onPop = () => {
      const id = readTrailFromURL();
      setSelectedId(id);
      if (id) setFlyToId(id);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setFlyToId(id);
    writeTrailToURL(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    writeTrailToURL(null);
  }, []);

  const handleFilterChange = useCallback((next: Trail[]) => setFilteredTrails(next), []);

  const selectedTrail = selectedId ? TRAIL_BY_ID[selectedId] ?? null : null;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-forest-950">
      <Map
        trails={filteredTrails}
        selectedId={selectedId}
        onSelect={handleSelect}
        flyToId={flyToId}
      />

      <Sidebar
        trails={TRAILS}
        selectedId={selectedId}
        onSelect={handleSelect}
        onFilterChange={handleFilterChange}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
      />

      <TrailDetail trail={selectedTrail} onClose={handleClose} />

      <Legend />

      {/* Bottom-left brand strip — slides with the sidebar */}
      <div
        className={clsx(
          "pointer-events-none absolute bottom-3 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/35 transition-[left] duration-300 ease-out",
          sidebarCollapsed ? "left-[120px]" : "left-[400px]",
        )}
      >
        <span className="h-px w-6 bg-white/20" />
        <span>{t("brand.footer")}</span>
      </div>
    </main>
  );
}
