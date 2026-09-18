'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { Butterfly } from '@/components/Loader'
import { PRELOADER_CLOSE_DURATION } from '@/lib/motion'

// Route transitions run a curtain (pink, or near-black on a dark OS theme): it slides up from below to cover, holds while the destination
// finishes loading, then keeps going up to reveal it. Same ground, same butterfly, same 1.2s expo.inOut wipes as the intro
// in both directions.
//
// The curtain used to be shared with the first-paint preloader (hence the `preloader-up` keyframe
// name it still animates on). The first-paint intro is now Loader.tsx, a separate sequence, so this is the
// only caller left and the markup lives here.
//
// This intercepts clicks at the document instead of shipping a <TransitionLink>: every internal
// link on the site is a plain next/link (nav, footer, the Strategy cards' ArrowCircleButton), and a
// wrapper would mean touching all of them and remembering to use it for the next one.
//
// The FETCH starts on click so it overlaps the 1.2s slide and a warm route reveals with no dead hold;
// the COMMIT waits for the cover to finish. Those were the same step once — router.push on click —
// and a warm route then swapped the DOM while the curtain was still on its way up, painting the
// destination into the strip not yet covered, at whatever scroll offset the page happened to be at.
// reveal()'s scrollTo(0, 0) only lands after that, so it read as the target page blinking in
// half-scrolled and then correcting itself. Prefetching on click and pushing under full cover keeps
// the overlap and makes the swap unobservable.
const DURATION_MS = PRELOADER_CLOSE_DURATION * 1000
// animationend is primary; this only covers a backgrounded tab dropping the event. A stuck curtain
// is a dead site, so both directions get one.
const FALLBACK_MS = DURATION_MS + 200

type Phase = 'idle' | 'cover' | 'hold' | 'reveal'

const PHASE_CLASS: Record<Exclude<Phase, 'idle'>, string> = {
  cover: 'is-cover',
  hold: 'is-hold',
  reveal: 'is-reveal',
}

export function RouteTransition() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  // isPending stays true until the destination's RSC payload has arrived and committed — i.e. it IS
  // the "target page loaded" signal, no manual load tracking needed.
  const [isPending, startTransition] = useTransition()
  // Where the click was headed, held from the click until the cover lands. A ref, not state: it
  // must not render anything, and it is read exactly once.
  const target = useRef<string | null>(null)

  // Fully covered: commit the navigation now. Both setState calls are in one batch, so the render
  // that first sees phase 'hold' already sees isPending true — which is what stops the effect below
  // from reading "held, nothing pending" and revealing an empty beat early.
  const cover = useCallback(() => {
    const to = target.current
    target.current = null
    setPhase('hold')
    if (to) startTransition(() => router.push(to))
  }, [router])

  const reveal = useCallback(() => {
    // The destination mounted behind the curtain, so its entry cascade already played to nobody.
    // Re-adding the gate class restarts every .entry-copy animation from zero, and it does so at the
    // moment the reveal starts — the same offset the cascade has on a cold load, where the class
    // flips as the curtain begins to lift.
    const root = document.documentElement
    root.classList.remove('preloader-done')
    void root.offsetWidth // forced reflow, or the remove/add collapses into no change
    root.classList.add('preloader-done')
    // Next resets scroll on push, but Lenis owns scrollTop here and can land mid-page. Behind the
    // curtain, so it is never seen.
    window.scrollTo(0, 0)
    setPhase('reveal')
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // let the browser have modified clicks (new tab / download / middle button) and anything a
      // handler upstream already claimed
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const anchor = (e.target as Element | null)?.closest?.('a')
      const href = anchor?.getAttribute('href')
      if (!anchor || !href || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      // reduced motion gets a plain next/link navigation — same bail the preloader makes
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const url = new URL(href, window.location.href)
      // external, or a hash/query jump within the current page — neither is a page change
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname) return

      e.preventDefault()
      // mid-transition clicks are dropped rather than queued: the curtain is over the link anyway
      if (phase !== 'idle') return

      const to = url.pathname + url.search + url.hash
      target.current = to
      // Warms the route cache across the slide without committing anything. By the time cover()
      // pushes, a prefetched route has nothing left to wait for.
      router.prefetch(to)
      setPhase('cover')
    }

    // capture, so this runs before next/link's own handler claims the event
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [phase, router])

  // covered and the route has committed -> lift
  useEffect(() => {
    if (phase === 'hold' && !isPending) reveal()
  }, [phase, isPending, reveal])

  useEffect(() => {
    if (phase === 'idle' || phase === 'hold') return
    const t = setTimeout(() => (phase === 'cover' ? cover() : setPhase('idle')), FALLBACK_MS)
    return () => clearTimeout(t)
  }, [phase, cover])

  if (phase === 'idle') return null

  return (
    <Curtain
      className={`route-curtain ${PHASE_CLASS[phase]}`}
      onAnimationEnd={(e) => {
        if (e.animationName.includes('curtain-in')) cover()
        else if (e.animationName.includes('preloader-up')) setPhase('idle')
      }}
    />
  )
}

// The curtain itself, markup only — who slides it and when is the caller's business.
function Curtain({
  className = '',
  onAnimationEnd,
}: {
  className?: string
  onAnimationEnd?: (e: React.AnimationEvent<HTMLDivElement>) => void
}) {
  return (
    <div
      aria-hidden
      onAnimationEnd={onAnimationEnd}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-(--curtain-ground) ${className}`}
    >
      {/* Figma 3496:3977 — the butterfly mark centred, not the wordmark; colours follow the OS
          theme via --curtain-* in styles.css */}
      <Butterfly className="text-(--curtain-mark)" />
    </div>
  )
}
