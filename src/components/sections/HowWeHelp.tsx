import { BracketLabel } from '@/components/ui/BracketLabel'
import { GridBackdrop } from '@/components/ui/GridBackdrop'
import { HELP_WIDGETS } from '@/components/sections/HelpWidgets'
import { HELP_ACCENTS, themed } from '@/lib/palettes'
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
      // (3292:4158) is pt 48 / pb 0 — the last card's own 48 closes the band, so a bottom pad here
      // would double it.
      //
      // No top keyline, though both frames draw one: ServiceHero already closes on the same 1px
      // #544D49 rule, and both would render a 2px seam.
      className="w-full bg-[#FCF7F3] pt-12 pb-0 md:py-28"
    >
      <div className="section-shell flex flex-col items-center gap-8 md:gap-10">
        {/* Figma: px 208 at 1440, 20 on the phone. */}
        <div className="flex w-full flex-col gap-6 px-5 text-center md:px-52">
          {/* <BracketLabel> like every other section eyebrow on the site, so it gets the same
              scroll-in: brackets swing out from the centre while the label wipes up. Width is the
              w-52 / md:w-[360px] the other ~11-character eyebrows use ("the channels"). */}
          <BracketLabel className="mx-auto w-52 theme-label text-[var(--section-label,#867A72)] md:w-[360px]">{label}</BracketLabel>

          {/* The break is authored for the 64px desktop set only — the mobile frame (3292:4161)
              is one flowing 40px paragraph, so the spans go inline below md and the join is a real
              space rather than a second copy of the string. */}
          <h2 className="font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] theme-ink text-[var(--section-heading,#262626)] md:text-[64px]">
            {heading.split('\n').map((line, i) => (
              <span key={line} className="md:block">
                {i > 0 && ' '}
                {line}
              </span>
            ))}
          </h2>

          {/* Same again: two authored clauses at 28px, one flowing paragraph at 20px. */}
          <p className="font-sans text-xl font-normal leading-[1.25] theme-ink text-[var(--section-body,#4A4A4A)] md:text-[28px]">
            {description.split('\n').map((line, i) => (
              <span key={line} className="md:block">
                {i > 0 && ' '}
                {line}
              </span>
            ))}
          </p>
        </div>

        {/* Figma: px 80, gap 12, three equal columns that stretch to the tallest. The phone
            (3330:4616) stacks them full-bleed with no gap and no per-card rule — one hairline on the
            stack and nothing between the cards, because the wash changing colour IS the separator. */}
        <div className="flex w-full flex-col border-t border-[rgba(60,55,52,0.1)] md:flex-row md:items-stretch md:gap-3 md:border-t-0 md:px-20">
          {cards.map((card, i) => {
            const accent = HELP_ACCENTS[i % HELP_ACCENTS.length]
            const Widget = HELP_WIDGETS[i % HELP_WIDGETS.length]

            return (
              <article
                key={card.title}
                // 1px hairline at 10% at md+ — the cards read as panes of the same sheet, not as
                // chips. Mobile: pt 32 / pb 48, and the border belongs to the stack, not the card.
                className="relative flex flex-1 flex-col gap-10 overflow-hidden px-5 pt-8 pb-12 md:border md:border-[rgba(60,55,52,0.1)] md:pt-6 md:pb-10"
                style={{
                  backgroundImage: `linear-gradient(180deg, #FFFCF9 ${accent.stop}, ${accent.wash} 100%)`,
                }}
              >
                {/* The dark wash as its own layer, cross-faded on opacity: a gradient cannot
                    transition, so a themed() stop inside it snapped while the ground faded. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(180deg, #151414 ${accent.stop}, ${accent.wash} 100%)`,
                    opacity: 'var(--section-dark-progress, 0)',
                  }}
                />
                <GridBackdrop />

                <div className="relative flex w-full flex-col gap-5 md:gap-6">
                  <div className="flex flex-col gap-2 md:gap-3">
                    <p
                      className="font-mono text-xs font-normal uppercase leading-[1.4] tracking-[1px] opacity-80 md:text-sm"
                      style={{ color: themed(accent.fg, accent.darkFg) }}
                    >
                      {card.eyebrow}
                    </p>
                    <h3
                      className="font-sans text-[32px] font-normal leading-[1.1] tracking-[-0.5px] md:text-[40px]"
                      style={{ color: themed(accent.fg, accent.darkFg) }}
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
                          className="min-w-0 flex-1 font-display text-base font-normal leading-[1.25] tracking-[0.25px] md:text-lg"
                          style={{ color: themed(accent.body, accent.darkBody) }}
                        >
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Figma insets the mock 40px inside the card's own 20; the phone insets it 20. */}
                <div className="relative flex w-full flex-col items-center justify-center px-5 md:px-10">
                  {/* Client note: 700-1151 is the stacked layout on a tablet-wide screen, where a
                      mock stretched to the card reads as a banner rather than a product shot — so it
                      holds at 600 and centres. Below 700 it is a phone and fills; at md+ it is a
                      418px column and fills that. 700 + the 80px of card and wrapper padding is
                      what guarantees 600 always fits. */}
                  <div className="w-full min-[700px]:max-md:w-[600px]">
                    <Widget />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
