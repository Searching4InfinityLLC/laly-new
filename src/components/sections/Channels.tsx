'use client'

import { useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from 'react'
import { EMBER_WASH } from '@/lib/palettes'
import { BracketLabel } from '@/components/ui/BracketLabel'
import type { ChannelsContent } from '@/lib/types'

// Figma 2796:9847 (desktop) / 2807:10160 (mobile) — "The Channels" on /branding. Dark ground,
// label/heading, then the channels.
//
// The two frames disagree on how you get between them, so the markup carries both: md+ shows one
// card at a time with the two pixel arrows sitting in a row UNDER it, pushed to the right edge
// (3246:1671), and the phone frame drops the arrows entirely and lays all three out in a row you
// swipe, the active one centred with its neighbours peeking 8px past the gutters. That is a
// scroll-snap strip: no JS, and the thumb is already the control the mobile frame implies by having
// no other one.
//
// The arrows are the same glyph the About carousel uses, so /arrow_pixel.svg is reused as a mask
// rather than copied and recoloured: the file is pink (#FF6D6A) because that is what the carousel
// wants, and this frame draws it in warm grey. Same one-asset-many-tints trick as the hero pills.
//
// Ground: .grain-ground (styles.css) — #151414 and the site's dark grain, as Figma 2796:9847 now draws
// it. It replaced the old #292624 + scanline overlay, whose rules read as lines across the band.
//
// ponytail: index state, two buttons and one translated track — no carousel library. Embla was on
// the table; it would have bought drag, which the phone already gets from the browser's own
// scroll-snap, and snapping, which one transform on a 3-item ring does not need.

// 0 0 8px + 1px 8px 8px, both rgba(21,20,20,0.65) — Figma's own two-layer drop shadow
const CARD_SHADOW = '0 0 8px 0 rgba(21,20,20,0.65), 1px 8px 8px 0 rgba(21,20,20,0.65)'

const ARROW_TINT = '#867A72' // color/neutral-variant/40 — the frame's own arrow colour

function Arrow({ label, onClick, back = false }: { label: string; onClick: () => void; back?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 cursor-pointer transition-opacity hover:opacity-70"
    >
      {/* 27.429 x 24 in the frame — the same glyph the carousel draws at 32 x 28, masked so the
          one file can be pink there and warm grey here. */}
      <span
        aria-hidden
        className={`block h-6 w-[27.429px] ${back ? 'rotate-180' : ''}`}
        style={
          {
            backgroundColor: ARROW_TINT,
            maskImage: 'url(/arrow_pixel.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/arrow_pixel.svg)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          } as CSSProperties
        }
      />
    </button>
  )
}

export function Channels({ content }: { content: ChannelsContent }) {
  const count = content.slides.length

  // Infinite in one direction: the slides are laid out three times over and the track starts on the
  // middle copy, so "next" off the last channel keeps travelling right into a real card instead of
  // rewinding two widths to the left. Once the slide has landed, the position is snapped back into
  // the middle copy with the transition off — same pixels, so nothing is visible, and there is
  // always another copy to walk into whichever way you go.
  // The two outer copies are display:none below md. The phone does not use the track at all (it
  // swipes its own scroll container), and three cards is the strip the mobile frame draws.
  const [pos, setPos] = useState(count)
  const [snap, setSnap] = useState(false)
  // pos mirrored in a ref: the fallback timer below fires from a closure a render or two old
  const posRef = useRef(count)
  const trackRef = useRef<HTMLDivElement>(null)
  const fallback = useRef<number | undefined>(undefined)
  const home = (p: number) => (((p % count) + count) % count) + count

  const move = (p: number) => {
    posRef.current = p
    setPos(p)
  }

  // Back into the middle copy, transitions off for that one frame. Called on transitionend, or by
  // the fallback timer when that event never comes (retargeted mid-flight, crossed out of md, tab
  // hidden) — without it the track would sit on an outer copy and the next few clicks run it off
  // the end of the rendered cards into an empty frame.
  const land = () => {
    window.clearTimeout(fallback.current)
    const p = posRef.current
    if (p === home(p)) return
    setSnap(true)
    move(home(p))
  }

  const step = (by: number) => {
    const to = posRef.current + by
    const track = trackRef.current
    // parseFloat reads the leading number of "0.9s" / "0s"; is-snapping and reduced motion both
    // resolve to 0, and so does the phone, where the track isn't transformed at all
    const ms = track ? parseFloat(getComputedStyle(track).transitionDuration) * 1000 : 0
    if (!ms) {
      // No transition means no transitionend: wrap now, or pos grows with every click and walks
      // off the nine rendered cards. Same pixels either way, so nothing is seen to jump.
      move(home(to))
      return
    }
    // Clicks mid-flight retarget the slide rather than queue, so they are free — until the next one
    // would land past the outer copies. That one is dropped: the track is already heading for the
    // last real card, and the snap-back on landing hands it a fresh copy to walk into.
    if (to < 0 || to >= count * 3) return
    move(to)
    window.clearTimeout(fallback.current)
    fallback.current = window.setTimeout(land, ms + 100)
  }

  // one frame with transitions off is all the snap needs; re-arm straight after
  useEffect(() => {
    if (!snap) return
    const id = requestAnimationFrame(() => setSnap(false))
    return () => cancelAnimationFrame(id)
  }, [snap])

  useEffect(() => () => window.clearTimeout(fallback.current), [])

  const onLanded = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return
    land()
  }

  return (
    <section
      aria-label={content.label}
      aria-roledescription="carousel"
      // Figma frame (2796:9847): p 112, blocks 48 apart, no keyline of its own. Mobile (2807:10160):
      // px 16 / py 48, blocks 40 apart.
      //
      // The page coordinates this ground with its neighboring sections; the carousel stays independent.
      className="grain-ground relative w-full overflow-hidden px-4 py-12 md:p-28"
    >

      <div className="relative mx-auto flex w-full max-w-[1216px] flex-col items-center gap-10 md:gap-12">
        <div className="flex w-full flex-col items-center gap-6 text-center md:gap-8">
          <BracketLabel className="mx-auto w-52 theme-label text-[var(--section-label,#FF6D6A)] md:w-[360px]">
            {content.label}
          </BracketLabel>
          {/* 876px is Figma's own width, and it is what puts the break after "actually" */}
          <h2 className="max-w-[876px] font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] theme-ink text-[var(--section-heading,#FFFCF9)] md:text-[64px]">
            {content.heading}
          </h2>
        </div>

        {/* 1088 is the card's own width in the frame, inside the section's 1216 column; the arrow
            row is that same width, so the arrows land on the card's right edge. 32 between the two.
            Mobile has neither — the strip runs the full gutter-to-gutter width. */}
        <div className="flex w-full flex-col gap-8 md:max-w-[1088px]">
          {/* The viewport. -mx-4 cancels the section's gutters so the neighbours can show past them,
              px-4 puts them back inside, and each card is a viewport wide between them. On a phone
              this is the scroll surface itself — swipe, snap, and the browser's own inertia, no JS.
              At md+ it stops scrolling and clips instead, and the arrows slide the track under it.
              The scrollbar is hidden: this is a swipe surface, not a pane. */}
          <div className="-mx-4 min-w-0 snap-x snap-mandatory overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:snap-none md:overflow-hidden md:px-0 [&::-webkit-scrollbar]:hidden">
            {/* Every card is in the DOM at every width — hiding all but the active one at md+ was
                what let each card size to its own copy, so the frame jumped height between
                channels. In one flex row they stretch to the tallest instead, and the arrows only
                have to move the track. --i is the transform's input; styles.css only applies it at
                md+, where the phone's scroll is off and would otherwise fight it. */}
            <div
              ref={trackRef}
              className={`channel-track flex gap-2 md:gap-12 ${snap ? 'is-snapping' : ''}`}
              style={{ '--i': pos } as CSSProperties}
              onTransitionEnd={onLanded}
            >
              {[0, 1, 2].flatMap((copy) =>
                content.slides.map((slide) => (
                  <article
                    key={`${copy}-${slide.title}`}
                    aria-hidden={copy !== 1 || undefined}
                    // px 16 / py 40 on the phone, px 40 / py 64 on desktop. The gap between cards is real at
                    // every width now — with the cards flush the slide read as one long sheet moving
                    // rather than three objects passing.
                    // w-full is the track's width, i.e. the viewport's content box (its px-4 puts
                    // the gutters back): the strip itself. 100vw counted the desktop scrollbar too,
                    // so a narrow desktop window got cards ~15px wider than the strip, cut at both
                    // edges by the centred snap.
                    className={`w-full shrink-0 snap-center flex-col items-center gap-10 border border-[#3C3734] bg-[rgba(21,20,20,0.32)] px-4 py-10 md:flex-row md:justify-center md:gap-20 md:px-10 md:py-16 ${
                      copy === 1 ? 'flex' : 'hidden md:flex'
                    }`}
                    style={{ boxShadow: CARD_SHADOW }}
                  >
                    <div className="flex w-full flex-1 flex-col items-start gap-5">
                      {/* Figma draws an arrow-up-right button beside the title at opacity 0 — a link
                          that does not exist yet, so it is not rendered. Same call as the
                          paid-advertising panels. */}
                      <p className="w-full font-sans text-[32px] leading-[1.25] tracking-[-0.5px] theme-ink text-[var(--section-subheading,#FCF7F3)] md:text-[40px]">
                        {slide.title}
                      </p>
                      {/* New Spirit Medium Condensed — heavier than the paragraph under it, not bold */}
                      <p className="w-full font-sans text-xl font-medium leading-[1.25] tracking-[-0.5px] theme-ink text-[var(--section-subheading,#FCF7F3)] md:text-2xl md:leading-[1.4]">
                        {slide.lede}
                      </p>
                      <p className="w-full font-display text-base font-normal leading-[1.25] tracking-[0.25px] theme-ink text-[var(--section-body,#E7DCD4)] md:text-xl">
                        {slide.body}
                      </p>
                    </div>

                    {/* 297px on the phone frame, 400 fixed at md+. The rule between the stats and the
                        quote is a border, not the 1px svg Figma exports for it. */}
                    <div
                      className="flex w-full max-w-[297px] shrink-0 flex-col gap-4 border border-[#292624] p-4 md:w-[400px] md:max-w-none md:p-6"
                      style={{ backgroundImage: EMBER_WASH }}
                    >
                      {slide.stats.map((stat) => (
                        <div
                          key={stat.label}
                          // the phone sets the figure beside its label; desktop stacks and centres
                          className="flex w-full items-center gap-4 md:flex-col md:gap-2 md:text-center"
                        >
                          <p className="shrink-0 font-sans text-[32px] leading-[1.25] tracking-[-0.5px] theme-ink text-[var(--section-subheading,#FCF7F3)] md:text-[36px]">
                            {stat.value}
                          </p>
                          {/* Figma sets this nowrap at exactly the panel's inner width. Left to wrap
                              instead: one fallback-font glyph wider and nowrap would overflow the
                              card. */}
                          <p className="font-display text-xs font-normal leading-[1.25] tracking-[0.25px] theme-ink text-[var(--section-muted,#D1C1B7)] md:text-base">
                            {stat.label}
                          </p>
                        </div>
                      ))}

                      <p className="w-full border-t border-[#3C3734] pt-4 font-display text-xs font-normal leading-[1.25] tracking-[0.25px] theme-ink text-[var(--section-muted,#9F9188)] md:text-center md:text-sm">
                        {slide.quote}
                      </p>
                    </div>
                  </article>
                )),
              )}
            </div>
          </div>

          {/* px 8 in the frame, and the phone has no arrows at all */}
          <div className="hidden w-full justify-end gap-8 px-2 md:flex">
            <Arrow back label="Previous channel" onClick={() => step(-1)} />
            <Arrow label="Next channel" onClick={() => step(1)} />
          </div>
        </div>
      </div>
    </section>
  )
}
