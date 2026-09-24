import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import heroBg from '../../../../../public/careers/hero.webp'
import { ApplicationDialog } from '@/components/careers/ApplicationDialog'
import { RoleDetail } from '@/components/sections/RoleDetail'
import { ServiceHero } from '@/components/sections/ServiceHero'
import { APPLICATION_DIALOG_ID } from '@/lib/careers'
import { getRole, getRoles } from '@/lib/cms'

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
// the four pills, the summary, APPLY), the description with its sticky details panel, and the
// application popup both APPLY buttons open. A closed or unknown slug 404s.
export default async function RolePage({ params }: Props) {
  const role = await getRole((await params).slug)
  if (!role) notFound()

  return (
    <main>
      <ServiceHero
        content={{
          label: 'Open Role',
          heading: role.title,
          pills: [...role.tags, role.pay].slice(0, 4),
          description: { before: role.summary },
          button: { label: 'APPLY FOR THIS ROLE' },
        }}
        image={heroBg}
        label={role.title}
        objectPosition="object-[50%_30%]"
        tall
        cta={{ dialog: APPLICATION_DIALOG_ID }}
      />
      <RoleDetail role={role} />
      <ApplicationDialog role={role} />
    </main>
  )
}
