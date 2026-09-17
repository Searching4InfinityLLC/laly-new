import Link from 'next/link'
import { NavMenu } from '@/components/NavMenu'
import { header } from '@/lib/mock/globals'

// Site navbar. Pinned to the viewport (fixed) — floats over every section, no flow height, so the
// hero's pt-19 still does the reserving. Sits under the preloader's z-[100].
// Opaque cream, matching the hero, so it reads as one surface there and masks the dark sections
// scrolling underneath instead of letting the dark-on-dark logo disappear.
// px-5 (20px) from Figma spacing/20; height standardized to h-19 (76px ≈ Figma 75px).
// Logo = plain <img> from /public (svg needs no next/image optimization, no svgr).
// Reads the Header global — mocked now, a cached Payload fetch in Phase 3 (this stays a server
// component, so that swap is just awaiting the fetch here).
//
// Both logos ship on every page and styles.css hides one: a page that leads on a dark hero tags it
// `.hero-dark`, and `body:has(.hero-dark)` flips the bar. That keeps this a server component with no
// route awareness — the alternative was a client scroll listener for a swap that never changes
// mid-page. The light svg is the same file with the wordmark recoloured; the mark stays brand pink.
export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-19 items-center justify-between bg-[#fffcf9] px-5 sm:px-10">
      {/* home link — a plain next/link, which is all the curtain transition needs: RouteTransition
          intercepts every internal <a> at the document, so nothing else has to be wired up */}
      {/* The two logos are stacked, not swapped in and out of flow: styles.css cross-fades them on
          the bar's own 250ms, and a display swap would land the new one in one frame partway through
          that fade. The link carries the accessible name, so both images are decorative. */}
      <Link href="/" aria-label="Laly Agency — home" className="relative flex items-center">
        <img src="/primarylogo.svg" alt="" width={120} height={28} className="logo-dark h-7 w-30" />
        <img
          src="/primarylogo-light.svg"
          alt=""
          width={120}
          height={28}
          className="logo-light absolute inset-0 h-7 w-30"
        />
      </Link>
      {/* whole global, not just nav — the mobile dropdown also renders the socials and copyright.
          Links are the three service pages (mock/globals.ts) — the only routes that exist yet. */}
      <NavMenu {...header} />
    </header>
  )
}
