import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import heroBg from '../../../../../public/careers/hero.webp'
import { ApplicationForm } from '@/components/careers/ApplicationForm'
import { RoleDetail } from '@/components/sections/RoleDetail'
import { ServiceHero } from '@/components/sections/ServiceHero'
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
// the four pills, the summary, APPLY), then the description with its sticky details panel. Both
// APPLY buttons open the application form's dialog (#apply). No Contact band — the form is the page's
// CTA — so the description renders as plain cream .section-theme markup. A closed or unknown slug 404s.
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
          // opens the application dialog
          button: { label: 'APPLY', href: '#apply' },
        }}
        image={heroBg}
        label={role.title}
        objectPosition="object-[50%_30%]"
        tall
        cta={{}}
      />
      <div className="section-theme" data-theme="light" data-ground="cream">
        <div data-section-tone="cream" className="section-theme-content theme-grid">
          <RoleDetail role={role} />
        </div>
      </div>
      <ApplicationForm role={role} />
    </main>
  )
}
