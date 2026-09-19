'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Image, { type StaticImageData } from 'next/image'
import railLogo from '../../../public/blacklogo.png'
import { MediaImage } from '@/components/Media/Image'
import type { MediaDoc } from '@/lib/types'
import railTexture from '../../../public/branding/hero.webp'
import { MaskText, type MaskTiming } from '@/components/ui/MaskText'
import { Button } from '@/components/ui/Button'
import { BOOKING_DIALOG_ID } from '@/lib/booking'
import { getLenis } from '@/lib/lenis'

// The one booking flow behind every "LET'S BEGIN" / "BOOK A CALL" on the site. Mounted once in the
// frontend layout; opened by Button's `booking` prop (see src/lib/booking.ts for why that indirection
// exists). Three steps: details -> pick a time -> confirmation.
//
// Design: the two-column card comes from Figma 1679:7024 (the login frame) — form left, panel right,
// capped near its 768. Everything ON that card is the marketing system from 2017:5040, NOT the login
// frame's shadcn/Inter kit: Neue Haas display, New Spirit prose, Fira Code labels, #ff6d6a, square
// panels closing on the #544d49 keyline, and the bracketed eyebrow every section already uses. The
// modal opens over the pink Contact section, so Inter in here would read as a different product.
//
// The archived madlib form (182:590) contributed its palette and its underline-only inputs, not its
// pattern — sentence forms wreck screen-reader announcements (fields lose the sentence in forms mode)
// and strand magnifier users on wrapped lines. Plain stacked label/field pairs, brand-dressed.
//
// Research that shaped the flow rather than the paint: a visible step indicator is worth ~20% on
// multi-step completion, so the brackets are a progress meter and not decoration; only the fields
// needed to hold a slot are asked before the booking; slots are 30 minutes, grouped morning/
// afternoon, with the timezone stated rather than assumed; the first free slot is pre-selected.

// Local copy rather than importing ServiceHero's export: this is a client component, and pulling a
// symbol out of that module would drag the whole hero section into the client bundle for an eight
// line mapper. paid-advertising/page.tsx keeps its own copy for the same reason.
const texture = (img: StaticImageData): MediaDoc => ({
  url: img.src,
  width: img.width,
  height: img.height,
  alt: '',
  blurDataURL: img.blurDataURL,
})

type Slot = { start: string; end: string }

type Details = {
  firstName: string
  lastName: string
  email: string
  zip: string
  business: string
}

const EMPTY: Details = { firstName: '', lastName: '', email: '', zip: '', business: '' }

// `wide` spans both columns of the md grid. Email earns it because addresses are long and a
// half-width field truncates them under the caret while you type.
const FIELDS: {
  key: keyof Details
  label: string
  type: string
  autoComplete: string
  wide?: boolean
}[] = [
  { key: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name' },
  { key: 'lastName', label: 'Last name', type: 'text', autoComplete: 'family-name' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', wide: true },
  { key: 'zip', label: 'Zip code', type: 'text', autoComplete: 'postal-code' },
  { key: 'business', label: 'Business', type: 'text', autoComplete: 'organization' },
]

// Deliberately loose. A trust-boundary check belongs on the server (and is there); this exists only
// so someone doesn't lose their slot to a typo, so it rejects what is obviously wrong and nothing
// else. Over-strict client email regexes reject real addresses.
function validate(d: Details): Partial<Record<keyof Details, string>> {
  const errors: Partial<Record<keyof Details, string>> = {}
  if (!d.firstName.trim()) errors.firstName = 'Tell us your first name.'
  if (!d.lastName.trim()) errors.lastName = 'Tell us your last name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) errors.email = 'That email looks off.'
  if (!/^\d{5}(-\d{4})?$/.test(d.zip.trim())) errors.zip = 'Five digits, e.g. 33101.'
  if (!d.business.trim()) errors.business = 'What is the business called?'
  return errors
}

// Every time in this dialog is LALY'S time, not the visitor's. A call is a place two people have to
// be at once, and the agency is the one that has to be there for all of them — showing a Jakarta
// visitor "9:00 AM" in their own zone means they book a slot nobody is in the office for. So the
// grid, the chips and the confirmation all read in this zone, labelled, and the only thing the
// visitor's own zone is used for is metadata on the booking.
const AGENCY_TZ = 'America/New_York'
// Chips in a fully open day, morning then afternoon — 9–12 and 13–17 at 30 minutes (src/lib/slots.ts).
// Drives the skeleton and the height the chip area reserves. If business hours change, change this;
// get it wrong and the only symptom is the picker's height, never a wrong slot.
const DAY_SHAPE = [6, 8] as const

// A calendar date, anchored at noon UTC. Noon is the trick: it is the same calendar day in every
// zone on earth, so the date can be formatted for display without a zone quietly rolling it over.
const dayDate = (ymd: string) => new Date(`${ymd}T12:00:00Z`)

const dayPart = (ymd: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(dayDate(ymd))

// Next 10 agency weekdays as YYYY-MM-DD. Weekends are dropped here rather than server-side so the
// strip never renders a chip that can only come back empty. Built off the agency's today, and walked
// in UTC from a noon anchor, so no arithmetic ever crosses a DST boundary.
function weekdays(count: number): string[] {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: AGENCY_TZ }).format(new Date())
  const [y, m, d] = today.split('-').map(Number)
  const cur = new Date(Date.UTC(y, m - 1, d, 12))
  const out: string[] = []
  while (out.length < count) {
    cur.setUTCDate(cur.getUTCDate() + 1)
    const dow = cur.getUTCDay()
    if (dow !== 0 && dow !== 6) out.push(cur.toISOString().slice(0, 10))
  }
  return out
}

const STEPS = ['DETAILS', 'PICK A TIME', 'CONFIRMED'] as const

// Step transitions, lifted from TeamCarousel's idle -> exiting -> entering machine: the outgoing
// layer leaves and the incoming one arrives from the opposite edge, so forward and back read as
// different moves rather than a blink.
//
// One difference from the carousel, and it is deliberate: there the two layers overlap, because
// photos have to slide past each other. Here they are sequential — the step bodies are forms, and
// mounting two of them at once would put two `id="booking-email"` in the document, which breaks
// every <label for> and the aria-describedby error wiring with it. Out, swap, in.
type Phase = 'idle' | 'exiting' | 'entering'
const EXIT_MS = 220
const ENTER_MS = 340
const EXIT_EASE = 'cubic-bezier(0.55,0,1,0.45)' // the carousel's role-line exit
const ENTER_EASE = 'cubic-bezier(0.25,1,0.5,1)' // and its entrance
const SHIFT = 28 // px — a nudge, not a slide; the panel is a card, not a carousel

// The step eyebrow masks vertically between steps — the same treatment the About carousel gives a
// member's name.
const T_EYEBROW: MaskTiming = {
  exitMs: EXIT_MS, exitDelayMs: 0, exitEasing: EXIT_EASE,
  enterMs: ENTER_MS, enterEasing: ENTER_EASE, delayMs: 0,
}

export function BookingDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  const downOnBackdrop = useRef(false)
  // Nothing renders until the dialog is first opened. Two reasons: the date strip is derived from
  // `new Date()` and would not survive hydration if it shipped in the server HTML, and the homepage
  // is scored on Lighthouse — an unopened modal has no business in the first paint.
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [details, setDetails] = useState<Details>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({})
  const [date, setDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[] | null>(null)
  // A NEW day is loading while the PREVIOUS day's chips stay on screen. Blanking them mid-flight was
  // the blink: chips out, skeletons in, chips back — three layouts inside ~100ms on a warm
  // connection. Counts differ per day once Google's busy list is subtracted, but the chip area
  // reserves a full day's height (DAY_SHAPE), so holding the old grid in place never moves anything.
  const [pending, setPending] = useState(false)
  const [slot, setSlot] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Bumped to force a re-fetch of the same day — setting `date` to the value it already holds is not
  // a dependency change, so it would never re-run the effect below.
  const [reload, setReload] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  // The masked texts need BOTH the old and the new string on screen at once, so they cannot read off
  // `step` — that flips at the halfway point to swap the body. `headStep` lags behind it and only
  // catches up once the mask has finished; `incomingStep` is what is arriving.
  const [headStep, setHeadStep] = useState(0)
  const [incomingStep, setIncomingStep] = useState<number | null>(null)
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  // Ignores clicks mid-move. Without it a fast double-click restarts the exit from a half-faded
  // position and the panel stutters.
  const moving = useRef(false)
  const [failed, setFailed] = useState<string | null>(null)
  // The day's availability could not be loaded (server down, offline). Its own state, because an
  // empty list reads "nothing free that day" — an outage passed off as a full calendar.
  const [slotsError, setSlotsError] = useState(false)
  const [meetUrl, setMeetUrl] = useState<string | null>(null)
  // whether the server actually sent a calendar invite. False while the Google wiring is stubbed,
  // and the confirmation copy reads off it rather than assuming.
  const [invited, setInvited] = useState(false)

  const days = useMemo(() => (ready ? weekdays(10) : []), [ready])
  // The VISITOR's zone. Nothing on screen is drawn in it (everything reads in AGENCY_TZ) — it rides
  // along on the booking so the invite and the lead record know where the person actually is.
  const tz = useMemo(
    () => (ready ? Intl.DateTimeFormat().resolvedOptions().timeZone : ''),
    [ready],
  )

  const close = useCallback(() => ref.current?.close(), [])

  // The close handler needs to know which step it closed on, but must not be a dependency of the
  // lifecycle effect below — re-running that effect mid-flow would hand the scroll back to Lenis
  // while the dialog is still up.
  const stepRef = useRef(step)
  useEffect(() => {
    stepRef.current = step
  }, [step])

  // What the rail echoes back. Filling in as the reader goes is the whole job of the panel: a
  // booking flow's anxiety is 'did it take what I typed', and answering that costs one column.
  const recap: [string, string][] = [
    ['NAME', [details.firstName, details.lastName].filter(Boolean).join(' ')],
    ['BUSINESS', details.business],
    [
      'WHEN',
      slot
        ? `${new Intl.DateTimeFormat('en-US', {
            timeZone: AGENCY_TZ,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }).format(new Date(slot))}, ${new Intl.DateTimeFormat('en-US', {
            timeZone: AGENCY_TZ,
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date(slot))}`
        : '',
    ],
  ]

  // Lenis owns the page's scrollTop, and it keeps driving it while the modal is up — the wheel over
  // a top-layer dialog still reaches the window. stop() parks it; the nested scroller gets
  // data-lenis-prevent so its own overflow stays native either way.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onOpen = () => getLenis()?.stop()
    const onClose = () => {
      getLenis()?.start()
      // Reset only after a completed booking. A user who closed mid-flow and comes back almost
      // always meant to keep typing, so the half-filled form is kept.
      if (stepRef.current !== 2) return
      setStep(0)
      setHeadStep(0)
      setIncomingStep(null)
      setDetails(EMPTY)
      setDate(null)
      setSlot(null)
      setSlots(null)
      setSlotsError(false)
      setErrors({})
      setFailed(null)
      setMeetUrl(null)
      setInvited(false)
    }
    // showModal fires no event of its own, so the open side rides the observer that the
    // `open` attribute flips.
    const obs = new MutationObserver(() => {
      if (el.open) {
        setReady(true)
        onOpen()
      }
    })
    obs.observe(el, { attributes: true, attributeFilter: ['open'] })
    el.addEventListener('close', onClose)
    return () => {
      obs.disconnect()
      el.removeEventListener('close', onClose)
      getLenis()?.start()
    }
  }, [])

  // Slots for the chosen day. AbortController because clicking along the date strip fires these
  // faster than they come back, and a late response would otherwise overwrite a newer one.
  useEffect(() => {
    if (!date) return
    const ac = new AbortController()
    setPending(true)
    setSlotsError(false)
    fetch(`/api/booking/slots?date=${date}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { slots: Slot[] }) => {
        setSlots(data.slots)
        // Pre-select the first free slot: the whole point of the step is picking one, and an empty
        // selection makes the reader do work the page could have done.
        setSlot(data.slots[0]?.start ?? null)
        setPending(false)
      })
      .catch((e) => {
        if (e.name === 'AbortError') return // a newer day is already in flight and owns `pending`
        setSlotsError(true)
        setSlots([])
        setSlot(null)
        setPending(false)
      })
    return () => ac.abort()
  }, [date, reload])

  // Every gate in the UI reads off this one value, so the NEXT button and the step meter can never
  // disagree about whether the details are done.
  const detailsDone = Object.keys(validate(details)).length === 0

  // Which steps the meter will actually take you to. Details is always reachable; picking a time
  // needs the details; the confirmation is somewhere you arrive by booking, never somewhere you can
  // jump to — otherwise the meter would happily show "confirmed" for a booking that never happened.
  // And once there, nowhere else: stepping back to the time picker left CONFIRM live on a slot that
  // was already booked, so a second press booked it twice. A new booking starts from DONE.
  const canGo = (i: number) =>
    step === 2 ? i === 2 : i === 0 || (i === 1 && detailsDone)

  // Moves to a step, animating. Skips canGo on purpose — book() lands on the confirmation, which is
  // by definition not reachable by the meter. goTo() is the guarded public door.
  function animateTo(i: number) {
    if (i === step || moving.current) return
    // The time step is useless without a day selected, and the first weekday is the only sensible
    // default — so the jump lands on something rather than an empty grid.
    if (i === 1 && !date && days[0]) setDate(days[0])

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setStep(i)
      setHeadStep(i)
      setIncomingStep(null)
      return
    }

    moving.current = true
    setDir(i > step ? 'next' : 'prev')
    setIncomingStep(i)
    setPhase('exiting')
    setTimeout(() => {
      // Same tick: swap the content AND park it at the far edge with no transition, so the entrance
      // starts from off-side instead of snapping there.
      setStep(i)
      setPhase('entering')
      // Double rAF is what makes that park stick — one frame is not always enough for the browser
      // to have committed the untransitioned position before the next value lands on it.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setPhase('idle')
          setTimeout(() => {
            // Swap the mask's resting text and drop the outgoing layer in the same tick: the layer
            // being removed already holds this exact string at translateY(0), so nothing moves.
            setHeadStep(i)
            setIncomingStep(null)
            moving.current = false
          }, ENTER_MS)
        }),
      )
    }, EXIT_MS)
  }

  function goTo(i: number) {
    if (!canGo(i)) return
    animateTo(i)
  }

  // This component's `entering` is a zero-duration park (the body has one layer, so it has to jump
  // off-side before it can travel back). MaskText mounts two layers and needs no park, so its
  // `entering` means "animate in" — which is this component's `idle`. Hence the remap.
  const maskPhase: Phase = phase === 'idle' ? 'entering' : 'exiting'
  const eyebrowFor = (i: number) => `0${i + 1} — ${STEPS[i]}`

  // Off-centre resting positions for the two moving phases. Forward leaves left and arrives from the
  // right; back does the reverse.
  const slide: CSSProperties =
    phase === 'exiting'
      ? {
          transform: `translateX(${dir === 'next' ? -SHIFT : SHIFT}px)`,
          opacity: 0,
          transition: `transform ${EXIT_MS}ms ${EXIT_EASE}, opacity ${EXIT_MS}ms ${EXIT_EASE}`,
        }
      : phase === 'entering'
        ? {
            transform: `translateX(${dir === 'next' ? SHIFT : -SHIFT}px)`,
            opacity: 0,
            transition: 'none',
          }
        : {
            transform: 'translateX(0)',
            opacity: 1,
            transition: `transform ${ENTER_MS}ms ${ENTER_EASE}, opacity ${ENTER_MS}ms ${ENTER_EASE}`,
          }

  function submitDetails(e: React.FormEvent) {
    e.preventDefault()
    const found = validate(details)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    goTo(1)
  }

  async function book() {
    if (!slot) return
    setSubmitting(true)
    setFailed(null)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...details, start: slot, tz }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Could not book that slot.')
      setMeetUrl(data.meetUrl ?? null)
      setInvited(Boolean(data.invited))
      animateTo(2)
    } catch (err) {
      // Almost always "someone took the slot while you were deciding" — the server re-checks.
      setFailed(err instanceof Error ? err.message : 'Something went wrong.')
      // Almost certainly a 409, so the day's availability is stale — pull it again.
      setReload((n) => n + 1)
    } finally {
      setSubmitting(false)
    }
  }

  const time = (iso: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: AGENCY_TZ,
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))

  // EDT or EST, whichever actually applies on the day being shown — hardcoding "EDT" would be a lie
  // for half the year, and a booking UI that misnames its own zone is worse than one that omits it.
  // Split on the AGENCY's clock, not the reader's — on the visitor's getHours() someone far enough
  // east sees the entire day filed under one heading.
  const agencyHour = (iso: string) =>
    Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: AGENCY_TZ,
        hour12: false,
        hour: '2-digit',
      }).format(new Date(iso)),
    )
  // Back after a flat pass. The flat wrap was there to save height on a fixed-height card; with the
  // day strip on one row that budget came back, and the headings are worth the ~40px they now cost
  // (small labels, tight gaps) because "morning or afternoon" is the decision people actually make
  // before they pick a number.
  const groups: [string, Slot[]][] = [
    ['MORNING', slots?.filter((s) => agencyHour(s.start) < 12) ?? []],
    ['AFTERNOON', slots?.filter((s) => agencyHour(s.start) >= 12) ?? []],
  ]

  const tzLabel =
    new Intl.DateTimeFormat('en-US', { timeZone: AGENCY_TZ, timeZoneName: 'short' })
      .formatToParts(slot ? new Date(slot) : days[0] ? dayDate(days[0]) : new Date())
      .find((part) => part.type === 'timeZoneName')?.value ?? 'ET'


  return (
    <dialog
      ref={ref}
      id={BOOKING_DIALOG_ID}
      aria-labelledby="booking-heading"
      className="booking-dialog"
      // Click the backdrop to dismiss. The <dialog> itself is the full-viewport box and the card is
      // its child, so a click whose target IS the dialog landed outside the card.
      // …but only when the press STARTED there too. A drag that begins in a field (selecting the
      // email to fix a typo) and ends past the card's edge also clicks on the dialog.
      onPointerDown={(e) => {
        downOnBackdrop.current = e.target === ref.current
      }}
      onClick={(e) => {
        if (e.target === ref.current && downOnBackdrop.current) close()
      }}
    >
      {/* Height is FIXED, not content-driven: the three steps are different lengths, and letting
          the card resize under them makes the whole panel jump every time you advance. Sized to
          the tallest step (details, five fields); the form column scrolls inside it. The dvh caps
          keep it on screen on short viewports, where the fixed height would otherwise overflow. */}
      {ready && (
        <div className="relative flex h-[88svh] max-h-[88svh] w-full flex-col overflow-hidden border border-[#544D49] bg-[#fffcf9] md:h-[640px] md:max-h-[88dvh] md:max-w-[1120px] md:flex-row">
          {/* form column */}
          <div
            data-lenis-prevent
            className="order-2 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 md:order-1 md:px-12 md:pt-12 md:pb-10"
          >
            {/* progress: the same bracketed eyebrow as every section, doing real work. */}
            <div className="mb-5 flex items-center justify-between gap-3 md:mb-10 md:gap-4">
              {/* Not <BracketLabel>. That component's brackets wipe out from the centre on reveal,
                  which is a once-per-section entrance — replaying it on every step fought the mask,
                  and suppressing it left an animation component doing no animation. So the brackets
                  are literal characters held at the row's edges by justify-between (the same resting
                  geometry BracketLabel lands on), and only the label between them moves. */}
              <div
                aria-label={eyebrowFor(headStep)}
                className="flex w-auto shrink items-center justify-between font-mono text-[11px] uppercase leading-[1.4] tracking-[0.15em] text-[#867a72] md:w-56 md:text-[14px] md:tracking-[0.2em]"
              >
                <span aria-hidden>[</span>
                <div className="min-w-0 flex-1 px-2">
                  <MaskText
                    current={eyebrowFor(headStep)}
                    incoming={incomingStep === null ? null : eyebrowFor(incomingStep)}
                    phase={maskPhase}
                    direction={dir}
                    className="whitespace-nowrap text-center"
                    {...T_EYEBROW}
                  />
                </div>
                <span aria-hidden>]</span>
              </div>
              {/* The meter is also the navigation — the bars are 3px but each sits in a py-2 button,
                  so the tap target clears 24px without the rule getting heavier. */}
              <nav aria-label="Booking steps" className="flex shrink-0 items-center gap-1.5">
                {STEPS.map((label, i) => {
                  const allowed = canGo(i)
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => goTo(i)}
                      disabled={!allowed}
                      aria-current={i === step ? 'step' : undefined}
                      aria-label={`Step ${i + 1}: ${label}`}
                      className={`py-2 ${allowed ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <span
                        className={`block h-[3px] w-6 transition-colors duration-300 ${
                          i <= step ? 'bg-[#ff6d6a]' : allowed ? 'bg-[#544D49]/45' : 'bg-[#544D49]/20'
                        }`}
                      />
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Everything that changes per step moves as one block; the eyebrow and the meter above
                stay put, the way the carousel's arrows do. */}
            <div
              style={slide}
              className={`flex min-h-0 flex-1 flex-col ${
                // The confirmation is one short block on a fixed-height card; left-aligned at the top
                // it read as a page that had lost its content. Centring the heading and the body
                // together is why this sits on the wrapper rather than on the step.
                step === 2 ? 'items-center justify-center text-center' : ''
              }`}
            >
              {/* aria-live so a screen reader hears the step change; the heading is the live region's
                  content rather than a separate announcement, so there is nothing duplicated. */}
              <div aria-live="polite">
                <h2
                  id="booking-heading"
                  className={`font-display font-medium leading-[1.1] tracking-[-1px] text-[#262626] ${
                    step === 2 ? 'text-[32px] md:text-[56px]' : 'text-[32px] md:text-[44px]'
                  }`}
                >
                  {step === 0 && 'Let’s get you booked.'}
                  {step === 1 && 'Pick a time.'}
                  {step === 2 && (invited ? 'You’re booked!' : 'Request received!')}
                </h2>
              </div>

              {step === 0 && (
                <form onSubmit={submitDetails} noValidate className="mt-3 flex flex-1 flex-col md:mt-4">
                  <p className="font-sans text-lg leading-[1.25] text-[#4a4a4a] md:text-xl">
                    Five details, then a time that suits you. Takes about a minute.
                  </p>
                  <div className="mt-6 flex flex-col gap-5 md:mt-10 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-7">
                    {FIELDS.map((f) => (
                      <Field
                        key={f.key}
                        id={`booking-${f.key}`}
                        label={f.label}
                        type={f.type}
                        autoComplete={f.autoComplete}
                        className={f.wide ? 'md:col-span-2' : ''}
                        value={details[f.key]}
                        error={errors[f.key]}
                        // NEXT is disabled until every field passes, so the reason has to surface
                        // without a submit to trigger it — this is what makes the disabled state
                        // legible instead of just unresponsive.
                        onBlur={() => setErrors((e) => ({ ...e, [f.key]: validate(details)[f.key] }))}
                        onChange={(v) => {
                          setDetails((d) => ({ ...d, [f.key]: v }))
                          // Clear this field's error as soon as it is touched — leaving it up while
                          // someone is fixing it reads as the fix not working.
                          if (errors[f.key]) setErrors((e) => ({ ...e, [f.key]: undefined }))
                        }}
                      />
                    ))}
                  </div>
                  {/* secondary is Button's `outline` variant — the same keyline pill the header's MENU
                      toggle uses, so the dialog's actions are the site's actions. Pushed apart rather
                      than sat side by side: the two mean opposite things and a 12px gap invites the
                      wrong one. Primary on the right, where the flow is heading. */}
                  <div className="mt-auto flex items-center justify-between gap-4 pt-6 md:pt-8">
                    <Button variant="outline" onClick={close}>
                      CANCEL
                    </Button>
                    <Button variant="primary" type="submit" disabled={!detailsDone}>
                      NEXT
                    </Button>
                  </div>
                </form>
              )}

              {step === 1 && (
                <div className="mt-3 flex flex-1 flex-col md:mt-4">
                  <p className="font-sans text-lg leading-[1.25] text-[#4a4a4a] md:text-xl">
                    Thirty minutes on Google Meet. Times are on{' '}
                    <span className="text-[#262626]">{tzLabel}</span>.
                  </p>

                  {/* date strip — horizontal scroller on a phone, wraps at md */}
                  <div
                    data-lenis-prevent
                    className="-mx-5 mt-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:mt-8 md:flex-wrap md:snap-none md:overflow-visible md:px-0"
                  >
                    {days.map((value) => {
                      const on = value === date
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setDate(value)}
                          className={`flex shrink-0 snap-start cursor-pointer flex-col items-center border px-3 py-2 transition-colors ${
                            on
                              ? 'border-[#151414] bg-[#151414] text-[#fcf7f3]'
                              : 'border-[#544D49]/40 text-[#262626] hover:border-[#151414]'
                          }`}
                        >
                          <span className="font-fira text-[11px] uppercase tracking-[1px] opacity-70">
                            {dayPart(value, { weekday: 'short' })}
                          </span>
                          <span className="font-fira text-lg leading-none">
                            {dayPart(value, { day: 'numeric' })}
                          </span>
                          <span className="font-fira text-[11px] uppercase tracking-[1px] opacity-70">
                            {dayPart(value, { month: 'short' })}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* One grid cell, two layers: an invisible full day (DAY_SHAPE) and the real
                      content on top. The cell is as tall as the taller of the two, so a day with
                      three free slots holds the same height as an empty calendar and the buttons
                      below never jump when the date changes. */}
                  <div className="mt-8 grid" aria-live="polite">
                    <div aria-hidden className="invisible [grid-area:1/1]">
                      {DAY_SHAPE.map((count, gi) => (
                        <div key={gi} className="mb-4 last:mb-0">
                          <p className="font-fira text-[10px] uppercase tracking-[1px]">MORNING</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Array.from({ length: count }).map((_, i) => (
                              <span
                                key={i}
                                className="rounded-full border px-3 py-1.5 font-fira text-sm md:py-1"
                              >
                                10:30 AM
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="[grid-area:1/1]">
                      {/* Skeletons rather than a "loading…" line: they stand in the real chips' footprint,
                          so the grid does not pop into place under the cursor when the fetch lands. The
                          counts are the shape of a typical day, not the real answer — they are aria-hidden
                          and the live region below carries the actual status. */}
                      {slots === null && pending && (
                        <>
                          <p className="sr-only">Checking the calendar…</p>
                          <div aria-hidden>
                            {DAY_SHAPE.map((count, gi) => (
                              <div key={gi} className="mb-4 last:mb-0">
                                <p className="font-fira text-[10px] uppercase tracking-[1px] text-[#867a72]/50">
                                  {gi === 0 ? 'MORNING' : 'AFTERNOON'}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {Array.from({ length: count }).map((_, i) => (
                                    <span
                                      key={i}
                                      className="block h-[34px] w-[92px] animate-pulse rounded-full bg-[#544D49]/12 motion-reduce:animate-none md:h-[30px]"
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {slots?.length === 0 &&
                        (slotsError ? (
                          <p className="font-sans text-lg text-[#4a4a4a]">
                            Couldn&apos;t load the times.{' '}
                            <button
                              type="button"
                              onClick={() => setReload((n) => n + 1)}
                              className="cursor-pointer border-b border-[#151414] text-[#151414]"
                            >
                              Try again
                            </button>
                          </p>
                        ) : (
                          <p className="font-sans text-lg text-[#4a4a4a]">
                            Nothing free that day. Try another.
                          </p>
                        ))}
                      {/* Stale-while-revalidate: the previous day's chips stay put, dimmed and inert,
                          until the next day lands. The reserved height means a different count
                          does not move anything either. */}
                      <div
                        className={`transition-opacity duration-200 ${
                          pending && slots ? 'pointer-events-none opacity-40' : 'opacity-100'
                        }`}
                      >
                        {/* Headings are 10px on a 2px lead rather than the 11px/12px the rest of the
                            card uses — they are a divider, not a field label, and at full size they
                            competed with the chips they are meant to sort. */}
                        {groups.map(([title, group]) => {
                          if (group.length === 0) return null
                          return (
                            <div key={title} className="mb-4 last:mb-0">
                              <p className="font-fira text-[10px] uppercase tracking-[1px] text-[#867a72]">
                                {title}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {group.map((s) => {
                                  const on = s.start === slot
                                  return (
                                    <button
                                      key={s.start}
                                      type="button"
                                      aria-pressed={on}
                                      onClick={() => {
                                      setSlot(s.start)
                                      // the last error was about a different choice
                                      setFailed(null)
                                    }}
                                      className={`cursor-pointer rounded-full border px-3 py-1.5 font-fira text-sm transition-colors md:py-1 ${
                                        on
                                          ? 'border-[#ff6d6a] bg-[#ff6d6a] text-[#292624]'
                                          : 'border-[#544D49]/40 text-[#262626] hover:border-[#151414]'
                                      }`}
                                    >
                                      {time(s.start)}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {failed && (
                    <p role="alert" className="mb-4 font-sans text-lg text-[#151414]">
                      {failed}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-4 pt-6 md:pt-8">
                    <Button variant="outline" onClick={() => goTo(0)}>
                      BACK
                    </Button>
                    <Button variant="primary" onClick={book} disabled={!slot || submitting}>
                      {submitting ? 'BOOKING…' : 'CONFIRM'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                // No flex-1 here: the wrapper centres it, so this hugs its content instead of
                // stretching and pushing DONE back to the floor.
                <div className="mt-3 flex w-full flex-col items-center md:mt-4">
                  <p className="font-sans text-lg leading-[1.25] text-[#4a4a4a] md:text-xl">
                    {invited ? (
                      <>
                        Calendar invite is on its way to{' '}
                        <span className="text-[#262626]">{details.email}</span>. See you then.
                      </>
                    ) : (
                      <>
                        We have your details and{' '}
                        <span className="text-[#262626]">
                          {slot &&
                            `${new Intl.DateTimeFormat('en-US', {
                              timeZone: AGENCY_TZ,
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            }).format(new Date(slot))} at ${time(slot)} ${tzLabel}`}
                        </span>
                        . Someone will confirm by email shortly.
                      </>
                    )}
                  </p>
                  {meetUrl && (
                    <a
                      href={meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-8 inline-block border-b border-[#151414] font-fira text-base text-[#151414]"
                    >
                      Google Meet link
                    </a>
                  )}
                  <div className="mt-10">
                    <Button variant="primary" onClick={close}>
                      DONE
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recap rail. The login frame puts a photo here; this puts the booking so far, which is
              the thing a booking flow is actually anxious about. Pink ground so the card reads as a
              piece of the Contact section it opens over. Below md it becomes a slim header bar —
              a 40% colour field above a form on a phone is just lost screen. */}
          <aside className="relative order-1 flex shrink-0 items-center gap-4 overflow-hidden border-b border-[#544D49] bg-[#ff6d6a] px-5 py-3 sm:px-8 md:order-2 md:w-[38%] md:flex-col md:items-start md:justify-center md:border-b-0 md:border-l md:px-8 md:py-12">
            {/* /branding/hero.webp — the same out-of-focus photo the branding hero uses as its
                ground. multiply rather than a plain overlay: the pink stays the colour and the photo
                only contributes shape, so the rail gains depth without turning muddy.
                Blurred and over-scaled here (the scale hides the blur's soft edges), and served at
                rail width — at that size and blur there is nothing left to resolve, so it costs a
                fraction of the file. Nothing fetches until the dialog is first opened, so this is
                off the page's critical path entirely. */}
            <MediaImage
              media={texture(railTexture)}
              quality={40}
              sizes="430px"
              className="pointer-events-none absolute inset-0 z-0 size-full scale-125 object-cover opacity-25 blur-2xl mix-blend-multiply"
            />

            {/* blacklogo.png — the logo the route curtain used to carry (it shows the butterfly now), not the header's
                SVG. That curtain is the same #ff6d6a ground this rail is, so it is the version of
                the mark already drawn for this exact colour, and h-7 w-30 is the size both the
                curtain and the navbar use.
                Absolute at md+ so it stays a corner stamp and leaves the column to the recap. */}
            <Image
              src={railLogo}
              alt=""
              aria-hidden
              quality={100}
              sizes="120px"
              className="relative z-10 h-6 w-auto shrink-0 md:absolute md:left-8 md:top-12 md:h-7"
            />

            {/* Hidden below md. Three label/value pairs cannot share a phone's width with the
                wordmark, and every one of them is already on screen anyway — the fields hold the
                name and business while you type them, the chosen chip is highlighted, and the
                confirmation states the time in full. Echoing them was costing a row and telling the
                reader nothing. */}
            <dl className="relative z-10 hidden md:flex md:flex-col md:items-start md:gap-8 md:text-left">
              {recap.map(([k, v]) => (
                <div key={k} className={v ? '' : 'hidden md:block'}>
                  <dt className="font-fira text-[10px] uppercase tracking-[1px] text-[#151414]/55 md:text-[11px]">
                    {k}
                  </dt>
                  <dd className="font-sans leading-[1.15] text-[#151414] text-base md:mt-1.5 md:text-[28px]">
                    {v || <span className="opacity-30">—</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>

          {/* Close sits over the card's top-right. Last in the DOM so it does not intercept the tab
              order before the form; <dialog> already wires ESC, this is the pointer affordance. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-2.5 z-20 cursor-pointer rounded-full bg-[#151414] px-2.5 py-1 font-fira text-sm text-[#fcf7f3] transition-opacity hover:opacity-80 md:right-8 md:top-12"
          >
            CLOSE
          </button>
        </div>
      )}
    </dialog>
  )
}

// Underline-only field. The archived form frame (182:590) drew its inputs this way and it is the
// only input treatment in the file that belongs to the marketing side — boxed shadcn inputs would
// drag the login kit's whole language in with them. Label is a real <label>, above the control, not
// a placeholder: placeholder-as-label vanishes the moment someone types and is the single most
// common form accessibility failure.
function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  error,
  onChange,
  onBlur,
  className = '',
}: {
  id: string
  label: string
  type: string
  autoComplete: string
  className?: string
  value: string
  error?: string
  onChange: (v: string) => void
  onBlur: () => void
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-fira text-[11px] uppercase tracking-[1px] text-[#867a72]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1.5 w-full border-b bg-transparent pb-1.5 font-display text-xl text-[#262626] caret-[#ff6d6a] outline-none transition-colors placeholder:text-[#867a72]/60 focus:border-[#ff6d6a] ${
          error ? 'border-[#151414]' : 'border-[#544D49]/45'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 font-sans text-sm text-[#151414]">
          {error}
        </p>
      )}
    </div>
  )
}
