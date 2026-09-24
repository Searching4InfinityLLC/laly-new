import type { Metadata } from 'next'
import heroBg from '../../../../public/careers/hero.webp'
import { CareersAbout } from '@/components/sections/CareersAbout'
import Contact from '@/components/sections/Contact'
import { OpenRoles } from '@/components/sections/OpenRoles'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { SectionFade } from '@/components/ui/SectionFade'
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

// The hiring landing page: the service pages' hero, About Laly Agency, then the open roles, which
// the hero's button scrolls to, closing on the home "Grow with us" Contact band like the service pages.
// About → Open Roles → Contact run in the same scroll-driven cream→dark SectionThemeSequence those
// pages use. Copy comes from the Pages 'careers' doc (falling back per block to
// src/lib/mock/careers.ts); the roles are the Roles collection.
//
// The hero photo is the team shot from the home Contact band (public/growwithus/Cta-Desktop.webp),
// pre-blurred and grained into public/careers/hero.webp to match the other heroes' out-of-focus
// photos — baked into the file rather than a CSS filter, so the LCP image costs no paint-time blur.
// A static import like theirs: at the hero's 20% it is a texture, not content.
export default async function CareersPage() {
  const [careers, roles, { contact }] = await Promise.all([getCareers(), getRoles(), getHome()])

  return (
    <main>
      {/* cta={{}}: the button follows its href ('#roles') instead of opening the booking dialog */}
      <ServiceHero
        content={careers.hero}
        image={heroBg}
        label="Careers"
        objectPosition="object-[50%_30%]"
        tall
        cta={{}}
      />
      <SectionThemeSequence
        sections={[
          { id: 'about', tone: 'cream', texture: 'grid', content: <CareersAbout content={careers.about} /> },
          { id: 'roles', tone: 'dark', content: <OpenRoles content={careers.openRoles} roles={roles} /> },
        ]}
        contact={<SectionFade><Contact content={contact} /></SectionFade>}
      />
    </main>
  )
}
