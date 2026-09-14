import { GridBackdrop } from '@/components/ui/GridBackdrop'
import { HELP_WIDGETS } from '@/components/sections/HelpWidgets'
import { HELP_ACCENTS } from '@/lib/palettes'
import type { HowWeHelpContent } from '@/lib/types'

// Figma 3304:1848 — the section that fills the gap /development used to leave between the hero and
// the rest: label/heading/description on the cream ground, then three case-study cards across.
//
// Each card is one client problem: an eyebrow, the question, two numbered steps (the problem, then
// what we built), and a mock of the thing we built. The mocks live in HelpWidgets.tsx and are
// decorative — see that file.
//
// Colour and widget both come from the card's position in the row, not from the CMS: the design
// draws lilac/olive/amber left to right with one specific mock per column, the same rule
// BADGE_COLORS and PILL_COLORS already follow on the other pages.
//
// The card ground is a two-stop wash (#FFFCF9 into the accent) under the shared .grid-backdrop —
// Figma bakes the grid into a texture PNG per card, but that texture is the same grid every cream
// section on the site already draws in CSS, and the CSS version does not rescale itself to the
// card's height the way an object-cover'd export does.
export default function HowWeHelp({ content }: { content: HowWeHelpContent }) {
  const { label, heading, description, cards } = content

  return (
    <section
      aria-label="How we help"
      // Figma frame: py 112, no side padding of its own (the two rows below set theirs). Mobile
      // halves the band.
      //
      // No top keyline, though the frame draws one: ServiceHero already closes on the same 1px
      // #544D49 rule, and both would render a 2px seam.
      className="w-full bg-[#FCF7F3] py-14 md:py-28"
    >
      <div className="section-shell flex flex-col items-center gap-8 md:gap-10">
        {/* Figma: px 208 at 1440. Mobile takes the page's own 20. */}
        <div className="flex w-full flex-col gap-6 px-5 text-center sm:px-10 md:px-52">
          {/* Brackets authored here rather than <BracketLabel>: that component spreads its brackets
              to the row's edges, and this label hugs the words the way the hero's does. */}
          <p className="font-mono text-sm font-normal uppercase leading-[1.4] tracking-[1px] text-[#867A72] md:text-2xl">
            [ {label} ]
          </p>

          <h2 className="font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] text-[#262626] md:text-[64px]">
            {heading.split('\n').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <p className="font-sans text-xl font-normal leading-[1.25] text-[#4A4A4A] md:text-[28px]">
            {/* the designer's breaks, not wraps — they split the sentence at its two clauses */}
            {description.split('\n').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        {/* Figma: px 80, gap 12, three equal columns that stretch to the tallest. One column on a
            phone — three 418px cards have nowhere to go at 390. */}
        <div className="flex w-full flex-col gap-3 px-5 sm:px-10 md:flex-row md:items-stretch md:px-20">
          {cards.map((card, i) => {
            const accent = HELP_ACCENTS[i % HELP_ACCENTS.length]
            const Widget = HELP_WIDGETS[i % HELP_WIDGETS.length]

            return (
              <article
                key={card.title}
                // 1px hairline at 10% — the cards read as panes of the same sheet, not as chips
                className="relative flex flex-1 flex-col gap-10 overflow-hidden border border-[rgba(60,55,52,0.1)] px-5 pt-6 pb-10"
                style={{
                  backgroundImage: `linear-gradient(180deg, #FFFCF9 ${accent.stop}, ${accent.wash} 100%)`,
                }}
              >
                <GridBackdrop />

                <div className="relative flex w-full flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p
                      className="font-mono text-sm font-normal uppercase leading-[1.4] tracking-[1px] opacity-80"
                      style={{ color: accent.fg }}
                    >
                      {card.eyebrow}
                    </p>
                    <h3
                      className="font-sans text-[32px] font-normal leading-[1.1] tracking-[-0.5px] md:text-[40px]"
                      style={{ color: accent.fg }}
                    >
                      {card.title.split('\n').map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </h3>
                  </div>

                  {/* Numbered steps. The rail under step 1 is what ties the pair together, so it
                      only ever hangs off a step that has one after it. */}
                  <ol className="flex flex-col gap-4">
                    {card.steps.map((step, s) => (
                      <li key={step} className="flex w-full items-start gap-[11px]">
                        <div
                          className={`flex w-[18px] shrink-0 flex-col items-center self-stretch ${
                            s < card.steps.length - 1 ? 'justify-center gap-3 pt-1' : 'gap-0.5'
                          }`}
                        >
                          <span
                            className="flex w-full items-center justify-center overflow-clip rounded-md px-1.5 py-0.5 font-sans text-xs leading-[1.25] tracking-[0.25px] text-white"
                            style={{ backgroundColor: accent.badge }}
                          >
                            {s + 1}
                          </span>
                          {s < card.steps.length - 1 && (
                            <span
                              aria-hidden
                              className="w-0.5 min-h-px flex-1 rounded-sm"
                              style={{ backgroundColor: accent.rail }}
                            />
                          )}
                        </div>
                        <p
                          className="min-w-0 flex-1 font-display text-lg font-normal leading-[1.25] tracking-[0.25px]"
                          style={{ color: accent.body }}
                        >
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Figma insets the mock 40px inside the card's own 20 */}
                <div className="relative flex w-full flex-col items-center justify-center px-10">
                  <Widget />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
