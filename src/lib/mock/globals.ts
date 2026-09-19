import type { FooterContent, HeaderContent } from '@/lib/types'

// The footer's [ Services ] column — the three service pages.
const SERVICES = [
  { label: 'Advertisement', href: '/paid-advertising' },
  { label: 'Branding', href: '/branding' },
  { label: 'Technology', href: '/development' },
]

// Stand-in for the Header global until Payload exists (Phase 3 replaces this with a cached fetch).
export const header: HeaderContent = {
  // the three service pages — the only routes that exist yet (case studies / about / contact
  // pages are not built). Same list as the footer's [ Services ] column, caps like the old nav.
  nav: SERVICES.map((link) => ({ ...link, label: link.label.toUpperCase() })),
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
  // The NAV column is hidden (Footer.tsx) but still in the HTML, so it only lists routes that exist —
  // crawlers follow display:none links. Add Services / About / Contact back with their pages.
  nav: [{ label: 'Home', href: '/' }],
  services: SERVICES,
  email: 'grow@laly.agency',
  // phone: unset until the real number is handed over — the (555) placeholder was a live tel: link.
  copyright: '© LALY AGENCY . 2026',
}
