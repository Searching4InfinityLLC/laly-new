import { NextResponse } from 'next/server'
import { slotsFor } from '@/lib/slots'

// Availability for one day. Public and read-only — it leaks nothing an attacker could not learn by
// opening the booking dialog, so there is no secret here to check.
export const dynamic = 'force-dynamic' // slots expire; a cached response would offer dead times

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get('date') ?? ''
  try {
    return NextResponse.json({ slots: await slotsFor(date) })
  } catch (err) {
    // Google down or the token dead. Offering the bare grid here would take bookings against a
    // calendar nobody checked, so fail — the dialog shows "nothing free" and the reader tries later.
    console.error('[booking] availability failed:', err)
    return NextResponse.json({ error: 'Could not reach the calendar.' }, { status: 503 })
  }
}
