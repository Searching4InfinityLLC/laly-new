'use client'

import { useEffect, useRef, useState } from 'react'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { getLenis } from '@/lib/lenis'

// First-paint intro, ported from karocrafts.com's Loader (a GSAP timeline) to CSS keyframes with the
// same durations, offsets and eases — see `.loader*` in styles.css for the timeline itself. Karo's
// layers map onto the Figma frame (3481:2101): their white ground is our cream grid, their looping
// product video is the butterfly, their blue wipe is our pink.
//
// Pure CSS so it runs from first paint, not hydration. JS only reads the wipe's clock to (a) release
// the hero at the moment the wipe starts — Karo's `readyForAnim` — and (b) unmount when it ends.
const READY_AT_MS = 3400 // bar 2s, +0.1 gap, pink/cream swap 1.2s, +0.1 gap -> the wipe starts

export function Loader() {
  const ref = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const ready = () => root.classList.add('preloader-done')
    const el = ref.current
    // reduced motion hides the loader in CSS; there is no clock to wait on
    const anim = el?.getAnimations().find((a) => (a as CSSAnimation).animationName === 'loader-wipe')
    if (!el || !anim) {
      ready()
      setDone(true)
      return
    }

    // hold the page still behind the intro. Released when the wipe ends, NOT in the cleanup alone:
    // finishing only renders null, the component stays mounted, so the cleanup never runs then.
    root.style.overflow = 'clip'
    getLenis()?.stop()
    const release = () => {
      root.style.removeProperty('overflow')
      getLenis()?.start()
    }

    // currentTime counts the animation-delay too, so this is time left until the wipe begins —
    // correct however late hydration lands.
    const t = window.setTimeout(ready, Math.max(0, READY_AT_MS - Number(anim.currentTime ?? 0)))
    let alive = true
    anim.finished
      .catch(() => {}) // cancelled = unmounted; the cleanup below already released everything
      .then(() => {
        if (!alive) return
        release()
        setDone(true)
      })

    return () => {
      alive = false
      window.clearTimeout(t)
      ready()
      release()
    }
  }, [])

  if (done) return null

  return (
    // Absolute at the top of the document, 100lvh tall — NOT fixed. iOS 26 Safari paints a solid tint
    // behind its floating toolbar whenever a fixed box touches the bottom edge (this one did, bar
    // track and all). Page content is allowed under the glass, so the loader is laid out as content:
    // the page is scroll-locked at the top while it runs, and lvh reaches down behind the toolbar.
    // What must be SEEN (butterfly centre, label, bar) is placed against svh — the visible area —
    // via --loader-toolbar = lvh - svh (0 wherever the two are equal, i.e. desktop).
    <div ref={ref} aria-hidden className="loader absolute inset-x-0 top-0 z-[10000] h-lvh">
      {/* the wipe ground; its own butterfly copy rides inside it so the swap reads as the butterfly
          changing colour under the wipe line (Karo duplicates its text the same way). Colours are
          theme tokens on .loader in styles.css. */}
      <div className="loader-pink absolute -inset-px z-[3] flex items-center justify-center bg-(--loader-wipe) pb-(--loader-toolbar)">
        <Butterfly className="text-(--loader-wipe-mark)" />
      </div>
      <div className="loader-cream absolute -inset-px z-[1] flex items-center justify-center bg-(--loader-ground) pb-(--loader-toolbar)">
        {/* light theme only: grid holds full strength to ~70% down, then softens to nothing */}
        <div
          className="grid-backdrop absolute inset-0"
          style={{
            display: 'var(--loader-grid)',
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)',
          }}
        />
        <Butterfly className="relative text-(--loader-mark)" />
      </div>
      {/* Figma: Fira 16/1.4, 1px tracking, 24px over a 14px bar */}
      <div className="loader-bottom absolute inset-x-0 bottom-(--loader-toolbar) z-[2] flex flex-col items-center">
        {/* the site's own eyebrow mechanic — brackets swing out, word wipes up */}
        <BracketLabel className="mb-6 w-30 text-(--loader-label) text-[16px]! tracking-[1px]!">Loading</BracketLabel>
        <div className="h-3.5 self-stretch bg-(--loader-track)">
          <div className="loader-bar h-full bg-(--loader-bar)" />
        </div>
      </div>
    </div>
  )
}

// Figma's exported vector (qAkuC2, 132.45 x 129.86 on the 1440 frame), fill swapped to currentColor
// so one shape serves every theme slot (and the route curtain, RouteTransition.tsx). Stand-in for a flapping-butterfly clip (Karo's box plays a
// looping video here) — swap in a <video> once it exists.
export function Butterfly({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 132.449 129.859" className={`w-[24svw] md:w-[9.2vw] ${className ?? ''}`} fill="currentColor">
      <path d="M98.4199 81.6193L109.87 84.2123C116.752 85.7703 122.34 90.2623 124.87 95.5673C128.112 102.366 127.394 109.442 124.279 115.823C120.139 124.305 112.01 129.597 103.053 129.849C81.2469 130.462 72.5649 101.36 74.1529 79.5773C75.3779 62.7813 78.6819 46.2403 84.4479 30.6203C91.2189 12.2783 109.907 -6.44469 123.449 2.15231C130.318 6.51331 133.555 13.7823 132.111 21.8583C130.914 28.5603 126.99 34.9713 121.48 39.3343L100.629 55.8423C96.7629 58.9023 93.4399 63.2293 91.6799 67.6963C89.3919 73.5023 91.8819 80.1393 98.4199 81.6193Z" />
      <path d="M9.77088 92.0503C19.2819 79.5503 37.3809 86.4603 40.9199 75.3523C46.7789 56.9613 8.79088 46.2423 1.40688 26.1273C-1.98312 16.8933 0.775878 6.83031 9.43888 1.87831C23.3399 -6.06869 41.7349 13.0813 48.2409 31.1843C53.8219 46.7143 57.1619 62.9713 58.2739 79.5783C59.6359 99.9043 52.0359 127.795 32.7379 129.689C24.1849 130.528 16.6639 127.309 11.3639 120.809C4.70388 112.64 3.02588 100.916 9.77088 92.0503Z" />
      <path d="M66.2079 65.4103C69.996 65.4103 73.0669 62.3394 73.0669 58.5513C73.0669 54.7632 69.996 51.6923 66.2079 51.6923C62.4198 51.6923 59.3489 54.7632 59.3489 58.5513C59.3489 62.3394 62.4198 65.4103 66.2079 65.4103Z" />
    </svg>
  )
}
