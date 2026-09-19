'use client'

import { useEffect, useRef, useState } from 'react'

// Scratch-off overlay. Sits absolutely over whatever the caller wants hidden: a canvas painted with
// the design's dark ground + noise, erased under the pointer with destination-out. Once about half of
// it is gone the rest fades out on its own, so nobody has to scrub every last pixel off.
//
// ponytail: this is magicui's scratch-to-reveal minus the dependencies. That component wants
// `motion` for one scale-pop, `clsx`/`tailwind-merge` for a `cn` this repo doesn't use, and a fixed
// width/height — the band is full-bleed, so the sizing was going to be rewritten regardless.
//
// The revealed copy is real DOM underneath and the canvas is aria-hidden, so the section reads
// identically to a screen reader whether it has been scratched or not. The layer itself is a button
// — Enter/Space (or a screen reader's activate) reveals everything — so a keyboard can get at what a
// pointer scratches. Reduced motion just never mounts the cover. Nor does anything show without JS:
// the canvas is blank until the effect paints it, and the prompt waits for that paint, so no-JS
// visitors just see the copy.

const COVER = '#292624' // color/neutral-variant/10 — the unscratched ground
const NOISE = 18 // ± per channel; the design's sub-hero-noise, radius 4
const BRUSH = 30 // scratch radius in CSS px
const CORE = 0.45 // fraction of BRUSH that erases fully; past it the stamp ramps to nothing
const REVEAL_AT = 0.5 // cleared fraction at which the rest of the cover fades away
const SAMPLES = 10_000 // roughly how many pixels the coverage check reads, whatever the canvas size

export function ScratchCover({ label }: { label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const [enabled, setEnabled] = useState(true)
  const [painted, setPainted] = useState(false)
  const [started, setStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  // Refs, not state: they change per pointermove and must not re-render the canvas out from under
  // the strokes already drawn on it. `last` is only the current stroke's previous point (null
  // between strokes); whether anything has been scratched at all is `scratched`, which a hovering
  // mouse clearing `last` must not reset.
  const last = useRef<{ x: number; y: number } | null>(null)
  const scratched = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnabled(false)
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    // willReadFrequently: the noise fill and the coverage check both read the bitmap back, and a
    // GPU-backed canvas makes every one of those a round trip (Chrome warns about it in the console)
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctxRef.current = ctx
    let drawn = false

    // Keeps the backing store at the element's CSS size x DPR, so a stroke lands under the pointer
    // after a resize, rotate or zoom instead of on a stretched bitmap.
    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      // capped at 2: this is a noise field, not a photo
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (drawn && w === canvas.width && h === canvas.height) return

      // Setting width/height clears the canvas, so a scratched cover is snapshotted first and its
      // holes carried over. The noise is repainted fresh at the new size and the old bitmap only
      // masks it (destination-in keeps the new pixels where the old ones were still opaque) — the
      // scratch survives, stretched with the box, and the grain stays crisp instead of scaled.
      let prev: HTMLCanvasElement | null = null
      if (scratched.current) {
        prev = document.createElement('canvas')
        prev.width = canvas.width
        prev.height = canvas.height
        prev.getContext('2d')?.drawImage(canvas, 0, 0)
      }

      canvas.width = w
      canvas.height = h
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = COVER
      ctx.fillRect(0, 0, w, h)

      const img = ctx.getImageData(0, 0, w, h)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * NOISE
        d[i] += n
        d[i + 1] += n
        d[i + 2] += n
      }
      ctx.putImageData(img, 0, 0)

      if (prev) {
        ctx.globalCompositeOperation = 'destination-in'
        ctx.drawImage(prev, 0, 0, w, h)
      }
      // a stroke in progress was in the old bitmap's coordinates
      last.current = null
      drawn = true
      setPainted(true)
    }

    fit()
    // observe the parent: setting canvas.width doesn't change its CSS box, but observing the element
    // we resize is the kind of thing that turns into a loop the moment someone adds a style
    const target = canvas.parentElement ?? canvas
    const ro = new ResizeObserver(fit)
    ro.observe(target)
    return () => ro.disconnect()
  }, [])

  // Run once per stroke, on pointerup — per pointermove it would be a full readback at 60Hz for a
  // number that only matters when the finger lifts. Strided so it costs the same on any screen.
  const checkCoverage = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx || !scratched.current || !canvas.width || !canvas.height) return
    const { width: w, height: h } = canvas
    const d = ctx.getImageData(0, 0, w, h).data
    const stride = Math.max(1, Math.floor(Math.sqrt((w * h) / SAMPLES)))
    let clear = 0
    let total = 0
    for (let y = 0; y < h; y += stride) {
      for (let x = 0; x < w; x += stride) {
        total++
        if (d[(y * w + x) * 4 + 3] < 128) clear++
      }
    }
    if (clear / total >= REVEAL_AT) setRevealed(true)
  }

  const endStroke = () => {
    last.current = null
    checkCoverage()
  }

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // mouse only scratches while held; pen/touch only fire move while down anyway
    if (e.pointerType === 'mouse' && e.buttons !== 1) {
      last.current = null
      return
    }
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    // per axis: rounding (and any frame where the backing store hasn't caught up with a resize yet)
    // makes the two scales differ slightly, and one of them applied to both drifts the stroke
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const sx = canvas.width / rect.width
    const sy = canvas.height / rect.height
    const x = (e.clientX - rect.left) * sx
    const y = (e.clientY - rect.top) * sy

    ctx.globalCompositeOperation = 'destination-out'
    const r = BRUSH * sx
    // The brush is a radial gradient rather than a flat disc: destination-out subtracts the stamp's
    // own alpha, so the ramp from CORE out to the rim leaves a feathered edge instead of a cut one.
    // Overlapping passes keep eating the leftover partial alpha, the way a coin does.
    const stamp = (x: number, y: number) => {
      const g = ctx.createRadialGradient(x, y, r * CORE, x, y, r)
      g.addColorStop(0, 'rgba(0,0,0,1)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
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
    scratched.current = true
    if (!started) setStarted(true)
  }

  if (!enabled) return null

  return (
    // A real button, so Enter/Space and a screen reader's "activate" work with no key handling of our
    // own. Those clicks arrive with detail 0; a mouse or finger click is detail >= 1 and is just the
    // end of a scratch, so it must not reveal the lot. Until the canvas has painted (or without JS)
    // it is out of the tab order and the a11y tree: there is nothing on screen to reveal yet.
    // Once revealed it fades, then goes visibility:hidden so it stops catching pointers and focus.
    <button
      type="button"
      aria-label="Reveal"
      aria-hidden={!painted || revealed || undefined}
      tabIndex={painted && !revealed ? 0 : -1}
      onClick={(e) => {
        if (e.detail === 0) setRevealed(true)
      }}
      className={`absolute inset-0 block size-full cursor-default outline-none transition-[opacity,visibility] duration-700 ease-out focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#BAA99E] motion-reduce:transition-none ${
        revealed ? 'invisible pointer-events-none opacity-0' : ''
      }`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          last.current = null
          scratch(e)
        }}
        onPointerMove={scratch}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        // touch-none: a finger on the band scratches in every direction instead of scrolling the
        // page (client note). touch-action only governs touch/pen, so wheel and trackpad scrolling
        // over the band on desktop are untouched. The band is short, so the page stays swipeable
        // above and below it. (pan-y would give vertical flicks back to the page, but then only
        // horizontal strokes scratch — the opposite of the note.)
        className="absolute inset-0 size-full cursor-crosshair touch-none"
      />
      {/* the prompt rides on top of the cover and leaves on the first stroke — it has done its job by
          then, and it would otherwise sit over whatever gets uncovered. Not rendered until the
          cover has painted: over the bare copy (no JS, or before hydration) it is just grey text
          on top of the words it is meant to be hiding. */}
      {painted && (
        <span
          aria-hidden
          // heading/h4: 18px mobile (2581:2758), 24 from md up
          className={`pointer-events-none absolute inset-0 flex items-center justify-center font-sans text-lg leading-[1.4] tracking-[-0.5px] text-[#BAA99E] transition-opacity duration-500 ease-out md:text-2xl ${
            started ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {label}
        </span>
      )}
    </button>
  )
}
