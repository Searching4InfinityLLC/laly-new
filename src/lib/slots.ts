// Availability, server side. Both booking routes read it: /api/booking/slots to draw the chips, and
// /api/booking to re-check that the chosen one is still free before it writes anything. Sharing one
// generator is the point — two copies of "business hours" drift, and the drift shows up as a booking
// confirmed against a slot the picker never offered.
//
// Two layers: gridFor() is the business-hours grid (pure, sync), slotsFor() subtracts whatever the
// agency calendar says is busy. With the Google env vars unset (src/lib/google.ts) nothing is
// subtracted and every grid slot is offered — the stub the site shipped with.

import { freeBusy, googleConfigured } from './google'

// Agency-local business hours. Env so staging can widen them without a deploy.
const TZ = process.env.BOOKING_TZ || 'America/New_York'
const OPEN_HOUR = Number(process.env.BOOKING_OPEN_HOUR ?? 9)
const CLOSE_HOUR = Number(process.env.BOOKING_CLOSE_HOUR ?? 17)
const LUNCH_HOUR = 12
export const SLOT_MINUTES = 30

export type Slot = { start: string; end: string }

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

// Every day draws the same grid; only Google's busy list makes the counts differ. The chip area in
// BookingDialog.tsx reserves a full day's height for that reason — a day with fewer chips must not
// make the block shrink and the picker jump under the cursor.

/** Business-hours 30-minute slots on `date` (YYYY-MM-DD), as UTC ISO strings. Past slots are dropped. */
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

  // An hour of lead time. Offering a call that starts in four minutes is how you book a no-show.
  // The picker only offers days from tomorrow on, so this trims nothing today — it is the guard for
  // a hand-crafted request hitting the API directly, which is exactly where isFree() is called from.
  const floor = Date.now() + 60 * 60_000
  return all.filter((s) => new Date(s.start).getTime() > floor)
}

/** Grid slots on `date` that the agency calendar has free. Throws if Google is configured but fails. */
export async function slotsFor(date: string): Promise<Slot[]> {
  const grid = gridFor(date)
  if (grid.length === 0 || !googleConfigured()) return grid
  // One query for the whole day rather than one per slot.
  const busy = (await freeBusy(grid[0].start, grid[grid.length - 1].end)).map((b) => [
    new Date(b.start).getTime(),
    new Date(b.end).getTime(),
  ])
  // Half-open overlap: a meeting ending at 10:00 leaves the 10:00 slot free.
  return grid.filter((s) => {
    const a = new Date(s.start).getTime()
    const z = new Date(s.end).getTime()
    return !busy.some(([b0, b1]) => a < b1 && b0 < z)
  })
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
