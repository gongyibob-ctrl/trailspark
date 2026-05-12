import Link from "next/link";
import { Logo } from "./Logo";

/** Global header. Persists across landing, /trails, /map, and /trails/[id].
 *  Height: 56px (h-14). Pages that need full viewport (the map) should
 *  account for this via `h-[calc(100vh-3.5rem)]` on their main container.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0a1612]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-3 text-[13.5px] text-white/65">
          <Link href="/map" className="rounded-md px-2.5 py-1.5 hover:bg-white/[0.05] hover:text-white">
            Map
          </Link>
          <Link href="/trails" className="rounded-md px-2.5 py-1.5 hover:bg-white/[0.05] hover:text-white">
            Trails
          </Link>
          <Link
            href="/#plan"
            className="ml-1 rounded-lg bg-forest-400 px-3.5 py-1.5 text-[13px] font-semibold text-black transition hover:bg-forest-300 sm:px-4"
          >
            Plan a trip
          </Link>
        </nav>
      </div>
    </header>
  );
}
