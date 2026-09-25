// Google Calendar, server side. Plain fetch against the REST API rather than `googleapis` — two
// endpoints and a token refresh do not justify a 100 MB dependency in a serverless bundle.
//
// Auth is a single stored refresh token for the agency's own calendar (mint it once with
// `bun run google:auth`). Not a service account: without Workspace domain-wide delegation a service
// account can neither invite attendees nor attach a Meet link, which is the whole job here.
//
// Everything reads process.env at call time, not import time, so a script can switch Google off
// (scripts/check-slots.ts does) and the stub path in slots.ts / the booking route takes over.

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://www.googleapis.com/calendar/v3'

export type Busy = { start: string; end: string }

/** All four vars present. Anything less and the booking flow stays on its stub. */
export function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GOOGLE_CALENDAR_ID,
  )
}

const calendarId = () => encodeURIComponent(process.env.GOOGLE_CALENDAR_ID ?? '')

// Access tokens last an hour. Cached per warm lambda so clicking along the date strip is not one
// token exchange per click; the minute of slack stops a token expiring between check and use.
let cached: { token: string; expires: number } | null = null

async function accessToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? '',
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  // invalid_grant here almost always means the refresh token died: consent screen still in
  // "Testing" (tokens expire after 7 days), the owner revoked access, or the secret was rotated.
  if (!res.ok) throw new Error(`google token: ${res.status} ${data.error ?? ''} ${data.error_description ?? ''}`)
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 }
  return cached.token
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${await accessToken()}`,
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`google ${path}: ${res.status} ${data.error?.message ?? data.error ?? ''}`)
  return data as T
}

/** Busy intervals on the agency calendar between two instants. */
export async function freeBusy(timeMin: string, timeMax: string): Promise<Busy[]> {
  const id = process.env.GOOGLE_CALENDAR_ID ?? ''
  const data = await call<{
    calendars: Record<string, { busy?: Busy[]; errors?: { reason: string }[] }>
  }>('POST', '/freeBusy', { timeMin, timeMax, items: [{ id }] })
  const cal = data.calendars[id]
  // A calendar the token cannot see comes back 200 with an `errors` entry and no busy list. Reading
  // that as "no busy" would offer every slot on a calendar nobody is checking, so it throws instead.
  if (!cal || cal.errors?.length) {
    throw new Error(`google freeBusy: ${cal?.errors?.map((e) => e.reason).join(', ') ?? 'calendar missing'}`)
  }
  return cal.busy ?? []
}

export type CalEvent = {
  summary?: string
  status?: string
  // "transparent" = Show as Free in Calendar. Availability windows must be Free so freeBusy
  // does not treat them as booked; other meetings stay opaque (Busy).
  transparency?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

/**
 * Events on the agency calendar in [timeMin, timeMax), expanded to instances.
 * Used to find `[Available]` windows on the same calendar as bookings.
 */
export async function listEvents(timeMin: string, timeMax: string): Promise<CalEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })
  const data = await call<{ items?: CalEvent[] }>(
    'GET',
    `/calendars/${calendarId()}/events?${params}`,
  )
  return data.items ?? []
}

type NewEvent = {
  summary: string
  description: string
  start: string
  end: string
  attendee: { email: string; displayName: string }
}

/**
 * Creates the event with a Meet link and emails the invite to the attendee
 * (sendUpdates=all). Returns the Meet URL, or null if Google did not attach one.
 */
export async function insertEvent(e: NewEvent): Promise<{ meetUrl: string | null }> {
  const data = await call<{
    hangoutLink?: string
    conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] }
  }>('POST', `/calendars/${calendarId()}/events?conferenceDataVersion=1&sendUpdates=all`, {
    summary: e.summary,
    description: e.description,
    start: { dateTime: e.start },
    end: { dateTime: e.end },
    attendees: [e.attendee],
    conferenceData: {
      createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } },
    },
  })
  const meetUrl =
    data.hangoutLink ??
    data.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')?.uri ??
    null
  return { meetUrl }
}
