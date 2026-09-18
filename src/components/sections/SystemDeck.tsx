'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { themed } from '@/lib/palettes'
import type { SystemContent } from '@/lib/types'

// The three-card deck in "The System" (Figma 2767:9520 / 2739:8892), cycling the way the client's
// reference does — teak.io/product. That deck is a Framer variant ring: three states, each one
// switching to the next after 3000ms, with every card's scale, y and colour set per state. Ported
// straight: one card is at the front at a time, and every 3s the front card retires to the back
// while the two behind it step forward.
//
// Figma builds the two back cards as scaled instances of the front one, so all three are the same
// markup here and the *slot* owns the scale — not a second set of type sizes. That is also what
// makes them interchangeable, which cycling needs.
//
// Geometry. The three sit in a 3-row grid with no gap, so the rows equalise to the tallest card and
// every flow position is exactly one card height H apart. A card in slot n wants to be at
// n * (H - overlap); it is laid out at d * H, so it is moved by (n - d) * H - n * overlap, and 100%
// of a translate is H. transform-origin is the top edge, so scaling a back card down does not drag
// it off its slot. The grid ends up `2 * overlap` taller than the stack actually draws, which is a
// fixed cqw, so the container takes that back as a negative bottom margin.
const SCALES = [0.909, 0.9569, 1]
const OVERLAP = 17.225 // 72 of a 418px card, as cqw — same value the static stack used

// Each channel keeps its own hue and carries it between slots, so the palette belongs to the card
// and only the *state* — tinted and behind, or full and in front — belongs to the slot.
//
// TODO(design): Search shipped a front treatment (the amber), Physical/Social shipped tints, and
// Physical's front lavender came back from review. Everything still marked below is matched by eye
// in the same hue, standing in until the designer gives their own.
//
// `dark` = the same slots on the dark theme ground (Figma 3503:3357). That frame draws Search in front
// and Physical/Social behind; the other three states follow its token steps — the hue's /5 as the
// ground in both states, /10 for text behind, /30-40 for the front keyline, /60 for text in front.
const PALETTE = [
  // Physical
  {
    tintBg: '#F6EEF5', tintFg: '#EBD6E9', bg: '#E5CBE2', border: '#9C6790', fg: '#4E2F49', // border/fg placeholder
    dark: { tintBg: '#443B43', tintFg: '#716370', bg: '#443B43', border: '#CBB1C9', fg: '#E2C5DF' }, // front derived
  },
  // Social
  {
    tintBg: '#E6E6C6', tintFg: '#CACA86', bg: '#CFCF72', border: '#8C8C43', fg: '#4A4A22', // bg/border/fg placeholder
    dark: { tintBg: '#313008', tintFg: '#57570F', bg: '#313008', border: '#B5B449', fg: '#CACA86' }, // front derived
  },
  // Search
  {
    tintBg: '#FAECD6', tintFg: '#EFD4AA', bg: '#F2BA63', border: '#AE8340', fg: '#614A28', // tintBg/tintFg placeholder
    dark: { tintBg: '#302514', tintFg: '#614A28', bg: '#302514', border: '#AE8340', fg: '#F2BA63' }, // tint derived
  },
]

// Figma's own card metrics, as a percentage of the front card's width
const PAD = 5.742 // 24
const GAP = 1.914 // 8

const CYCLE = 3000 // teak's dwell, to the millisecond

export function SystemDeck({ chain }: { chain: SystemContent['chain'] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [turn, setTurn] = useState(0)

  // One observer doing two jobs: releasing the entry animation (the .reveal-gate/.is-visible pair
  // the rest of the page uses) and starting the cycle. Off-screen the deck should not be shuffling
  // — teak pauses its loops off-screen too — and this way the first thing you see is the frame as
  // drawn, before it moves.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setVisible(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setTurn((t) => t + 1), CYCLE)
    return () => clearInterval(id)
  }, [visible])

  return (
    // Two boxes, not one. cqw on the element that *establishes* the container resolves against an
    // ancestor container instead of itself (the spec forbids the circularity), and with no ancestor
    // it falls back to the viewport — so the correction below read as -34vw and dropped the whole
    // stack through the bottom of the section. The container stays out here; everything measured in
    // cqw lives inside it. Grid, so the child's negative margin cannot collapse out of this box.
    <div
      ref={ref}
      className={`reveal-gate @container grid w-full max-w-[300px] md:max-w-[418px] ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div
        className="grid"
        style={{
          // 1fr, not Tailwind's grid-rows-3 (minmax(0,1fr)): that 0 min lets a track size below its
          // card, and the three slots then sit at three different heights, which every offset below
          // is measured against. 1fr is minmax(auto,1fr), so the rows equalise to the tallest card.
          gridTemplateRows: 'repeat(3, 1fr)',
          marginBottom: `-${OVERLAP * 2}cqw`,
        }}
      >
        {chain.map((card, d) => {
          const slot = (d + turn) % chain.length
          const front = slot === chain.length - 1
          const skin = PALETTE[d % PALETTE.length]

          return (
            <div
              key={card.title}
              className="system-slot"
              style={{
                gridArea: `${d + 1} / 1`,
                zIndex: slot,
                transform: `translateY(calc(${slot - d} * 100% - ${(slot * OVERLAP).toFixed(3)}cqw)) scale(${SCALES[slot]})`,
              }}
            >
              <div
                className="system-card grain-overlay flex h-full w-full flex-col items-center justify-center border text-center"
                style={
                  {
                    padding: `${PAD}cqw`,
                    gap: `${GAP}cqw`,
                    backgroundColor: front ? themed(skin.bg, skin.dark.bg) : themed(skin.tintBg, skin.dark.tintBg),
                    // the back cards have no keyline in the frame; it stays in the box at zero alpha
                    // so gaining one never changes the card's size
                    borderColor: front ? themed(skin.border, skin.dark.border) : 'transparent',
                    // A retired card goes one flat colour: its blurb drops to the same tint its
                    // title takes (client note), rather than staying on the old neutral body grey.
                    color: front ? themed(skin.fg, skin.dark.fg) : themed(skin.tintFg, skin.dark.tintFg),
                    '--card-delay': `${d * 0.15}s`,
                  } as CSSProperties
                }
              >
                <p
                  className="w-full font-sans text-[34px] font-medium leading-[1.25] tracking-[-0.5px] md:text-[56px]"
                  style={{ color: front ? themed(skin.fg, skin.dark.fg) : themed(skin.tintFg, skin.dark.tintFg) }}
                >
                  {card.title}
                </p>
                {/* 370 of 418 on desktop, 265.55 of 300 on the phone — the same 88.5%, and it is what
                    breaks the front card's blurb onto two lines. */}
                {/* Neue Haas 65 Medium — the frame sets the blurb one weight up from body copy */}
                <p className="w-full max-w-[88.5%] font-display text-[22px] font-medium leading-[1.25] md:text-[32px]">
                  {typeof card.blurb === 'string' ? (
                    card.blurb
                  ) : (
                    <>
                      {card.blurb.before}
                      {/* Figma sets 56 Italic; no italic Neue Haas is self-hosted, so this is the
                          browser's synthesised oblique. Swap in a real face if it reads wrong. */}
                      <em className="italic">{card.blurb.emphasis}</em>
                      {card.blurb.after}
                    </>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
