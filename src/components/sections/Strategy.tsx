import { Fragment } from 'react'
import type { CSSProperties } from 'react'
import { ArrowCircleButton } from '@/components/ui/ArrowCircleButton'
import { STRATEGY_ARROW_HOVER } from '@/lib/palettes'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { InView } from '@/components/ui/InView'
import type { StrategyContent } from '@/lib/types'

// The "if you..." hook. Full strength at rest, 65% while its card is hovered (client note, all
// cards) — the lit title, arrow and glow carry the card then. group-active for touch, same reason
// the glow uses :active. Both hook nodes (desktop + hookMobile) share this, so they dim together.
const hookClass =
  'font-sans text-2xl font-normal leading-[1.25] text-[#FCF7F3] transition-opacity duration-300 ease-out group-hover:opacity-65 group-active:opacity-65'

const hardBreaks = (text: string) =>
  text.split('\n').map((line, i) => (
    <Fragment key={line}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ))

// "Strategy" — the dark counterpart to WhoWeAre. Same copy stack; only the ground and the card grid
// differ (3 across instead of 2 stacked).
export default function Strategy({ content }: { content: StrategyContent }) {
  const { label, heading, description, cards } = content

  return (
    <section
      aria-label="Strategy"
      // Figma desktop (2017:5084): 112 top+bottom, 48 sides. Ground is #151414 with grain at 4% —
      // not the #292624 this used to be. The cards are 20% glass now, so the band IS their fill;
      // on the old lighter ground they read washed-out.
      // .grain-ground (styles.css): #151414 under the site's dark grain tile — see there.
      className="grain-ground relative w-full overflow-hidden py-16 md:py-28"
    >
      <InView className="section-shell relative px-5 text-center sm:px-10 md:px-12">
        <BracketLabel className="mx-auto mb-5 w-44 text-[#ff6d6a] md:mb-8 md:w-80">
          {label}
        </BracketLabel>
        <h2 className="section-text-reveal font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] text-[#FCF7F3] md:text-6xl xl:text-7xl">
          {heading.split('\n').map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        {/* 430 is Figma's own column (2017:5089) and what breaks the line before "to spend" — the old
            460 fit "spend" too and orphaned "smarter.". whitespace-pre-line so an Enter typed in the
            CMS is a real break as well; without an Enter the width alone sets the wrap. */}
        <p className="section-text-reveal mx-auto mt-6 max-w-[430px] whitespace-pre-line font-sans text-xl md:text-2xl xl:text-[28px] font-normal leading-[1.25] text-[#E7DCD4] 3xl:max-w-[560px]">
          {description}
        </p>

        {/* Rows live on this parent and each card picks them up via subgrid, so title / badges /
            hook / body start on the same line in all three — when one card's badges wrap to a
            second line, every card's hook moves down with it. Last row is 1fr so the cards end
            flush; the body sits at its top, not its end, or a long body would leave a hole in the
            two short cards. */}
        <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3 md:grid-rows-[auto_auto_auto_1fr] md:gap-4 3xl:gap-y-5">
          {cards.map((card, i) => (
            // reveal is per-card, not per-grid, so they can stagger left→right. The inline
            // animation-delay longhand beats the stylesheet's `animation` shorthand (inline wins).
            <article
              key={card.title}
              // min-w-0 defeats the grid item's `min-width: auto`, so the nowrap badges stop
              // widening the track and scroll inside the card instead.
              // glow only, no keyline — mixed from --card-fg (the title colour), so each card
              // lights up in its own accent. `active` alongside `hover` because Tailwind compiles
              // hover: into @media (hover: hover), so touch would never light it: :active fires on
              // the card as an ancestor of the pressed arrow link.
              // Ground, stroke, glass and hover glow all live in .strategy-card (styles.css) — see
              // there for the Figma GLASS mapping and why the glow can't stay a Tailwind hover:shadow.
              // Padding 20/24 per Figma 2017:5112.
              // `scale`, not a transform: the reveal animation owns `transform` with fill-mode
              // forwards, so a transform-based scale here would never win. Tailwind v4 emits the
              // standalone scale property, which composes with it.
              className="strategy-card group section-media-reveal relative flex min-w-0 flex-col gap-4 px-5 py-6 text-left transition-[box-shadow,border-color,scale] duration-300 ease-out hover:scale-105 active:scale-105 md:row-span-4 md:grid md:min-h-[400px] md:grid-rows-subgrid md:gap-y-4 3xl:min-h-[460px] 3xl:gap-y-5 3xl:px-6 3xl:py-8"
              // --arrow-hover: the ring's hover colour for this card, unset when its accent has none
              // (see STRATEGY_ARROW_HOVER) so the var() fallback below keeps it at rest.
              style={
                {
                  '--card-fg': card.fg,
                  '--arrow-hover': STRATEGY_ARROW_HOVER[card.fg],
                  animationDelay: `${0.2 + i * 0.2}s`,
                } as CSSProperties
              }
            >
              {/* heading/h2/l — Neue Haas 450 / 44px / 110%.
                  Mobile puts the arrow up here beside the title; desktop keeps it beside the hook
                  below. Two instances, one hidden per breakpoint — cheaper than reflowing the
                  subgrid, and only the visible one contributes its stretched ::before hit area. */}
              <div className="flex items-start justify-between gap-4">
                <h3
                  className="font-display text-4xl font-normal leading-[1.1] tracking-[-1px] md:text-[44px] 3xl:text-[52px]"
                  style={{ color: card.fg }}
                >
                  {/* designer's call: the subject always lands on line 2 — authored break, not wrap */}
                  {card.title.split('\n').map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <ArrowCircleButton
                  href={card.link.href}
                  label={card.link.label}
                  className="md:hidden cursor-pointer text-[#D1C1B7] group-hover:text-[var(--arrow-hover,#D1C1B7)] group-active:text-[var(--arrow-hover,#D1C1B7)] before:absolute before:inset-0 before:content-['']"
                />
              </div>

              {/* capability pills — star tinted per badge, so the accent trio comes from data.
                  Free to wrap now that cards don't share a row track. */}
              {/* items-start/content-start: the badge row is shared, so a card with one line of
                  badges still spans two — without this the pills stretch to fill it */}
              <ul className="mt-2 flex flex-wrap content-start items-start gap-x-2 gap-y-1.5">
                {card.badges.map((badge) => (
                  <li
                    key={badge.label}
                    /* Figma badge: 12px/125% text, padding 4/10, gap 4 — hugs to the spec's 23px,
                       so no fixed height and no breakpoint steps */
                    /* 75% rides on the text colour, not the li: `opacity` here would take the star
                       mask and the pill ground down with it */
                    // ground: client note, #292624 at 50% (was a flat #2D2A28)
                    className="flex h-[23px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#292624]/50 px-2.5 font-sans text-xs leading-[1.25] tracking-[0.25px] text-[#F7F1EE]/75 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                  >
                    {/* star.svg as a mask so one asset serves all three tints */}
                    <span
                      aria-hidden
                      className="h-[10px] w-[9px] shrink-0"
                      style={{
                        backgroundColor: badge.color,
                        maskImage: 'url(/star.svg)',
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskImage: 'url(/star.svg)',
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                      }}
                    />
                    {/* Centred on the star by its letters, not its line box. New Spirit's line box
                        carries far more descent than ascent, so flex-centring the box leaves the
                        glyphs sitting high — and a fixed px nudge (tried both ways) is only right at
                        one size. text-box trims the box to cap height and baseline, so what
                        items-center centres IS the visible text. The pill is pinned to Figma's 23px
                        (py-4 around a 15px line) because the trimmed box is shorter than that.
                        Firefox ignores text-box and falls back to line-box centring — the old look. */}
                    <span className="[text-box:trim-both_cap_alphabetic]">{badge.label}</span>
                  </li>
                ))}
              </ul>

              {/* body-2/xl — New Spirit 400 / 24px / 125% */}
              {/* mt-4 on the card's 16 = the frame's 32 above the hook; nothing below it, so the
                  body follows at the card's own 16 (2017:5084) rather than the old 32 */}
              <div className="mt-4 flex items-start justify-between gap-8">
                {/* every break here is authored, never a wrap — the designer sets them by hand.
                    Card 3 is the only one whose mobile breaks differ, so hookMobile is optional and
                    the second node only exists when it's set. display:none keeps the hidden copy out
                    of the a11y tree, so screen readers still get exactly one. */}
                <p className={`${hookClass}${card.hookMobile ? ' max-md:hidden' : ''}`}>
                  {hardBreaks(card.hook)}
                </p>
                {card.hookMobile && (
                  <p className={`${hookClass} md:hidden`}>{hardBreaks(card.hookMobile)}</p>
                )}
                {/* the arrow takes its colour from this element. Its stretched ::before makes the
                    whole card the hit area (only link in the card, so nothing to nest) — which is
                    why the hover tint keys off the card (group-hover), not the ring itself. */}
                <ArrowCircleButton
                  href={card.link.href}
                  label={card.link.label}
                  size={40}
                  /* max-md:hidden, not `hidden md:inline-flex` — the component's own base
                     `inline-flex` outranks a bare `hidden`; only a variant beats it */
                  className="max-md:hidden cursor-pointer text-[#D1C1B7] group-hover:text-[var(--arrow-hover,#D1C1B7)] group-active:text-[var(--arrow-hover,#D1C1B7)] before:absolute before:inset-0 before:content-['']"
                />
              </div>

              {/* Follows the hook at the card's 16 and stays there — not pinned to the card's foot
                  (the old md:self-end). Figma 2017:5112 leaves the spare height as empty space
                  under the body when a neighbour card is taller.
                  body/s — Neue Haas 450→400 / 16px / 125%, #FCF7F3 at 65%. Static: the hover dim is
                  the hook's (above), and the hover frames (2661:2798) keep this at 65%. */}
              <p className="font-display text-base font-normal leading-[1.25] tracking-[0.25px] text-[#FCF7F3] opacity-65">
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </InView>
    </section>
  )
}
