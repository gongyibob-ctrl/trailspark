"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { TRAILS, TRAIL_BY_ID } from "@/lib/trails";
import Sidebar from "@/components/Sidebar";
import TrailDetail from "@/components/TrailDetail";
import UserTrailDetail from "@/components/UserTrailDetail";
import Legend from "@/components/Legend";
import GPXDropZone from "@/components/GPXDropZone";
import type { Trail } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import { useUploads } from "@/lib/uploads";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const QUERY_PARAM = "trail";

function readTrailFromURL(): string | null {
  if (typeof window === "undefined") return null;
  return new URL(window.location.href).searchParams.get(QUERY_PARAM);
}

function writeTrailToURL(id: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (id) url.searchParams.set(QUERY_PARAM, id);
  else url.searchParams.delete(QUERY_PARAM);
  window.history.replaceState({}, "", url);
}

const isUserTrailId = (id: string | null): boolean => !!id && id.startsWith("user-");

export default function Page() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [filteredTrails, setFilteredTrails] = useState<Trail[]>(TRAILS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useLocale();
  const { uploads, remove: removeUpload } = useUploads();

  useEffect(() => {
    const fromUrl = readTrailFromURL();
    // Only restore if it's a known curated id; user trails are session-tied
    if (fromUrl && TRAIL_BY_ID[fromUrl]) {
      setSelectedId(fromUrl);
      setFlyToId(fromUrl);
    }
    const onPop = () => {
      const id = readTrailFromURL();
      const valid = id && TRAIL_BY_ID[id] ? id : null;
      setSelectedId(valid);
      if (valid) setFlyToId(valid);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setFlyToId(id);
    // Only persist curated-trail selection in the URL — user uploads are
    // local-only, so a shareable link makes no sense for them.
    writeTrailToURL(isUserTrailId(id) ? null : id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    writeTrailToURL(null);
  }, []);

  const handleFilterChange = useCallback((next: Trail[]) => setFilteredTrails(next), []);

  const handleDeleteUpload = useCallback(
    (id: string) => {
      removeUpload(id);
      if (selectedId === id) setSelectedId(null);
    },
    [removeUpload, selectedId],
  );

  const selectedTrail =
    selectedId && !isUserTrailId(selectedId) ? TRAIL_BY_ID[selectedId] ?? null : null;
  const selectedUserTrail =
    selectedId && isUserTrailId(selectedId)
      ? uploads.find((u) => u.id === selectedId) ?? null
      : null;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-forest-950">
      <Map
        trails={filteredTrails}
        userTrails={uploads}
        selectedId={selectedId}
        onSelect={handleSelect}
        flyToId={flyToId}
      />

      <Sidebar
        trails={TRAILS}
        userTrails={uploads}
        selectedId={selectedId}
        onSelect={handleSelect}
        onDeleteUpload={handleDeleteUpload}
        onFilterChange={handleFilterChange}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
      />

      <TrailDetail trail={selectedTrail} onClose={handleClose} />
      {selectedUserTrail && (
        <UserTrailDetail
          trail={selectedUserTrail}
          onClose={handleClose}
          onDelete={() => handleDeleteUpload(selectedUserTrail.id)}
        />
      )}

      <Legend />

      <GPXDropZone onUploaded={(id) => handleSelect(id)} />

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
