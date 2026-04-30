"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { ingestGPXFile, useUploads } from "@/lib/uploads";

interface GPXDropZoneProps {
  /** Called with the upload's id once a file has been ingested. */
  onUploaded?: (id: string) => void;
}

/** Page-wide GPX drop target. Renders a visible overlay only while the user
 *  is actively dragging a file over the window. */
export default function GPXDropZone({ onUploaded }: GPXDropZoneProps) {
  const { t } = useLocale();
  const { add, uploads, max } = useUploads();
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const counterRef = useRef(0);

  // Show overlay while a file is dragged over the document. We use a
  // ref-counter because dragenter/dragleave fire repeatedly as the cursor
  // crosses child elements.
  useEffect(() => {
    const onEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      counterRef.current += 1;
      setActive(true);
    };
    const onLeave = () => {
      counterRef.current = Math.max(0, counterRef.current - 1);
      if (counterRef.current === 0) setActive(false);
    };
    const onOver = (e: DragEvent) => {
      e.preventDefault(); // required to allow drop
    };
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      counterRef.current = 0;
      setActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) await ingest(file);
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ingest = async (file: File) => {
    setError(null);
    if (uploads.length >= max) {
      setError(t("upload.maxReached", { n: max }));
      return;
    }
    try {
      const trail = await ingestGPXFile(file);
      add(trail);
      onUploaded?.(trail.id);
    } catch (e: any) {
      setError(t("upload.failed", { err: e?.message ?? "unknown" }));
    }
    window.setTimeout(() => setError(null), 4000);
  };

  // Expose a programmatic upload trigger via window for the sidebar button
  // (avoids prop drilling a ref through layout)
  useEffect(() => {
    const handler = (e: Event) => {
      const file = (e as CustomEvent<File>).detail;
      if (file) void ingest(file);
    };
    window.addEventListener("trailspark:upload-file", handler as EventListener);
    return () => window.removeEventListener("trailspark:upload-file", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploads.length]);

  return (
    <>
      {/* Drop overlay — visible only during drag */}
      {active && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-forest-950/70 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-forest-300/60 bg-forest-500/15 px-12 py-10 text-center">
            <Upload className="h-10 w-10 text-forest-200" strokeWidth={1.6} />
            <div className="text-base font-semibold text-white">{t("upload.dropOverlay")}</div>
          </div>
        </div>
      )}

      {/* Error toast — appears bottom-center */}
      {error && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
          <div className="rounded-md bg-red-500/15 px-4 py-2 text-[12px] text-red-200 ring-1 ring-red-400/35 backdrop-blur">
            {error}
          </div>
        </div>
      )}
    </>
  );
}
