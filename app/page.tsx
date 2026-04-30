"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { TRAILS, TRAIL_BY_ID } from "@/lib/trails";
import Sidebar from "@/components/Sidebar";
import TrailDetail from "@/components/TrailDetail";
import UserTrailDetail from "@/components/UserTrailDetail";
import Legend from "@/components/Legend";
import LocateButton from "@/components/LocateButton";
import GPXDropZone from "@/components/GPXDropZone";
import type { Trail } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import { useUploads } from "@/lib/uploads";
import { useGeolocation } from "@/lib/use-geolocation";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const QUERY_PARAM = "trail";

const MOBILE_QUERY = "(max-width: 639px)";
function isMobileNow(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;
}

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
  // Sidebar starts collapsed on mobile so the map is visible first. The
  // initial value must match SSR (false) to avoid hydration mismatch; the
  // effect below collapses it on mobile after mount.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recenterTick, setRecenterTick] = useState(0);
  const { t } = useLocale();
  const { uploads, remove: removeUpload } = useUploads();
  const { position: userPosition, status: geoStatus, start: startGeo } = useGeolocation();

  useEffect(() => {
    if (isMobileNow()) setSidebarCollapsed(true);
  }, []);

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
    // On phones the sidebar is full-screen; auto-close it so the user can see
    // the map fly to the picked trail before the detail panel slides in.
    if (isMobileNow()) setSidebarCollapsed(true);
    // Only persist curated-trail selection in the URL — user uploads are
    // local-only, so a shareable link makes no sense for them.
    writeTrailToURL(isUserTrailId(id) ? null : id);
  }, []);

  const handleLocate = useCallback(() => {
    startGeo();
    setRecenterTick((n) => n + 1);
  }, [startGeo]);

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
    <main className="relative h-screen w-screen overflow-hidden bg-forest-950 [height:100dvh]">
      <h1 className="sr-only">
        Trailspark — interactive map of 75 hand-curated hiking trails on the US West Coast
      </h1>
      <Map
        trails={filteredTrails}
        userTrails={uploads}
        selectedId={selectedId}
        onSelect={handleSelect}
        flyToId={flyToId}
        userPosition={userPosition}
        recenterTick={recenterTick}
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
        userPosition={userPosition}
      />

      <TrailDetail trail={selectedTrail} onClose={handleClose} />
      {selectedUserTrail && (
        <UserTrailDetail
          trail={selectedUserTrail}
          onClose={handleClose}
          onDelete={() => handleDeleteUpload(selectedUserTrail.id)}
        />
      )}

      <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2">
        <LocateButton
          status={geoStatus}
          hasPosition={!!userPosition}
          onClick={handleLocate}
        />
        <Legend />
      </div>

      <GPXDropZone onUploaded={(id) => handleSelect(id)} />

      <div
        className={clsx(
          "pointer-events-none absolute bottom-3 z-10 hidden items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/35 transition-[left] duration-300 ease-out sm:flex",
          sidebarCollapsed ? "left-[120px]" : "left-[400px]",
        )}
      >
        <span className="h-px w-6 bg-white/20" />
        <span>{t("brand.footer")}</span>
      </div>
    </main>
  );
}
