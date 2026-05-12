import Link from "next/link";

/** The brand mark: asymmetric mountain silhouette with a 4-point spark
 *  hovering above the peak. The asymmetry keeps it from looking generic
 *  "outdoor brand"; the spark is the visual rhyme with the name "Trailspark".
 *
 *  Color follows `currentColor`, so wrap it in a span with the desired hue
 *  (forest-300, white, etc.) at the call site.  Default size is 1em so it
 *  scales with the surrounding font size.
 */
export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 20L10 7L14 14L17 11L21 20H3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M17.5 3L18.15 4.35L19.5 5L18.15 5.65L17.5 7L16.85 5.65L15.5 5L16.85 4.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Wordmark with the brand mark. Use in the global header / footer. */
export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const markSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const textSize = size === "sm" ? "text-[15px]" : "text-[17px]";
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 transition"
      aria-label="Trailspark home"
    >
      <span className="text-forest-300 transition group-hover:text-forest-200">
        <LogoMark className={markSize} />
      </span>
      <span className={`font-display font-semibold tracking-tight text-white ${textSize}`}>
        Trailspark
      </span>
    </Link>
  );
}
