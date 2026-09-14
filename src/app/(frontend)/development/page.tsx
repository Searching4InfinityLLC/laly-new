import type { Metadata } from 'next'
import heroBg from '../../../../public/development/hero.webp'
import Contact from '@/components/sections/Contact'
import HowWeHelp from '@/components/sections/HowWeHelp'
import Note from '@/components/sections/Note'
import OurMethod from '@/components/sections/OurMethod'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { SectionFade } from '@/components/ui/SectionFade'
import { getDevelopment, getHome } from '@/lib/cms'

export const metadata: Metadata = {
  title: 'Development | Laly Agency',
  description:
    'Custom software built around how your business actually works — not the third-party tools you have been forced to fit into.',
}

// Same ISR window as the other three pages, so they never go stale at different times.
export const revalidate = 3600

// Figma 3292:4643 — where Strategy's "The Power of Technology" card points.
//
// Still the shortest of the three service pages: hero, How We Help, Our Method, Contact, closing
// band. No Pricing and no FAQ — the frame does not draw them here, unlike on /paid-advertising and
// /branding, so this page's doc carries no rows for them either.
//
// How We Help and Our Method are this page's own; the other two blocks are ones another page already
// draws (paidHero/note). Copy comes from the 'development' doc, falling back per block to
// src/lib/mock/development.ts (see getDevelopment in src/lib/cms.ts).
//
// The hero photo is a static import, as on /branding: it is the layout's 20% wash rather than
// artwork an editor would swap.
//
// The closing CTA is read off the HOME doc, exactly as the other two do it, so one edit in the admin
// moves all three pages.
//
// Every section but the hero is wrapped in <SectionFade>: one opacity ramp per section, tripped by
// its own observer as it comes on screen. The hero is above the fold, so it has nothing to fade in
// from.
export default async function DevelopmentPage() {
  const [{ contact }, development] = await Promise.all([getHome(), getDevelopment()])

  return (
    <main>
      {/* No crop nudge, unlike the other two heroes: those photos are tall portraits that have to be
          pushed into a short band, and this one is exported from Figma already framed at 16:9 — so
          centring it IS the design's crop. */}
      <ServiceHero
        content={development.hero}
        image={heroBg}
        label="Development"
        objectPosition="object-center"
      />

      {/* Figma 3304:1848 — the three case-study cards. Opens on the 1px keyline the hero closes on,
          so it butts straight against it. */}
      <SectionFade>
        <HowWeHelp content={development.howWeHelp} />
      </SectionFade>

      {/* Figma 3318:2717 — the dark band. It is the only section on this page that is not cream, so
          it sets the floor the rest of the page sits on. */}
      <SectionFade>
        <OurMethod content={development.ourMethod} />
      </SectionFade>

      {/* Figma draws Contact identically to the other two pages', so it reads the same home doc. */}
      <SectionFade>
        <Contact content={contact} />
      </SectionFade>

      {/* Same closing band as the other two, down to the 458px column that sets the break. */}
      <SectionFade>
        <Note content={development.note} className="mx-auto max-w-[458px]" />
      </SectionFade>
    </main>
  )
}
