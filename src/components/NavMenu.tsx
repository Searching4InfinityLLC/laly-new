'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/Button'
import type { HeaderContent } from '@/lib/types'

// MENU toggle + the drop-down panel it opens — Figma 3038:1661, now at every width.
//
// The panel drops down from under the header bar carrying its own cream ground and keyline. md+ used
// to get something else entirely: four pills sliding in from the right, staggered, each with its own
// rounded surface. That read as pills floating over whatever was scrolled behind them, which is the
// contrast problem the designer flagged on mobile — so desktop now takes the same sheet. Ground and
// contents both centre at every width; the only thing that changes is the links' axis, stacked on a
// phone and one row across the middle of the sheet at md+.
//
// bajgartoffice.com (the reference the designer sent) grows the panel's height from 0 under the
// bar. This slides the whole sheet down out of the bar instead — same read, but the keyline can
// then leave the same way it arrived rather than vanishing once the height hits 0. Framer runs its
// version as spring(bounce .2, duration .4). Brief here is slower and smooth at both ends: 850ms
// ease-in-out instead of a spring — no overshoot at all, since any overshoot IS the hard stop the
// eye reads at the end. Slightly front-loaded (0.5,0 not 0.37,0) so the tap still feels answered.
export function NavMenu({ nav: items, socials = [], copyright }: HeaderContent) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLElement>(null)

  // Click anywhere that is not the sheet or the MENU toggle closes the panel. pointerdown rather
  // than click so the sheet starts leaving on press, and so a drag that ends inside the sheet does
  // not count as an outside click. The toggle is excluded because its own onClick already flips
  // `open` — without that exclusion the two would fire on the same tap and cancel out.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (sheetRef.current?.contains(target) || toggleRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // The dark-hero pages run the bar transparent with a light logo, which is unreadable once this
  // cream sheet is down behind it. styles.css owns that swap off <body>, so this only has to say
  // when the sheet is open — same shape as HeaderGround's data-past-hero.
  //
  // On the way out the flag is held 675ms: the bar stays cream while the sheet is most of the way
  // up, then fades back to transparent, rather than turning transparent over a sheet still sitting
  // over it. It is a timer here rather than a transition-delay in the CSS because that
  // delay would also land on the scroll swap, and scrolling back up into the hero would then sit on
  // a cream bar for most of a second.
  useEffect(() => {
    if (open) {
      document.body.toggleAttribute('data-menu-open', true)
      return
    }
    const t = setTimeout(() => document.body.removeAttribute('data-menu-open'), 675)
    return () => clearTimeout(t)
  }, [open])

  return (
    <div className="relative" ref={toggleRef}>
      {/* no scramble here — the toggle just tints on hover (transition-colors is in the shell base).
          Label masks up to CLOSE while the panel is down. */}
      <Button
        onClick={() => setOpen((o) => !o)}
        scramble={false}
        className="hover:bg-black/5"
        altLabel="CLOSE"
        showAlt={open}
      >
        MENU
      </Button>

      {/* Always mounted (a CSS transition needs both ends rendered) and always full height — the
          panel MOVES rather than growing. An animated clip was the first cut, but a clip has a
          floor: the keyline reaches the header's bottom edge and then has nowhere left to go, so it
          blinks out instead of leaving. Sliding the whole sheet up means the line keeps travelling
          past the edge and gets cut off by this wrapper, which is the same motion the rest of the
          panel makes.
          The wrapper is that cut: a fixed region starting exactly at the header's bottom, clipping
          everything above it. It has to be a separate box because NavMenu renders INSIDE <header> —
          the header is a z-50 stacking context, so nothing in here can paint behind its cream bar,
          and a plain z-index would not have hidden the sheet.
          pointer-events-none on the region, auto on the sheet: the region spans the width below the
          bar and would otherwise swallow clicks on the page with the menu shut.
          `inert` keeps the links out of the tab order and off screen readers while closed.
          No bottom-0: the region only has to clip ABOVE the sheet, so it hugs the sheet's height.
          Pinned to the bottom edge, iOS 26 Safari took it for a bottom bar — a full-width fixed box
          touching the edge — and painted a solid tint behind its floating toolbar instead of letting
          the page scroll under the glass.
          overflow-CLIP, not hidden: hidden makes this a scroll container, and iOS picks the box a
          swipe scrolls before it checks pointer-events — so every swipe starting in this band (the
          sheet's height, under the bar, menu shut) tried to scroll the empty region and the page
          sat still. clip cuts identically without being scrollable. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-19 z-40 overflow-clip"
        inert={!open}
      >
        {/* Figma 3039:2055 — panel padding 20, groups 48 apart, and the sheet closes on the
            #544D49 keyline. That frame draws the bar inside itself and measures the first 48 from
            the logo's bottom edge; ours is a 76px bar that this sheet hangs under, and the logo
            bottoms out 24px above it — so the top inset is the 24 that is left, not another 20. */}
        <nav
          ref={sheetRef}
          aria-label="Primary"
          className={`nav-sheet pointer-events-auto flex flex-col items-center gap-12 border-b border-[#544D49] bg-[#fffcf9] px-5 pt-11 pb-5 transition-transform duration-[850ms] ease-[cubic-bezier(0.5,0,0.2,1)] motion-reduce:transition-none sm:px-10 md:pt-6 ${
            open ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          {/* one handler on the wrapper instead of per link: the header lives in the layout, so a
              route change never unmounts this and the panel would stay open behind the new page */}
          {/* Stacked on a phone, one centred row 20 apart at md+ (Figma 3039:2055). The 430px frame
              draws that row on a phone too, but it only fits at 430 — narrower phones wrap it, and
              the stack is what shipped and works, so the row stays a desktop thing.
              Figma keylines these pills #292624 where Button's outline variant ships #262626 — three
              values on one channel, and overriding it here would be one arbitrary border-colour
              utility fighting another for cascade order. Left alone. */}
          <div
            className="flex flex-col items-center gap-5 md:flex-row md:gap-5"
            onClick={() => setOpen(false)}
          >
            {items.map((item) => (
              <Button key={item.label} href={item.href}>
                {item.label}
              </Button>
            ))}
          </div>

          {socials.length > 0 && (
            <div className="flex items-center justify-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.href ?? '#'}
                  aria-label={s.platform}
                  target="_blank"
                  rel="noreferrer"
                >
                  {/* the ring is part of the svg (a 32x32 rect), so 24px here is Figma's whole
                      24px button — no second border of our own */}
                  <Icon
                    name={s.platform}
                    className="h-6 w-6 [&_rect]:stroke-[#292624] [&_path]:fill-[#292624]"
                  />
                </a>
              ))}
            </div>
          )}

          {copyright && (
            <p className="nav-copyright text-center font-sans text-xs leading-[1.25] tracking-[0.25px] text-[#9F9188]">
              {copyright}
            </p>
          )}
        </nav>
      </div>
    </div>
  )
}
