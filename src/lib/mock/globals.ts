import type { FooterContent, HeaderContent } from '@/lib/types'

// The footer's [ Services ] column — the three service pages.
const SERVICES = [
  { label: 'Advertisement', href: '/paid-advertising' },
  { label: 'Branding', href: '/branding' },
  { label: 'Technology', href: '/development' },
]

// Stand-in for the Header global until Payload exists (Phase 3 replaces this with a cached fetch).
export const header: HeaderContent = {
  nav: [
    { label: 'CASE STUDIES', href: '/case-studies' },
    { label: 'SERVICES', href: '/services' },
    { label: 'CONTACT', href: '/contact' },
    { label: 'ABOUT', href: '/about' },
  ],
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
