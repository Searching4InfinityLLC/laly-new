// One-time: mints GOOGLE_REFRESH_TOKEN for the booking dialog (src/lib/google.ts).
//   bun run google:auth
// Needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env, and REDIRECT below added to that OAuth
// client's "Authorized redirect URIs" in Google Cloud. Open the printed URL, sign in AS THE ACCOUNT
// WHOSE CALENDAR TAKES THE BOOKINGS (invites go out from it), approve, and the token prints here.
//
// Re-run whenever the token dies (invalid_grant in the booking logs). If it dies after exactly a
// week, the consent screen is still in "Testing" — publish it to Production.
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'

// bun loads .env on its own; under plain node this does.
try {
  process.loadEnvFile?.()
} catch {}

const PORT = 8787
const REDIRECT = `http://localhost:${PORT}/oauth/callback`
// Narrowest pair that covers it: freebusy for the slot picker, events for the invite.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events',
]

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env first.')
  process.exit(1)
}

const state = randomBytes(16).toString('hex')
const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: clientId,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: SCOPES.join(' '),
  // offline -> a refresh token; consent -> issued again even if this account approved before
  // (Google only hands one out on the first consent otherwise).
  access_type: 'offline',
  prompt: 'consent',
  state,
})}`

const server = createServer(async (req, res) => {
  const q = new URL(req.url ?? '/', REDIRECT).searchParams
  if (!req.url?.startsWith('/oauth/callback')) return res.writeHead(404).end()

  const fail = (msg: string) => {
    res.writeHead(400, { 'content-type': 'text/plain' }).end(msg)
    console.error(msg)
    server.close()
    process.exitCode = 1
  }
  if (q.get('state') !== state) return fail('State mismatch — start again.')
  if (q.get('error')) return fail(`Google said: ${q.get('error')}`)

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: q.get('code') ?? '',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT,
      grant_type: 'authorization_code',
    }),
  })
  const data = await r.json()
  if (!r.ok || !data.refresh_token) return fail(`Token exchange failed: ${JSON.stringify(data)}`)

  res.writeHead(200, { 'content-type': 'text/plain' }).end('Done. Back to the terminal.')
  console.log('\nAdd to .env (and Vercel):\n')
  console.log(`GOOGLE_REFRESH_TOKEN=${data.refresh_token}`)
  console.log('GOOGLE_CALENDAR_ID=primary   # or the calendar owner\'s email\n')
  server.close()
})

server.listen(PORT, () => {
  console.log(`Redirect URI (must be on the OAuth client): ${REDIRECT}\n`)
  console.log(`Open this, signed in as the calendar owner:\n\n${url}\n`)
})
