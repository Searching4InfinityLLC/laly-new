import { NextResponse } from 'next/server'
import { googleConfigured, insertEvent } from '@/lib/google'
import { SLOT_MINUTES, isFree } from '@/lib/slots'

// Books a slot. The client validates too, but that is a courtesy to the typist — this is the trust
// boundary, so nothing below trusts a single field that arrived in the body.
export const dynamic = 'force-dynamic'

const MAX = 200 // any single field longer than this is not a name, it is a payload

type Body = Record<string, unknown>

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

export async function POST(request: Request) {
  const body: Body = await request.json().catch(() => ({}))

  const firstName = str(body.firstName)
  const lastName = str(body.lastName)
  const email = str(body.email)
  const zip = str(body.zip)
  const business = str(body.business)
  const start = str(body.start)
  const tz = str(body.tz)

  const bad =
    !firstName ||
    !lastName ||
    !business ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
    !/^\d{5}(-\d{4})?$/.test(zip) ||
    [firstName, lastName, email, zip, business, tz].some((v) => v.length > MAX)

  if (bad) {
    return NextResponse.json({ error: 'Some of those details did not look right.' }, { status: 400 })
  }

  // The race: two people sit on the same chip, both press confirm. Availability is re-derived here
  // rather than trusted from the picker, so the second one is turned away instead of double-booking.
  // ponytail: check-then-insert, not atomic — two confirms inside the same ~second can both pass.
  // At this booking volume that is a manual reschedule, not worth a lock.
  let free: boolean
  try {
    free = await isFree(start)
  } catch (err) {
    console.error('[booking] availability check failed:', err)
    return NextResponse.json({ error: 'Could not reach the calendar. Try again shortly.' }, { status: 503 })
  }
  if (!free) {
    return NextResponse.json(
      { error: 'That time was taken while you were deciding. Pick another.' },
      { status: 409 },
    )
  }

  // ponytail: the lead is not persisted anywhere but the calendar event — a Payload `bookings`
  // collection is still to come (needs `bun run generate:types`, which this machine cannot run).
  if (!googleConfigured()) {
    // Stub path: Google env vars unset. Logged, no invite sent, so this must not claim one was.
    console.info('[booking] stub — Google Calendar not configured:', {
      firstName,
      lastName,
      email,
      zip,
      business,
      start,
      tz,
    })
    // `invited` is load-bearing, not decoration: the success screen words itself off it.
    return NextResponse.json({ ok: true, meetUrl: null, invited: false })
  }

  const name = `${firstName} ${lastName}`
  try {
    const { meetUrl } = await insertEvent({
      summary: `Laly intro call — ${business}`,
      description: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Business: ${business}`,
        `ZIP: ${zip}`,
        tz && `Their timezone: ${tz}`,
        '',
        'Booked through the website.',
      ]
        .filter((l) => l !== '')
        .join('\n'),
      start,
      end: new Date(new Date(start).getTime() + SLOT_MINUTES * 60_000).toISOString(),
      attendee: { email, displayName: name },
    })
    return NextResponse.json({ ok: true, meetUrl, invited: true })
  } catch (err) {
    console.error('[booking] events.insert failed:', err)
    return NextResponse.json(
      { error: 'Could not book that slot right now. Try again shortly.' },
      { status: 502 },
    )
  }
}
