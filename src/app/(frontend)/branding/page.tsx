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
// Every section but the hero is wrapped in <SectionFade>: one opacity ramp per section, tripped by
// its own observer as it comes on screen (tech lead). The hero is above the fold, so it has nothing
// to fade in from. This is on top of, not instead of, the reveals the sections run on their own
// contents.
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

      <SectionFade>
        <BrandSystem content={branding.system} />
      </SectionFade>

      <SectionFade>
        <Channels content={branding.channels} />
      </SectionFade>

      {/* No <SectionFade> here, unlike its neighbours (client note): The Channels above is the same
          #151414 grain ground, so ramping this band's opacity only reads as a dark-to-lighter flicker
          across the seam rather than a reveal. Its own inner animations still run. */}
      <CompoundEffect content={branding.compound} />

      <SectionFade>
        <Pricing content={branding.pricing} />
      </SectionFade>

      <SectionFade>
        <Faq content={branding.faq} />
      </SectionFade>

      {/* Figma draws Contact identically to /paid-advertising's, so it reads the same home doc. */}
      <SectionFade>
        <Contact content={contact} />
      </SectionFade>

      {/* Same closing band as /paid-advertising, down to the 458px column — which is what puts the
          break after "brand" that the copy also sets by hand. */}
      <SectionFade>
        <Note content={branding.note} className="mx-auto max-w-[458px]" />
      </SectionFade>
    </main>
  )
}
