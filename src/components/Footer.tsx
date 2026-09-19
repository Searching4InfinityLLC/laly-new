import { footer } from '@/lib/mock/globals'

// Site footer global — cream ground under the Note band. Four columns spread across the 1440 frame:
// logo | NAV | CONTACT | copyright. Figma padding 48/48/20/48 (top/right/bottom/left), gap 48.
// Server component reading the Footer global (mocked now, a cached Payload fetch in Phase 3).
// Logo = plain <img> from /public (svg needs no next/image, no svgr). Figma size 400x93.
export default function Footer() {
  return (
    <footer className="w-full bg-[#fffcf9]">
      {/* mobile: 48 top / 20 sides / 20 bottom, three blocks 48 apart — logo, the NAV+CONTACT
          column, then the copyright */}
      <div className="section-shell flex flex-col items-center gap-12 px-5 pt-12 pb-5 sm:px-10 md:flex-row md:items-start md:justify-between md:gap-12 md:px-12 md:pt-12 md:pb-5">
        <a href="/" aria-label="Laly Agency home" className="block">
          <img
            src="/primarylogo.svg"
            alt="Laly Agency"
            width={400}
            height={94}
            className="h-auto w-[300px] md:w-[400px]"
          />
        </a>

        {/* NAV and CONTACT are one block on mobile — 80 between the two groups, 20 under them.
            The wrapper dissolves at md+ so the desktop four-column row is unchanged. */}
        {/* mobile: one column, 80 between the groups, 20 under. desktop: its own space-between row
            that fills the middle of the footer, 48 under. */}
        <div className="flex flex-col items-center gap-20 pb-5 md:flex-1 md:flex-row md:items-start md:justify-between md:gap-0 md:px-2 md:pb-12">
        {/* 32 from the title to the list, 12 between links.
            HIDDEN (client note): the pages it links to are not ready. display:none rather than
            deleted, so bringing it back is swapping `hidden` for `flex`. SERVICES and CONTACT keep
            their md:flex-1 and share the row. */}
        <nav className="hidden flex-col items-center gap-8 md:flex-1">
          <p className="font-mono text-lg font-normal uppercase leading-[1.4] tracking-[0.2em] text-[#867A72]">[ Nav ]</p>
          <div className="flex flex-col items-center gap-3">
            {footer.nav.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-sans text-xl leading-[1.25] tracking-[-0.01em] text-[#262626] transition-opacity hover:opacity-60"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Same treatment as NAV and CONTACT — title, 32 to the list, 12 between links. With NAV
            hidden the desktop row reads logo | SERVICES | CONTACT | copyright. */}
        <nav aria-label="Services" className="flex flex-col items-center gap-8 md:flex-1">
          <p className="font-mono text-lg font-normal uppercase leading-[1.4] tracking-[0.2em] text-[#867A72]">[ Services ]</p>
          <div className="flex flex-col items-center gap-3">
            {footer.services.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-sans text-xl leading-[1.25] tracking-[-0.01em] text-[#262626] transition-opacity hover:opacity-60"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="flex flex-col items-center gap-8 md:flex-1">
          <p className="font-mono text-lg font-normal uppercase leading-[1.4] tracking-[0.2em] text-[#867A72]">[ Contact ]</p>
          <div className="flex flex-col items-center gap-3">
            <a
              href={`mailto:${footer.email}`}
              className="font-sans text-xl leading-[1.25] tracking-[-0.01em] text-[#262626] transition-opacity hover:opacity-60"
            >
              {footer.email}
            </a>
            {footer.phone && (
              <a
                href={`tel:${footer.phone.replace(/[^\d+]/g, '')}`}
                className="font-sans text-xl leading-[1.25] tracking-[-0.01em] text-[#262626] transition-opacity hover:opacity-60"
              >
                {footer.phone}
              </a>
            )}
          </div>
        </div>
        </div>

        {/* heading/h4/xs: New Spirit Condensed 400 / 18 / 140% / letter-spacing s / #FF6D6A */}
        <p className="font-sans text-lg font-normal leading-[1.4] tracking-[-0.02em] text-[#FF6D6A]">
          {footer.copyright}
        </p>
      </div>
    </footer>
  )
}
