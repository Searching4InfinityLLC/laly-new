import { BracketLabel } from '@/components/ui/BracketLabel'
import { GridBackdrop } from '@/components/ui/GridBackdrop'
import { InView } from '@/components/ui/InView'
import type { CareersAboutContent } from '@/lib/types'

// /careers "About Laly Agency" — the cream band under the hero. Nothing here is a new pattern: the
// eyebrow/heading/copy stack is the one every section uses, and the three service cards are the
// /paid-advertising Results cards.
//
// Rendered inside the page's SectionThemeSequence, so every colour reads the shared theme vars (with
// this section's own light values as the fallback).
export function CareersAbout({ content }: { content: CareersAboutContent }) {
  const { label, heading, body, services } = content

  return (
    <section
      aria-label={label}
      className="relative w-full overflow-hidden bg-[#FCF7F3] py-16 md:py-28"
    >
      <GridBackdrop />
      <InView className="section-shell relative flex flex-col items-center gap-10 px-5 sm:px-10 md:gap-14 md:px-20">
        <div className="flex w-full max-w-[880px] flex-col gap-6 text-center">
          <BracketLabel className="theme-label mx-auto w-64 text-[var(--section-label,#867A72)] md:w-[440px]">{label}</BracketLabel>

          <h2 className="theme-ink font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] text-[var(--section-heading,#262626)] md:text-[64px]">
            {heading.split('\n').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          {/* Two paragraphs of real copy — longer than any other section's lede, so it sits a size
              down from the 28px those use, or it reads as a wall. */}
          <div className="theme-ink flex flex-col gap-5 font-sans text-lg font-normal leading-[1.35] text-[var(--section-body,#4A4A4A)] md:text-[22px]">
            {body.split(/\n\s*\n/).map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </div>

        {/* The /paid-advertising Results cards (.results-stat in styles.css): the pink conic on the
            light ground, its dark twin on a ::before that fades with the section theme. Title in the
            stat's pink New Spirit slot, one line under it in the label slot. */}
        <ul className="grid w-full gap-6 md:grid-cols-3 md:gap-8">
          {services.map((service, i) => (
            <li
              key={service.title}
              className="results-stat section-media-reveal flex flex-col justify-center gap-4 rounded px-4 py-8 text-center md:px-6 md:py-10"
              style={{ animationDelay: `${0.2 + i * 0.2}s` }}
            >
              <h3 className="font-sans text-[40px] leading-[1.1] tracking-[-0.5px] text-[#FF6D6A] md:text-[48px]">
                {service.title}
              </h3>
              <p className="results-stat-label font-sans text-lg leading-[1.3] opacity-85 md:text-xl">
                {service.body}
              </p>
            </li>
          ))}
        </ul>
      </InView>
    </section>
  )
}
