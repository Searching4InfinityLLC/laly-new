import type { CSSProperties } from 'react'
import { CARD_DARK_PALETTES } from '@/lib/palettes'
import { MediaImage } from '@/components/Media/Image'
import { ArrowCircleButton } from '@/components/ui/ArrowCircleButton'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { InView } from '@/components/ui/InView'
import type { WhoWeAreContent } from '@/lib/types'

// "Who we are" — same cream ground and centred copy stack as the hero, so the type styles are
// reused verbatim rather than re-specified.
// Bracket always animates (via <InView>, once, on scroll-in). Dev panel can fade the rest up.

export default function WhoWeAre({ content }: { content: WhoWeAreContent }) {
  const { label, heading, description, cards } = content

  return (
    <section
      aria-label="Who we are"
      // Figma: 48 top+bottom / 20 sides mobile, 112 / 160 desktop. Ground #FCF7F3.
      className="who-we-are w-full bg-[#fcf7f3] py-12 md:py-28"
    >
      {/* Figma's padding is the rule inside the shell: 20 sides mobile, 160 desktop */}
      <InView className="section-shell px-5 text-center sm:px-10 md:px-40">
        <BracketLabel className="mx-auto mb-6 w-44 theme-label text-[var(--section-label,#867A72)] md:mb-8 md:w-80">
          {label}
        </BracketLabel>
        <h2 className="section-text-reveal font-display text-[40px] font-normal leading-none tracking-tight theme-ink text-[var(--section-heading,#262626)] md:text-6xl xl:text-7xl">
          {heading.split('\n').map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        {/* two paragraphs on mobile, one flowing block on desktop — the paragraphs go inline at md+
            and the second picks up a leading space from ::before, so no second copy of the text */}
        <div className="mt-6 md:mt-8">
          {/* trim + filter: a trailing newline in the CMS field would otherwise render an empty
              paragraph, which reads as a blank line at the bottom of the block */}
          {description.split('\n\n').map((p) => p.trim()).filter(Boolean).map((para, i) => (
            <p
              key={para}
              // desktop-only tracking — it pushes "That" onto line 2 there, but on mobile it was
              // spilling "Us:" onto a second line
              className={`section-text-reveal font-sans text-xl md:text-2xl xl:text-[28px] font-normal leading-[1.25] theme-ink text-[var(--section-body,#4A4A4A)] md:inline md:tracking-[0.02em] ${
                i > 0 ? "mt-6 md:mt-0 md:before:content-['_']" : ''
              }`}
            >
              {para}
            </p>
          ))}
        </div>

        {/* text block → cards: 44 mobile (Figma's 32 + 12, the copy block runs short), 48 desktop */}
        <div className="section-media-reveal mt-11 flex flex-col gap-8 md:mt-12">
          {cards.map((card) => (
            <article
              key={card.title}
              // Mobile: single column, stacked (title+arrow, image, body, stat). Desktop: image fills
              // the left column across all three rows; title/body/stat stack in the right column with
              // the body row growing so the stat pins to the bottom.
              className="case-study relative grid grid-cols-1 gap-4 overflow-hidden border px-3 py-6 text-left md:grid-cols-2 md:gap-6 md:grid-rows-[auto_1fr_auto] md:p-6 3xl:p-8"
              style={{
                '--case-light-bg': card.bg,
                '--case-light-fg': card.fg,
                '--case-light-muted': card.muted,
                '--case-dark-bg': CARD_DARK_PALETTES[card.bg.toLowerCase()]?.bg ?? card.bg,
                '--case-dark-fg': CARD_DARK_PALETTES[card.bg.toLowerCase()]?.fg ?? card.fg,
                '--case-dark-muted': CARD_DARK_PALETTES[card.bg.toLowerCase()]?.muted ?? card.muted,
                borderColor: card.border,
              } as CSSProperties}
            >
              {/* title row — arrow button only shows on mobile (EXPLORE takes over on desktop) */}
              {/* mb-2 on top of the card's 16 gap = the 24 Figma leaves under the title row */}
              <div className="mb-2 flex items-center justify-between gap-4 md:col-start-2 md:row-start-1 md:mb-0">
                {/* heading/h1/m — Neue Haas 450 / 48px / 110% */}
                <h3 className="font-display text-[36px] font-normal leading-[1.1] tracking-tight md:text-5xl 3xl:text-6xl">
                  {card.title}
                </h3>
                {/* on mobile the arrow's stretched ::before makes the whole card clickable.
                    HIDDEN (client note, with EXPLORE below): the case-study pages aren't ready, so
                    the card stops being a link too. `hidden!` beats the component's own inline-flex;
                    restore by removing it. */}
                <ArrowCircleButton
                  href={card.link.href}
                  label={card.link.label}
                  className="hidden! md:hidden before:absolute before:inset-0 before:content-['']"
                />
              </div>

              {/* campaign image — landscape crop on mobile, fills the column height on desktop */}
              {/* outline, not border: the video card composites onto its own layer and paints over
                  a 1px border. outline draws above content, -offset-1 keeps it inside the box so
                  the two cards still measure identically. */}
              <div
                className="aspect-[16/10] overflow-hidden outline outline-1 -outline-offset-1 md:col-start-1 md:row-start-1 md:row-span-3 md:aspect-auto md:h-[330px]"
                style={{ outlineColor: card.border }}
              >
                {card.video ? (
                  // muted+playsInline so mobile autoplays inline; the still doubles as the poster
                  <video
                    src={card.video}
                    poster={card.image.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-label={card.image.alt}
                    /* block — a <video> is inline by default, so it leaves a baseline gap that
                       pushes it past the bottom edge of the bordered box */
                    className="block h-full w-full object-cover object-center"
                  />
                ) : (
                  <MediaImage
                    media={card.image}
                    sizes="(max-width: 1151px) 100vw, (min-width: 1920px) 580px, 40vw"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* body-2/xl — New Spirit 400 / 24px / 125% */}
              <p
                // letter-spacing/l — same -0.01em we use on the hero desc
                className="case-study-body font-sans text-xl font-normal leading-[1.25] tracking-[-0.01em] md:col-start-2 md:row-start-2 md:text-2xl 3xl:text-[28px]"
                // body-2/l is the card's own ink (#313008 Senft, #443B43 Vajra) at 80%
              >
                {card.body}
              </p>

              {/* stat row — stacked (value over label) on mobile, EXPLORE pill added on desktop */}
              {/* pb-2: Figma leaves 8 under the stat row, inside the card's own padding */}
              <div className="flex items-end justify-between md:col-start-2 md:row-start-3 md:self-end md:pb-2">
                <p className="flex flex-col items-start gap-1 md:flex-row md:items-center">
                  {/* % same as heading */}
                  <CountUp
                    value={card.stat.value}
                    className="font-fira text-[32px] font-normal leading-none md:text-[44px]"
                  />
                  {/* body-2/xs — New Spirit 400 / 14px / 125%, flat at every width */}
                  <span
                    className="font-sans text-xs leading-[1.25] whitespace-normal md:text-sm md:whitespace-pre-line"
                    style={{ color: 'var(--case-muted)' }}
                  >
                    {card.stat.label}
                  </span>
                </p>
                {/* HIDDEN (client note): was `hidden md:block`; restore that to bring EXPLORE back */}
                <span className="hidden">
                  {/* EXPLORE's own Figma spec — 1px #292624 keyline, Drop shadow/Small.
                      Instance-only: button styles are deliberately not uniform across the page. */}
                  <Button
                    variant="outline"
                    href={card.link.href}
                    scrambleColor={card.fg}
                    className="border-[1px]! border-[#292624]! text-[#292624]! shadow-[0_2px_6px_0_rgba(16,24,40,0.06)]! hover:bg-black/5"
                  >
                    {card.link.label}
                  </Button>
                </span>
              </div>
            </article>
          ))}
        </div>
      </InView>
    </section>
  )
}
