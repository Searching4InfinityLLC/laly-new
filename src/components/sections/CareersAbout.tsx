import { BracketLabel } from '@/components/ui/BracketLabel'
import { GridBackdrop } from '@/components/ui/GridBackdrop'
import { InView } from '@/components/ui/InView'
import { HELP_ACCENTS } from '@/lib/palettes'
import type { CareersAboutContent } from '@/lib/types'

// /careers "About Laly Agency" — the cream band under the hero. Nothing here is a new pattern: the
// eyebrow/heading/copy stack is the one every section uses, and the three service cards are
// /development's How We Help panes (cream-into-accent wash over the shared grid, lilac/olive/amber by
// column) carrying a title and one line instead of a case study.
export function CareersAbout({ content }: { content: CareersAboutContent }) {
  const { label, heading, body, services } = content

  return (
    <section
      aria-label={label}
      className="relative w-full overflow-hidden border-b border-[#544D49] bg-[#FCF7F3] py-16 md:py-28"
    >
      <GridBackdrop />
      <InView className="section-shell relative flex flex-col items-center gap-10 px-5 sm:px-10 md:gap-14 md:px-20">
        <div className="flex w-full max-w-[880px] flex-col gap-6 text-center">
          <BracketLabel className="mx-auto w-64 text-[#867A72] md:w-[440px]">{label}</BracketLabel>

          <h2 className="font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] text-[#262626] md:text-[64px]">
            {heading.split('\n').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          {/* Two paragraphs of real copy — longer than any other section's lede, so it sits a size
              down from the 28px those use, or it reads as a wall. */}
          <div className="flex flex-col gap-5 font-sans text-lg font-normal leading-[1.35] text-[#4A4A4A] md:text-[22px]">
            {body.split(/\n\s*\n/).map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </div>

        {/* How We Help's row: three equal panes on a 12px gap, stacked on a phone. */}
        <ul className="grid w-full gap-3 md:grid-cols-3">
          {services.map((service, i) => {
            const accent = HELP_ACCENTS[i % HELP_ACCENTS.length]
            return (
              <li
                key={service.title}
                className="section-media-reveal relative flex min-h-[200px] flex-col justify-between gap-8 overflow-hidden border border-[rgba(60,55,52,0.1)] px-5 pt-6 pb-8 md:min-h-[260px] md:px-6"
                style={{
                  backgroundImage: `linear-gradient(180deg, #FFFCF9 ${accent.stop}, ${accent.wash} 100%)`,
                  animationDelay: `${0.2 + i * 0.2}s`,
                }}
              >
                <GridBackdrop />
                <p
                  className="relative font-mono text-xs uppercase leading-[1.4] tracking-[1px] opacity-80 md:text-sm"
                  style={{ color: accent.fg }}
                >
                  0{i + 1}
                </p>
                <div className="relative flex flex-col gap-3">
                  <h3
                    className="font-sans text-[32px] font-normal leading-[1.1] tracking-[-0.5px] md:text-[40px]"
                    style={{ color: accent.fg }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="font-display text-base leading-[1.35] tracking-[0.25px] md:text-lg"
                    style={{ color: accent.body }}
                  >
                    {service.body}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </InView>
    </section>
  )
}
