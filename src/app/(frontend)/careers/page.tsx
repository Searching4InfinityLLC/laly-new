import type { Metadata } from 'next'
import { CareersAbout } from '@/components/sections/CareersAbout'
import Hero from '@/components/sections/Hero'
import { OpenRoles } from '@/components/sections/OpenRoles'
import { SectionThemeSequence } from '@/components/ui/SectionTheme'
import { getCareers, getHome, getRoles } from '@/lib/cms'

export const metadata: Metadata = {
  title: 'Careers | Laly Agency',
  description:
    'Join Laly Agency — a small, hands-on South Florida marketing agency building strategy-first work across brand, media, creative and technology.',
}

// Same ISR window as every other page. Saving a role or the careers doc purges this path on its own
// (Roles / Pages afterChange hooks), so the hour is only the backstop.
export const revalidate = 3600

// The hiring landing page: the home hero (careers copy over home's image marquee), About Laly Agency,
// then the open roles the hero's button scrolls to. No Contact band — the roles are the CTA. About →
// Open Roles run in the service pages' scroll-driven SectionThemeSequence, inverted: About starts
// dark and both turn white as Open Roles comes in. Copy comes from the Pages 'careers' doc (falling back per block to
// src/lib/mock/careers.ts); the roles are the Roles collection.
//
// The careers doc's hero label and pills have no slot in the home hero, so they don't render here.
export default async function CareersPage() {
  const [careers, roles, home] = await Promise.all([getCareers(), getRoles(), getHome()])
  const { heading, description, button } = careers.hero

  return (
    <main>
      {/* booking off: the button follows its href ('#roles') instead of opening the booking dialog */}
      <Hero
        content={{
          heading,
          description: description.before + (description.emphasis ?? '') + (description.after ?? ''),
          button,
          slides: home.hero.slides,
        }}
        label="Careers"
        booking={false}
      />
      <SectionThemeSequence
        sections={[
          { id: 'about', tone: 'dark', texture: 'grid', content: <CareersAbout content={careers.about} /> },
          { id: 'roles', tone: 'white', content: <OpenRoles content={careers.openRoles} roles={roles} /> },
        ]}
      />
    </main>
  )
}
