'use client'

import { useEffect, useState } from 'react'

// Our Method's mobile counterpart to the desktop hover (styles.css, `@media (hover: hover)`): the
// frame draws one adjective lilac with every other row at 60%, and on a touch screen there is no
// pointer to pick which one — so scroll position picks it instead, lighting the rows one at a time
// as you come down the section (Figma 3332:4906, row 1 lit, rows 2-4 dimmed).
//
// The trigger line is the middle of the viewport: a row is lit while it straddles it. That was one
// of two candidates the team felt on a real device — the other lit a row only once it sat entirely
// on screen — and this is the one they picked. It wins because exactly one row can straddle the
// midline at any scroll position, so the highlight tracks continuously and never has to be guessed
// at; the "fully in view" rule leaves gaps on a short phone, where a tall row never qualifies.
//
// Renders nothing. The DOM this drives belongs to the server component (OurMethod) — this finds
// `.method-list` and writes `data-active` onto its rows, which is what the CSS keys on. So the
// section stays server-rendered, and with JS off every row stays at full strength (the frame's
// default) rather than all dimming to 60% with nothing to light them.

// Which row owns the highlight right now. Returns an index into `rows`; never -1, because a list
// with nothing lit reads as broken rather than as "between rows".
function pickActive(rows: HTMLElement[]) {
  const mid = window.innerHeight / 2

  const i = rows.findIndex((row) => {
    const r = row.getBoundingClientRect()
    return r.top <= mid && r.bottom >= mid
  })
  if (i !== -1) return i

  // Nothing crossed the line: the section is off screen entirely. Fall back to whichever row's
  // centre is nearest the middle of the screen.
  let best = 0
  let bestGap = Infinity
  rows.forEach((row, n) => {
    const r = row.getBoundingClientRect()
    const gap = Math.abs((r.top + r.bottom) / 2 - mid)
    if (gap < bestGap) {
      bestGap = gap
      best = n
    }
  })
  return best
}

export default function MethodScrollSpy() {
  // Same gate as the CSS: pointer devices keep the hover, touch devices get this. Resolved in an
  // effect, so the server and the first client render agree on "nothing here".
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const sync = () => setTouch(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!touch) return

    const list = document.querySelector<HTMLElement>('.method-list')
    if (!list) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('.method-row'))
    if (rows.length === 0) return

    // The opt-in the CSS waits for: until this lands, no row is dimmed.
    list.dataset.scrollSpy = ''

    let frame = 0
    const update = () => {
      frame = 0
      const active = pickActive(rows)
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
  }, [touch])

  return null
}
