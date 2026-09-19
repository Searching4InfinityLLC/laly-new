// Self-check for the booking availability engine. Not a test framework — plain asserts, run it and
// it either says ok or throws:
//   bun scripts/check-slots.ts
// Covers the parts that are easy to get quietly wrong: slot spacing, the lunch gap and the business
// hours landing in the AGENCY's zone rather than the server's, the lead-time floor, and isFree()
// agreeing with the list the picker was drawn from (they are the two halves of the race guard).
import assert from 'node:assert/strict'
import { SLOT_MINUTES, gridFor, isFree, slotsFor } from '../src/lib/slots'

// Checks the engine, not Google — bun loads .env, and with real credentials slotsFor() would ask a
// live calendar whose busy list changes under the asserts. Dropping one var puts it on the stub.
// (google.ts reads env at call time, so this still wins over the hoisted import.)
delete process.env.GOOGLE_REFRESH_TOKEN

const TZ = process.env.BOOKING_TZ || 'America/New_York'
const hourIn = (iso: string) =>
  Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour12: false, hour: '2-digit' }).format(new Date(iso)))

// A weekday far enough out that the lead-time floor cannot eat the morning.
const d = new Date()
d.setDate(d.getDate() + 7)
const day = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)

const slots = await slotsFor(day)
assert.ok(slots.length > 0, 'a normal weekday should have free slots')

for (const s of slots) {
  const h = hourIn(s.start)
  assert.ok(h >= 9 && h < 17, `slot at ${h}:00 agency-local is outside business hours`)
  assert.notEqual(h, 12, 'lunch hour should never be offered')
  assert.equal(
    new Date(s.end).getTime() - new Date(s.start).getTime(),
    SLOT_MINUTES * 60_000,
    'slot length must match SLOT_MINUTES',
  )
  assert.ok(new Date(s.start).getTime() > Date.now() + 59 * 60_000, 'slot violates the lead-time floor')
}

// Stable across calls — the picker must not reshuffle under a reload.
assert.deepEqual(await slotsFor(day), slots, 'availability should be deterministic per day')
assert.deepEqual(gridFor(day), slots, 'with Google off, availability is exactly the grid')

// The race guard: every offered slot verifies, and nothing else does.
assert.ok(await isFree(slots[0].start), 'an offered slot must pass isFree')
assert.ok(!(await isFree('not-a-date')), 'garbage must not pass isFree')
assert.ok(!(await isFree(new Date('2020-01-06T14:00:00Z').toISOString())), 'a past slot must not pass isFree')
// 13 minutes past the half hour can never be a slot start.
assert.ok(!(await isFree(new Date(new Date(slots[0].start).getTime() + 13 * 60_000).toISOString())), 'off-grid instant must not pass isFree')

// Past days and malformed input return nothing rather than throwing.
assert.deepEqual(await slotsFor('2020-01-06'), [], 'a past day should be empty')
assert.deepEqual(await slotsFor('nonsense'), [], 'a malformed date should be empty')

console.log(`ok — ${slots.length} slots on ${day} (${TZ}), all checks passed`)
