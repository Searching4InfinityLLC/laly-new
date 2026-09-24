import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import heroBg from '../../../../../public/careers/hero.webp'
import { ApplicationForm } from '@/components/careers/ApplicationForm'
import Contact from '@/components/sections/Contact'
import { RoleDetail } from '@/components/sections/RoleDetail'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { SectionFade } from '@/components/ui/SectionFade'
import { SectionThemeSequence } from '@/components/ui/SectionTheme'
import { getHome, getRole, getRoles } from '@/lib/cms'

export const revalidate = 3600

// Prerender every open role at build; a role added later renders on first request and is cached
// from then on (dynamicParams defaults to true), and its save purges the path anyway.
export async function generateStaticParams() {
  const roles = await getRoles()
  return roles.map((r) => ({ slug: r.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const role = await getRole((await params).slug)
  if (!role) return {}
  return { title: `${role.title} | Careers | Laly Agency`, description: role.summary }
}

// /careers/<slug> — one role: the shared ServiceHero (eyebrow, title, the role's tags plus pay as
// the four pills, the summary, APPLY), the description with its sticky details panel, the
// application form both APPLY buttons scroll to, then the home "Grow with us" Contact band. The one
// cream section sits in a SectionThemeSequence so it darkens as Contact arrives, as on the service
// pages. A closed or unknown slug 404s.
export default async function RolePage({ params }: Props) {
  const [role, { contact }] = await Promise.all([getRole((await params).slug), getHome()])
  if (!role) notFound()

  return (
    <main>
      <ServiceHero
        content={{
          label: 'Open Role',
          heading: role.title,
          pills: [...role.tags, role.pay].slice(0, 4),
          description: { before: role.summary },
          // scrolls to the form under the description
          button: { label: 'APPLY FOR THIS ROLE', href: '#apply' },
        }}
        image={heroBg}
        label={role.title}
        objectPosition="object-[50%_30%]"
        tall
        cta={{}}
      />
      <SectionThemeSequence
        sections={[
          { id: 'role', tone: 'cream', texture: 'grid', content: <RoleDetail role={role} /> },
          { id: 'apply', tone: 'cream', content: <ApplicationForm role={role} /> },
        ]}
        contact={<SectionFade><Contact content={contact} /></SectionFade>}
      />
    </main>
  )
}
