'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'
import { setLenis } from '@/lib/lenis'

// Scroll behaviour for the whole app. Renders nothing: it pins the page to the top on load and
// drives Lenis' rAF loop for the page's lifetime.
//
// Lenis animates real scrollTop rather than transforming a wrapper, so everything native keeps
// working: IntersectionObserver still fires, and the <InView> gates need no proxy/sync shim.
//
// Bails entirely under prefers-reduced-motion. Hijacking the scroll wheel is squarely the kind of
// motion that setting is asking us not to do, and there's no "less smooth" version worth shipping —
// not constructing it at all also means no rAF loop and no wheel listeners for those users.
export function SmoothScroll() {
  useEffect(() => {
    // Browsers restore the last scroll offset on refresh. Wrong for this page: the preloader replays
    // every load and the hero cascade fires at first paint, so a restored offset means the curtain
    // lifts on a mid-page view with the hero already over. Above the reduced-motion bail on purpose
    // — the reset isn't motion, it's correctness, and it has to happen either way.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Touch: skip too. Lenis leaves touch scrolling native anyway (syncTouch off), but it still hangs
    // non-passive touchstart/touchmove listeners on the window, so iOS waits on the main thread
    // before every swipe — scroll felt dead whenever JS was busy. Every getLenis() caller is
    // null-safe, and CompoundEffect's hold is desktop-only.
    if (window.matchMedia('(pointer: coarse)').matches) return

    const lenis = new Lenis()
    // published for CompoundEffect, which stops the page while its phases play
    setLenis(lenis)
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      setLenis(null)
      lenis.destroy()
    }
  }, [])

  return null
}
