import type { CSSProperties } from 'react'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { Button } from '@/components/ui/Button'
import { InView } from '@/components/ui/InView'
import { PILL_COLORS } from '@/lib/palettes'
import type { OpenRolesContent, Role } from '@/lib/types'

// The service heroes' pill ground, flat — the same ember wash, so a role's tags read as the hero's
// pills on the page that role opens.
const PILL_BG =
  'linear-gradient(90deg, rgba(28,25,23,0.2) 35%, rgba(85,47,42,0.2) 65%, rgba(141,68,60,0.2) 85%, rgba(255,111,97,0.1) 100%)'

// ServiceHero's star-masked pill at the card's size — the star tint cycles by position, as there.
function RolePill({ label, index }: { label: string; index: number }) {
  return (
    <li
      // ink follows the Strategy card's light/dark badge vars (styles.css, .strategy-card)
      className="theme-ink flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 font-display text-xs font-normal leading-[1.25] text-[var(--pillar-badge-ink,#E7DCD4)] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
      style={{ backgroundImage: PILL_BG }}
    >
      <span
        aria-hidden
        className="h-[6.5px] w-[6px] shrink-0"
        style={
          {
            backgroundColor: PILL_COLORS[index % PILL_COLORS.length],
            maskImage: 'url(/star.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/star.svg)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          } as CSSProperties
        }
      />
      {label}
    </li>
  )
}

// /careers "Open Roles" — the white band the hero's "SEE OPEN ROLES" scrolls to (id="roles").
// Each role is a Strategy glass card laid out as a row: what it is on the left, pay and the way in on
// the right. Colours read the page's shared theme vars, so the band (and About above it) fades from dark to white with
// the rest of the SectionThemeSequence. The whole card is the link (the button's stretched ::before), the way the Strategy
// pillars make the whole card their arrow's hit area.
export function OpenRoles({ content, roles }: { content: OpenRolesContent; roles: Role[] }) {
  const { label, heading, empty } = content

  return (
    <section
      id="roles"
      aria-label={label}
      // scroll-mt clears the fixed 76px navbar for a plain (no-Lenis) anchor jump
      className="grain-ground relative w-full scroll-mt-19 overflow-hidden py-16 md:py-28"
    >
      <InView className="section-shell relative flex flex-col gap-10 px-5 sm:px-10 md:gap-12 md:px-20">
        <div className="flex flex-col gap-5 text-center md:gap-8">
          <BracketLabel className="theme-label mx-auto w-44 text-[var(--section-label,#ff6d6a)] md:w-80">{label}</BracketLabel>
          <h2 className="theme-ink font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] text-[var(--section-heading,#FCF7F3)] md:text-6xl xl:text-7xl">
            {heading.split('\n').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        <ul className="flex flex-col gap-4">
          {roles.map((role, i) => (
            <li
              key={role.slug}
              className="strategy-card section-media-reveal relative flex flex-col gap-6 px-5 py-6 transition-[box-shadow,border-color] duration-300 ease-out md:flex-row md:items-center md:justify-between md:gap-10 md:px-8 md:py-8"
              style={{ '--card-fg': '#FF6D6A', animationDelay: `${0.2 + i * 0.15}s` } as CSSProperties}
            >
              <div className="flex max-w-[720px] flex-col gap-3">
                <h3 className="theme-ink font-display text-4xl font-normal leading-[1.1] tracking-[-1px] text-[var(--section-heading,#FCF7F3)] md:text-[44px]">
                  {role.title}
                </h3>
                <p className="theme-ink font-sans text-lg leading-[1.3] text-[var(--section-body,#E7DCD4)] md:text-xl">
                  {role.summary}
                </p>
                <ul aria-label="Role details" className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5">
                  {role.tags.map((tag, t) => (
                    <RolePill key={tag} label={tag} index={t} />
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 md:flex-col md:flex-nowrap md:items-end md:justify-center md:gap-5">
                <p className="whitespace-nowrap font-display text-2xl font-medium tracking-[-0.5px] text-[#FF6D6A] md:text-[28px]">
                  {role.pay}
                </p>
                <Button
                  variant="primary"
                  href={`/careers/${role.slug}`}
                  className="before:absolute before:inset-0 before:content-['']"
                >
                  VIEW ROLE & APPLY
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {/* Always drawn, under however many roles there are — and alone when every role is closed,
            so an empty list still says something. */}
        <p className="theme-ink border border-dashed border-[#544D49] px-5 py-6 text-center font-sans text-lg text-[var(--section-body,#E7DCD4)] opacity-60 md:px-8">
          {empty}
        </p>
      </InView>
    </section>
  )
}
