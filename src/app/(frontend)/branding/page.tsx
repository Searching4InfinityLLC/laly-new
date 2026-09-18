import type { Metadata } from 'next'
import heroBg from '../../../../public/branding/hero.webp'
import { BrandSystem } from '@/components/sections/BrandSystem'
import { Channels } from '@/components/sections/Channels'
import { CompoundEffect } from '@/components/sections/CompoundEffect'
import Contact from '@/components/sections/Contact'
import { Faq } from '@/components/sections/Faq'
import Note from '@/components/sections/Note'
import { Pricing } from '@/components/sections/Pricing'
import { ScratchBand } from '@/components/sections/ScratchBand'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { SectionFade } from '@/components/ui/SectionFade'
import { SectionThemeSequence } from '@/components/ui/SectionTheme'
import { getBranding, getHome } from '@/lib/cms'

export const metadata: Metadata = {
  title: 'Branding | Laly Agency',
  description:
    'A visibility system across search, social, and the physical world — so your brand becomes the default choice before prospects ever need you.',
}

// Same ISR window as the other two pages, so they never go stale at different times.
export const revalidate = 3600

// Figma 2724:3346 — where Strategy's "The Power of Branding" card points.
//
// Copy comes from the Pages 'branding' doc, falling back per block to src/lib/mock/branding.ts (see
// src/blocks/branding.ts and getBranding in src/lib/cms.ts). Four of the eight blocks are this
// page's own; the hero, Pricing, FAQ and the closing band are the same blocks /paid-advertising
// uses, carrying this doc's own rows.
//
// The hero photo is the exception on this page — a static import, because it is the layout's 20%
// wash rather than artwork an editor would swap.
//
// The closing CTA is read off the HOME doc, exactly as /paid-advertising does it, so one edit in the
// admin moves all three pages.
//
// Post-scratch sections share scroll-driven light/dark themes. Hero, scratch and Contact keep
// their existing treatment; inner content reveals remain independent.
export default async function BrandingPage() {
  const [{ contact }, branding] = await Promise.all([getHome(), getBranding()])

  return (
    <main>
      <ServiceHero content={branding.hero} image={heroBg} label="Branding" />

      {/* Figma 2724:4151 — the positioning line, under the same scratch panel the refund promise
          gets on /paid-advertising. */}
      <SectionFade>
        <ScratchBand label="Brand versus paid ads" scratchLabel={branding.positioning.scratchLabel}>
          {branding.positioning.body.before}
          {/* Neue Haas 65 Medium at 24 against the 28px serif — medium here, where the heroes go bold.
              max-md:block (client note): on a phone "Brand owns it." drops to its own line under
              "Paid ads rent attention." instead of wrapping mid-phrase; one line again at md+. */}
          <strong className="font-display text-2xl font-medium tracking-[0.25px] max-md:block">
            {branding.positioning.body.emphasis}
          </strong>
          {branding.positioning.body.after}
        </ScratchBand>
      </SectionFade>

      <SectionThemeSequence
        focusFirst
        sections={[
          { id: 'system', tone: 'cream', texture: 'grid', content: <BrandSystem content={branding.system} /> },
          { id: 'channels', tone: 'dark', content: <Channels content={branding.channels} /> },
          { id: 'compound', tone: 'dark', content: <CompoundEffect content={branding.compound} /> },
          { id: 'pricing', tone: 'cream', content: <Pricing content={branding.pricing} /> },
          { id: 'faq', tone: 'cream', texture: 'grid', content: <Faq content={branding.faq} /> },
        ]}
        contact={<SectionFade><Contact content={contact} /></SectionFade>}
      />

      {/* Same closing band as /paid-advertising, down to the 458px column — which is what puts the
          break after "brand" that the copy also sets by hand. */}
      <SectionFade>
        <Note content={branding.note} className="mx-auto max-w-[458px]" />
      </SectionFade>
    </main>
  )
}
