'use client'

import { useEffect, useState } from 'react'

// Our Method's mobile counterpart to the desktop hover (styles.css, `@media (hover: hover)`): the
// frame draws one adjective lilac with every other row at 60%, and on a touch screen there is no
// pointer to pick which one — so scroll position picks it instead, lighting the rows one at a time
// as you come down the section (Figma 3332:4906, row 1 lit, rows 2-4 dimmed).
//
// Two candidate trigger lines, because the team wanted to feel both on a real device before
// committing. They asked for "the whole thing in view" and "50% through", which for a section
// taller than the viewport can only mean per-row:
//
//   full — a row lights once it sits ENTIRELY inside the viewport. Later, calmer; on a short phone
//          a tall row may never qualify, so the nearest row wins instead.
//   half — a row lights while it straddles the middle of the viewport. Earlier, and always exactly
//          one row qualifies, so it tracks the scroll continuously.
//
// The switch is the floating pop-out below. It is `fixed`, so it is outside flow and cannot shift
// the page, and it renders only where the behaviour is live — see `touch` below.
//
// The DOM this drives is rendered by the server component (OurMethod). This adds no markup to the
// section; it finds `.method-list` and writes `data-active` onto its rows, which is what the CSS
// keys on. So the section stays server-rendered, and with JS off every row stays at full strength
// (the frame's default) rather than all dimming to 60% with nothing to light them.

type Mode = 'full' | 'half'

const STORE_KEY = 'laly:method-scroll-mode'
const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'full', label: 'In view', hint: 'row fully on screen' },
  { id: 'half', label: '50%', hint: 'row crosses the middle' },
]

// Which row owns the highlight right now. Returns an index into `rows`; never -1, because a list
// with nothing lit reads as broken rather than as "between rows".
function pickActive(rows: HTMLElement[], mode: Mode) {
  const vh = window.innerHeight
  const mid = vh / 2

  if (mode === 'full') {
    // First row fully on screen — first, not last, so the highlight sits where you are reading
    // rather than at the bottom edge of the screen.
    const i = rows.findIndex((row) => {
      const r = row.getBoundingClientRect()
      return r.top >= 0 && r.bottom <= vh
    })
    if (i !== -1) return i
  } else {
    const i = rows.findIndex((row) => {
      const r = row.getBoundingClientRect()
      return r.top <= mid && r.bottom >= mid
    })
    if (i !== -1) return i
  }

  // Nothing crossed the line: the section is off screen, or every row is taller than the viewport.
  // Fall back to whichever row's centre is nearest the middle of the screen.
  let best = 0
  let bestGap = Infinity
  rows.forEach((row, i) => {
    const r = row.getBoundingClientRect()
    const gap = Math.abs((r.top + r.bottom) / 2 - mid)
    if (gap < bestGap) {
      bestGap = gap
      best = i
    }
  })
  return best
}

export default function MethodScrollSpy() {
  // Same gate as the CSS: pointer devices keep the hover, touch devices get this. Resolved in an
  // effect, so the server and the first client render agree on "nothing here".
  const [touch, setTouch] = useState(false)
  const [mode, setMode] = useState<Mode>('half')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const sync = () => setTouch(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Survives a reload, so switching modes and refreshing to compare does not silently reset.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORE_KEY)
    if (saved === 'full' || saved === 'half') setMode(saved)
  }, [])

  useEffect(() => {
    if (!touch) return

    const list = document.querySelector<HTMLElement>('.method-list')
    if (!list) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('.method-row'))
    if (rows.length === 0) return

    // The opt-in the CSS waits for: until this lands, no row is dimmed.
    list.dataset.scrollSpy = mode

    let frame = 0
    const update = () => {
      frame = 0
      const active = pickActive(rows, mode)
      rows.forEach((row, i) => {
        if (i === active) row.dataset.active = 'true'
        else delete row.dataset.active
      })
    }
    // rAF-coalesced: touch scroll fires far faster than paint, and this reads layout on every row.
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      delete list.dataset.scrollSpy
      rows.forEach((row) => delete row.dataset.active)
    }
  }, [touch, mode])

  if (!touch) return null

  const choose = (next: Mode) => {
    setMode(next)
    window.localStorage.setItem(STORE_KEY, next)
    setOpen(false)
  }

  return (
    // fixed + bottom-left, under the header's z-[101] so an open menu still covers it. Nothing here
    // participates in layout, which is the point: the section's own rhythm is untouched.
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 font-mono text-xs">
      {open && (
        <div
          role="radiogroup"
          aria-label="Our Method scroll highlight trigger"
          className="flex flex-col overflow-hidden rounded-lg border border-[#292624] bg-[#151414]/95 backdrop-blur"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => choose(m.id)}
              className={`flex flex-col items-start gap-0.5 border-b border-[#292624] px-3 py-2 text-left last:border-b-0 ${
                mode === m.id ? 'text-[#EEC3EA]' : 'text-[#BAA99E]'
              }`}
            >
              <span className="uppercase tracking-[1px]">{m.label}</span>
              <span className="text-[10px] normal-case text-[#BAA99E]/70">{m.hint}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="rounded-full border border-[#292624] bg-[#151414]/95 px-3 py-2 uppercase tracking-[1px] text-[#F7F1EE] backdrop-blur"
      >
        Scroll: {MODES.find((m) => m.id === mode)?.label}
      </button>
    </div>
  )
}
