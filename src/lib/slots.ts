// Availability, server side. Both booking routes read it: /api/booking/slots to draw the chips, and
// /api/booking to re-check that the chosen one is still free before it writes anything. Sharing one
// generator is the point — two copies of "business hours" drift, and the drift shows up as a booking
// confirmed against a slot the picker never offered.
//
// When Google is configured, open hours come from the SAME agency calendar as bookings: any event
// whose title starts with BOOKING_AVAILABLE_PREFIX (default `[Available]`) is a bookable window.
// Recurring weekly events cover the normal week; a one-off event covers a special day. Set those
// events to Show as: Free so freeBusy does not mark the whole window busy. Real meetings stay Busy
// and are subtracted. No `[Available]` events on a day → fall back to the env business-hours grid
// (BOOKING_OPEN_HOUR / CLOSE_HOUR), so an empty calendar still offers the old stub hours.
//
// With the Google env vars unset (src/lib/google.ts) only the env grid is offered.

import { freeBusy, googleConfigured, listEvents } from './google'
import type { CalEvent } from './google'

// Agency-local fallback hours when the calendar has no Available windows that day.
const TZ = process.env.BOOKING_TZ || 'America/New_York'
const OPEN_HOUR = Number(process.env.BOOKING_OPEN_HOUR ?? 9)
const CLOSE_HOUR = Number(process.env.BOOKING_CLOSE_HOUR ?? 17)
const LUNCH_HOUR = 12
export const SLOT_MINUTES = 30

// Title prefix for open-hours events on GOOGLE_CALENDAR_ID. Case-insensitive; trailing text is fine
// (`[Available] Mon–Fri`). Change only if the agency already uses a different convention.
const AVAILABLE_PREFIX = (process.env.BOOKING_AVAILABLE_PREFIX || '[Available]').trim().toLowerCase()

export type Slot = { start: string; end: string }

type Interval = { start: number; end: number }

// How far `tz` is from UTC at a given instant, in ms. Intl is the only thing in the platform that
// knows the IANA rules, so this reads the wall clock it would print and diffs it against the instant.
function offsetAt(at: Date, tz: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return asUTC - at.getTime()
}

// A wall-clock time in TZ -> the UTC instant it names.
// ponytail: single correction pass, so the hour that a DST jump deletes resolves to its neighbour
// rather than erroring. Business hours are 9–17 and no zone shifts inside that window, so it cannot
// bite here; iterate twice if slots ever move to 02:00.
function toUtc(date: string, hour: number, minute: number): Date {
  const naive = new Date(
    `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`,
  )
  return new Date(naive.getTime() - offsetAt(naive, TZ))
}

function nextDay(date: string): string {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function leadFloor(): number {
  // An hour of lead time. Offering a call that starts in four minutes is how you book a no-show.
  return Date.now() + 60 * 60_000
}

/** Drop slots that start too soon. Shared by the env grid and calendar windows. */
function afterLead(slots: Slot[]): Slot[] {
  const floor = leadFloor()
  return slots.filter((s) => new Date(s.start).getTime() > floor)
}

/**
 * Clip a Calendar event to [dayStart, dayEnd). Timed events use dateTime; all-day use date
 * (end.date exclusive, per Google). Returns null when the event does not overlap the day.
 */
function clipEvent(e: CalEvent, dayStart: number, dayEnd: number): Interval | null {
  let start: number
  let end: number
  if (e.start.dateTime && e.end.dateTime) {
    start = new Date(e.start.dateTime).getTime()
    end = new Date(e.end.dateTime).getTime()
  } else if (e.start.date && e.end.date) {
    // All-day dates are civil dates in the calendar — interpret midnight in the agency zone so a
    // "whole day Available" matches the day the picker asked for.
    start = toUtc(e.start.date, 0, 0).getTime()
    end = toUtc(e.end.date, 0, 0).getTime()
  } else {
    return null
  }
  const a = Math.max(start, dayStart)
  const z = Math.min(end, dayEnd)
  if (!(a < z)) return null
  return { start: a, end: z }
}

function isAvailableEvent(e: CalEvent): boolean {
  return (e.summary ?? '').trim().toLowerCase().startsWith(AVAILABLE_PREFIX)
}

/**
 * Half-hour slots on `date` that sit fully inside at least one window. Walks agency-local wall
 * clock so alignment matches the env grid (and the chips the dialog already expects).
 */
function slotsInsideWindows(date: string, windows: Interval[]): Slot[] {
  if (windows.length === 0) return []
  const all: Slot[] = []
  const step = SLOT_MINUTES * 60_000
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const start = toUtc(date, h, m)
      const a = start.getTime()
      const z = a + step
      if (windows.some((w) => a >= w.start && z <= w.end)) {
        all.push({ start: start.toISOString(), end: new Date(z).toISOString() })
      }
    }
  }
  return afterLead(all)
}

/** Env business-hours 30-minute slots on `date` (YYYY-MM-DD), as UTC ISO strings. */
export function gridFor(date: string): Slot[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return []

  const all: Slot[] = []
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    if (h === LUNCH_HOUR) continue
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const start = toUtc(date, h, m)
      all.push({
        start: start.toISOString(),
        end: new Date(start.getTime() + SLOT_MINUTES * 60_000).toISOString(),
      })
    }
  }
  return afterLead(all)
}

function subtractBusy(slots: Slot[], busy: Interval[]): Slot[] {
  // Half-open overlap: a meeting ending at 10:00 leaves the 10:00 slot free.
  return slots.filter((s) => {
    const a = new Date(s.start).getTime()
    const z = new Date(s.end).getTime()
    return !busy.some((b) => a < b.end && b.start < z)
  })
}

/**
 * Bookable slots on `date`. Throws if Google is configured but the calendar call fails.
 * Calendar Available windows win when present; otherwise the env grid. Busy meetings always peel off.
 */
export async function slotsFor(date: string): Promise<Slot[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
  if (!googleConfigured()) return gridFor(date)

  const dayStart = toUtc(date, 0, 0)
  const dayEnd = toUtc(nextDay(date), 0, 0)
  const dayStartIso = dayStart.toISOString()
  const dayEndIso = dayEnd.toISOString()

  const [events, busyRaw] = await Promise.all([
    listEvents(dayStartIso, dayEndIso),
    freeBusy(dayStartIso, dayEndIso),
  ])

  const windows: Interval[] = []
  for (const e of events) {
    if (e.status === 'cancelled') continue
    if (!isAvailableEvent(e)) continue
    const iv = clipEvent(e, dayStart.getTime(), dayEnd.getTime())
    if (iv) windows.push(iv)
  }

  // Available windows that day → carve chips from them. None → env grid (migration / stub hours).
  const grid = windows.length > 0 ? slotsInsideWindows(date, windows) : gridFor(date)
  if (grid.length === 0) return []

  const busy = busyRaw.map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }))
  return subtractBusy(grid, busy)
}

/** Whether a specific ISO instant is still bookable. The race guard on POST. */
export async function isFree(startIso: string): Promise<boolean> {
  const at = new Date(startIso)
  if (Number.isNaN(at.getTime())) return false
  // Derive the day in TZ rather than from the ISO string's UTC date — near midnight those differ,
  // and asking the wrong day would call every late slot free.
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(at)
  return (await slotsFor(day)).some((s) => s.start === startIso)
}
