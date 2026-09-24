import type { Metadata } from 'next'
import heroBg from '../../../../public/growwithus/Cta-Desktop.webp'
import { CareersAbout } from '@/components/sections/CareersAbout'
import { OpenRoles } from '@/components/sections/OpenRoles'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { SectionFade } from '@/components/ui/SectionFade'
import { getCareers, getRoles } from '@/lib/cms'

export const metadata: Metadata = {
  title: 'Careers | Laly Agency',
  description:
    'Join Laly Agency — a small, hands-on South Florida marketing agency building strategy-first work across brand, media, creative and technology.',
}

// Same ISR window as every other page. Saving a role or the careers doc purges this path on its own
// (Roles / Pages afterChange hooks), so the hour is only the backstop.
export const revalidate = 3600

// The hiring landing page: the service pages' hero, About Laly Agency, then the open roles, which
// the hero's button scrolls to. Copy comes from the Pages 'careers' doc (falling back per block to
// src/lib/mock/careers.ts); the roles are the Roles collection.
//
// The hero photo is the team shot from the home Contact band, a static import like the service
// heroes' — at the hero's 20% it is a texture, and a careers page might as well be textured with the
// people you'd work with.
export default async function CareersPage() {
  const [careers, roles] = await Promise.all([getCareers(), getRoles()])

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
      <SectionFade>
        <CareersAbout content={careers.about} />
      </SectionFade>
      <OpenRoles content={careers.openRoles} roles={roles} />
    </main>
  )
}
