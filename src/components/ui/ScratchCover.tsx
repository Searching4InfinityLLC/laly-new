'use client'

import { useEffect, useRef, useState } from 'react'

// Scratch-off overlay. Sits absolutely over whatever the caller wants hidden: a canvas painted with
// the design's dark ground + noise, erased under the pointer with destination-out. Only what the
// pointer touches comes off — there is no completion threshold, so the panel never reveals itself.
//
// ponytail: this is magicui's scratch-to-reveal minus the dependencies. That component wants
// `motion` for one scale-pop, `clsx`/`tailwind-merge` for a `cn` this repo doesn't use, and a fixed
// width/height — the band is full-bleed, so the sizing was going to be rewritten regardless. Without
// the auto-reveal there is nothing left to measure either, so the alpha sampling went with it.
//
// The revealed copy is real DOM underneath and this whole layer is aria-hidden, so the section reads
// identically to a screen reader whether it has been scratched or not. Same reason reduced motion
// just never mounts the cover.

const COVER = '#292624' // color/neutral-variant/10 — the unscratched ground
// The 'focus-scratch' scroll theme (SectionTheme's selector) inverts the band until it reaches the
// intersection line: cream cover over a dark band (Figma 3501:3270 / 3501:3275), then back to this
// original. Two canvases take every stroke, and CSS cross-fades them (.scratch-cover in styles.css),
// so the swap never repaints — nothing already scratched grows back.
const COVER_INVERTED = '#FCF7F3' // color/neutral-variant/95
const NOISE = 18 // ± per channel; the design's sub-hero-noise, radius 4
const BRUSH = 30 // scratch radius in CSS px
const CORE = 0.45 // fraction of BRUSH that erases fully; past it the stamp ramps to nothing

export function ScratchCover({ label }: { label: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const invertedRef = useRef<HTMLCanvasElement>(null)
  const [reached, setReached] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [started, setStarted] = useState(false)
  // a ref, not state: it changes per pointermove and must not re-render the canvas out from under
  // the strokes already drawn on it
  const last = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnabled(false)
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const layers = [
      [canvas, COVER],
      [invertedRef.current, COVER_INVERTED],
    ] as const

    const paint = () => {
      // a repaint wipes every stroke, so once the user has started the stale bitmap just stretches.
      // Resizing mid-scratch is not a real session.
      if (last.current) return
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      // capped at 2: this is a noise field, not a photo
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      for (const [layer, color] of layers) {
        const ctx = layer?.getContext('2d')
        if (!layer || !ctx) continue
        layer.width = Math.round(rect.width * dpr)
        layer.height = Math.round(rect.height * dpr)
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = color
        ctx.fillRect(0, 0, layer.width, layer.height)

        const img = ctx.getImageData(0, 0, layer.width, layer.height)
        const d = img.data
        for (let i = 0; i < d.length; i += 4) {
          const n = (Math.random() - 0.5) * NOISE
          d[i] += n
          d[i + 1] += n
          d[i + 2] += n
        }
        ctx.putImageData(img, 0, 0)
      }
    }

    paint()
    // observe the parent: setting canvas.width doesn't change its CSS box, but observing the element
    // we resize is the kind of thing that turns into a loop the moment someone adds a style
    const target = canvas.parentElement ?? canvas
    const ro = new ResizeObserver(paint)
    ro.observe(target)
    return () => ro.disconnect()
  }, [])

  // Turns back at the same screen line a tall section's boundary trips at, with the percentage read
  // off <html> where the selector publishes it. Reversible, like the theme.
  //
  // SectionTheme's own test scales by the element's height (capped at the viewport), which for a tall
  // section comes to the same thing. This band is ~150px, so that version put the line 90px off the
  // bottom edge at 60%: the band flipped back the moment it peeked in and the inverted state was
  // never seen. Measured against the viewport instead — top edge past (100 - pct)% of the screen.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const pct = Number(document.documentElement.dataset.intersection ?? 50)
      setReached(el.getBoundingClientRect().top <= window.innerHeight * (1 - pct / 100))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // mouse only scratches while held; pen/touch only fire move while down anyway
    if (e.pointerType === 'mouse' && e.buttons !== 1) {
      last.current = null
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const contexts = [canvas, invertedRef.current]
      .map((layer) => layer?.getContext('2d'))
      .filter((ctx): ctx is CanvasRenderingContext2D => !!ctx)

    const rect = canvas.getBoundingClientRect()
    const dpr = canvas.width / rect.width
    const x = (e.clientX - rect.left) * dpr
    const y = (e.clientY - rect.top) * dpr

    const r = BRUSH * dpr
    // The brush is a radial gradient rather than a flat disc: destination-out subtracts the stamp's
    // own alpha, so the ramp from CORE out to the rim leaves a feathered edge instead of a cut one.
    // Overlapping passes keep eating the leftover partial alpha, the way a coin does.
    const stamp = (x: number, y: number) => {
      for (const ctx of contexts) {
        ctx.globalCompositeOperation = 'destination-out'
        const g = ctx.createRadialGradient(x, y, r * CORE, x, y, r)
        g.addColorStop(0, 'rgba(0,0,0,1)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // stamps along the segment rather than one stroked line: a line has a single hard width, and at
    // speed the pointermoves are far enough apart that a lone dot per event leaves a dotted trail.
    // A third of the radius per step is close enough that the soft rims overlap into one stroke.
    const from = last.current
    if (from) {
      const dx = x - from.x
      const dy = y - from.y
      const steps = Math.ceil(Math.hypot(dx, dy) / (r / 3))
      for (let i = 1; i <= steps; i++) stamp(from.x + (dx * i) / steps, from.y + (dy * i) / steps)
    } else {
      stamp(x, y)
    }
    last.current = { x, y }
    if (!started) setStarted(true)
  }

  if (!enabled) return null

  return (
    <div ref={rootRef} aria-hidden className="scratch-cover absolute inset-0" data-reached={reached || undefined}>
      {/* the inverted twin sits under the input canvas and only ever receives strokes from it */}
      <canvas ref={invertedRef} className="scratch-inverted pointer-events-none absolute inset-0 size-full" />
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          last.current = null
          scratch(e)
        }}
        onPointerMove={scratch}
        // touch-none: a finger on the band scratches in every direction instead of scrolling the
        // page (client note). touch-action only governs touch/pen, so wheel and trackpad scrolling
        // over the band on desktop are untouched. The band is short, so the page stays swipeable
        // above and below it.
        className="scratch-original absolute inset-0 size-full cursor-crosshair touch-none"
      />
      {/* the prompt rides on top of the cover and leaves on the first stroke — it has done its job by
          then, and it would otherwise sit over whatever gets uncovered */}
      <span
        // heading/h4: 18px mobile (2581:2758), 24 from md up
        className={`scratch-label pointer-events-none absolute inset-0 flex items-center justify-center font-sans text-lg leading-[1.4] tracking-[-0.5px] transition-opacity duration-500 ease-out md:text-2xl ${
          started ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
