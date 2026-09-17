import type { FooterContent, HeaderContent } from '@/lib/types'

// The three service pages — the only routes that exist yet, so both the MENU sheet and the footer's
// [ Services ] column list exactly these. One array so the two can't drift; each place sets its own
// case (the MENU pills are uppercase CSS-side via Button, the footer is sentence case as written).
const SERVICES = [
  { label: 'Advertisement', href: '/paid-advertising' },
  { label: 'Branding', href: '/branding' },
  { label: 'Technology', href: '/development' },
]

// Stand-in for the Header global until Payload exists (Phase 3 replaces this with a cached fetch).
export const header: HeaderContent = {
  // was CASE STUDIES / SERVICES / CONTACT / ABOUT — none of those routes exist, which is why the
  // MENU was hidden. It now points at the three pages that do.
  nav: SERVICES.map((s) => ({ ...s, label: s.label.toUpperCase() })),
  // mobile dropdown only (Figma 3038:1661). hrefs are unset for the same reason the Contact
  // block's are — the real accounts haven't been handed over yet.
  socials: [
    { platform: 'instagram' },
    { platform: 'tiktok' },
    { platform: 'youtube' },
    { platform: 'facebook' },
  ],
  copyright: '© LALY AGENCY . 2026',
}

// Stand-in for the Footer global until Payload exists.
export const footer: FooterContent = {
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  services: SERVICES,
  email: 'grow@laly.agency',
  phone: '(555) 825 - 4767',
  copyright: '© LALY AGENCY . 2026',
}
