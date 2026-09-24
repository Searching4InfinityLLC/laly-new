import type { CSSProperties } from 'react'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { Button } from '@/components/ui/Button'
import { GridBackdrop } from '@/components/ui/GridBackdrop'
import type { Role } from '@/lib/types'

// star.svg as a bullet — the hero pills' mark in brand pink, so the lists read as the site's own
// rather than browser discs.
const STAR: CSSProperties = {
  backgroundColor: '#FF6D6A',
  maskImage: 'url(/star.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskImage: 'url(/star.svg)',
  WebkitMaskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section aria-label={label} className="flex flex-col gap-5 md:gap-6">
      {/* left-aligned eyebrow, the compound-effect way: the brackets still spread to the row's
          width, the row just starts at the column's edge */}
      <BracketLabel className="theme-label w-60 text-[var(--section-label,#867A72)] md:w-80 [--bracket-size:18px]">{label}</BracketLabel>
      {children}
    </section>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li
          key={item}
          className="theme-ink flex gap-3.5 font-sans text-lg leading-[1.4] text-[var(--section-body,#4A4A4A)] md:text-xl"
        >
          {/* one line-height down from the top, so the star sits on the first line's x-height */}
          <span aria-hidden className="mt-[0.45em] h-[11px] w-[10px] shrink-0" style={STAR} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// The body of /careers/<slug>, under the shared ServiceHero: the description on the left, a sticky
// "Position details" panel on the right that keeps the apply button in reach the whole way down.
// Below md the panel drops under the description and becomes the page's closing call to action.
//
// The panel is the booking dialog's recap rail in reverse — same Fira labels over New Spirit values —
// on a square card closing on the site's #544D49 keyline.
export function RoleDetail({ role }: { role: Role }) {
  return (
    <section
      aria-label={`${role.title} — job description`}
      className="relative w-full overflow-hidden bg-[#FCF7F3] py-16 md:py-28"
    >
      <GridBackdrop />
      <div className="section-shell relative grid gap-12 px-5 sm:px-10 md:grid-cols-[minmax(0,1fr)_360px] md:gap-16 md:px-20 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-24">
        <div className="flex max-w-[820px] flex-col gap-14 md:gap-20">
          <Block label="About the role">
            <div className="theme-ink flex flex-col gap-5 font-sans text-lg leading-[1.4] text-[var(--section-body,#4A4A4A)] md:text-xl">
              {role.about.split(/\n\s*\n/).map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </Block>

          {role.responsibilities.length > 0 && (
            <Block label="What you’ll do">
              <Bullets items={role.responsibilities} />
            </Block>
          )}

          {role.requirements.length > 0 && (
            <Block label="Requirements">
              <Bullets items={role.requirements} />
            </Block>
          )}
        </div>

        {/* top-[100px]: the fixed 76px navbar plus a 24px breath. Sticky works under Lenis because
            Lenis scrolls the real document rather than transforming a wrapper. */}
        <aside className="md:sticky md:top-[100px] md:self-start">
                    {/* theme-surface: the What You Get panel treatment, so the card darkens with the ground
              as Contact arrives */}
          <div className="theme-surface flex flex-col gap-8 border border-[var(--panel-border,#544D49)] bg-[#FFFCF9] px-5 py-8 md:px-8 md:py-10">
            <h2 className="theme-ink font-display text-[28px] font-medium leading-[1.1] tracking-[-0.5px] text-[var(--panel-heading,#262626)] md:text-[32px]">
              Position details
            </h2>
            {role.details.length > 0 && (
              <dl className="flex flex-col gap-5">
                {role.details.map((d) => (
                  <div key={d.label}>
                    <dt className="theme-ink font-fira text-[11px] uppercase tracking-[1px] text-[var(--panel-muted,#867a72)]">{d.label}</dt>
                    <dd className="theme-ink mt-1 font-sans text-lg leading-[1.3] text-[var(--panel-heading,#262626)]">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {/* scrolls to the form under the description (ApplicationForm, id="apply") */}
            <Button
              variant="primary"
              href="#apply"
              className="w-full py-2.5 [&>span]:text-lg"
            >
              APPLY
            </Button>
          </div>
        </aside>
      </div>
    </section>
  )
}
