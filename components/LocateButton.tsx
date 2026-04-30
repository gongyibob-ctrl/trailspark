"use client";

import { useEffect, useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { GeoStatus } from "@/lib/use-geolocation";
import { useLocale, type StringKey } from "@/lib/i18n";

interface LocateButtonProps {
  status: GeoStatus;
  hasPosition: boolean;
  onClick: () => void;
}

export default function LocateButton({ status, hasPosition, onClick }: LocateButtonProps) {
  const { t } = useLocale();
  const [hint, setHint] = useState<string | null>(null);

  // Show a transient hint when permission is denied or geolocation errors.
  // Auto-dismiss after a few seconds so it doesn't linger.
  useEffect(() => {
    if (status === "denied" || status === "unavailable" || status === "error") {
      const k =
        status === "denied"
          ? "locate.denied"
          : status === "unavailable"
            ? "locate.unavailable"
            : "locate.error";
      setHint(t(k as StringKey));
      const id = window.setTimeout(() => setHint(null), 4500);
      return () => window.clearTimeout(id);
    }
    setHint(null);
  }, [status, t]);

  const busy = status === "prompting" && !hasPosition;
  const active = hasPosition && status === "granted";
  const label = hasPosition ? t("locate.recenter") : t("locate.button");

  return (
    <div className="pointer-events-auto relative">
      <button
        onClick={onClick}
        aria-label={label}
        title={busy ? t("locate.requesting") : label}
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-full glass ring-1 transition-all sm:h-10 sm:w-10",
          active
            ? "ring-blue-400/50 text-blue-200 hover:bg-blue-500/15"
            : "ring-white/10 text-white/75 hover:text-white hover:bg-white/8",
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed
            className={clsx("h-4 w-4", active && "drop-shadow-[0_0_6px_rgba(96,165,250,0.7)]")}
            strokeWidth={2}
          />
        )}
      </button>
      {hint && (
        <div className="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-red-500/15 px-3 py-1.5 text-[11px] text-red-200 ring-1 ring-red-400/35 backdrop-blur animate-fade-in">
          {hint}
        </div>
      )}
    </div>
  );
}
