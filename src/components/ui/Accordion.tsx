'use client'

import { useState } from 'react'
import ChevronDown from '../../../public/chevron-down.svg'

// Disclosure row for the FAQ. Was native <details>/<summary>, which can't animate its own open/close
// anywhere but Chromium (::details-content) — the designer wants the panel to slide at both widths,
// so the state is ours now and the row carries aria-expanded/aria-controls in the element's place.
//
// The slide is `grid-template-rows: 0fr -> 1fr` on a wrapper whose child clips: it animates to the
// answer's real height without anyone measuring it, so nothing breaks when the copy or the width
// changes. max-height would need a magic number that is either too small (clipped) or too large
// (the transition spends most of its time on empty space).
//
// ponytail: each row owns its own open state — the design never closes a sibling, so there is no
// shared state to hoist.

type Props = {
  question: string
  answer: string
  id: string
  className?: string
}

export function Accordion({ question, answer, id, className = '' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
      >
        {/* body-2/l 20 mobile — body-2/xl 24 desktop; New Spirit / 125% */}
        <span className="font-sans text-xl leading-[1.25] theme-ink text-[var(--panel-heading,#292624)] md:text-2xl">
          {question}
        </span>
        {/* the chevron flips rather than swapping to Figma's separate cheveron-up node — same glyph
            mirrored, and it can then transition on the same clock as the panel */}
        <ChevronDown
          aria-hidden
          className={`theme-chevron h-[6.5px] w-[11.5px] shrink-0 transition-transform duration-300 ease-out ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        {/* the clip lives here, not on the grid: the grid row is what animates, and a min-height:auto
            child would refuse to go below its content height */}
        <div className="overflow-hidden">
          {/* body-2/m — New Spirit 18 / 125% / #867A72, both widths. The top margin rides inside the
              clipped box so it collapses with the panel instead of leaving a gap when closed. */}
          <p className="mt-4 font-sans text-lg leading-[1.25] theme-ink text-[var(--panel-muted,#867A72)] md:mt-5">{answer}</p>
        </div>
      </div>
    </div>
  )
}
