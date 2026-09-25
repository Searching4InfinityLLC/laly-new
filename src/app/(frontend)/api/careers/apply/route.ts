import config from '@payload-config'
import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { CAREERS_EMAIL, type ApplicationText, validateApplication } from '@/lib/careers'
import { getRole } from '@/lib/cms'

// Receives the careers ApplicationForm's multipart POST. Re-runs the client's validator — the
// browser's copy is a convenience, this is the trust boundary.
//
// Delivery: one email to CAREERS_EMAIL through Resend with every file attached and reply-to set to
// the applicant, so the agency answers straight from the inbox. Plain fetch, no SDK. No email to the
// applicant (client note).
//
// Record: every delivered application is also saved to the Applications collection (the admin's
// list + status), and an email that already applied for this role is turned away before anything
// is sent — on any device, which a browser-side "applied" flag couldn't promise. The lookup and the
// save are best-effort: a database hiccup must not cost someone their application, so it logs and
// carries on (the email is the delivery; the record is bookkeeping).
//
// Without RESEND_API_KEY: local dev logs the application and answers 200 so the UI can be exercised
// end to end; production answers 503, which the form shows with the careers inbox as the fallback —
// an application must never be "received" by a site that silently dropped it.
const FROM = process.env.RESEND_FROM || 'Laly Careers <careers@laly.agency>'

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Could not read the application.' }, { status: 400 })

  const str = (k: string) => {
    const v = form.get(k)
    return typeof v === 'string' ? v.trim() : ''
  }
  const text: ApplicationText = {
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    linkedin: str('linkedin'),
    portfolioUrl: str('portfolioUrl'),
  }
  const files = form.getAll('files').filter((v): v is File => v instanceof File && v.size > 0)

  const role = await getRole(str('role'))
  if (!role) return NextResponse.json({ error: 'That role is no longer open.' }, { status: 404 })

  const errors = validateApplication(text, files)
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 422 })
  }

  // Lowercased once here, so the lookup, the saved record and the unique index all agree.
  const email = text.email.toLowerCase()
  const payload = await getPayload({ config }).catch((err) => {
    console.error('[careers] payload unavailable — applying without the duplicate check:', err)
    return null
  })

  const previous = await payload
    ?.find({
      collection: 'applications',
      where: { roleSlug: { equals: role.slug }, email: { equals: email } },
      limit: 1,
      depth: 0,
    })
    .then((r) => r.docs[0])
    .catch((err) => {
      console.error('[careers] duplicate check failed:', err)
      return undefined
    })
  if (previous) {
    const on = new Date(previous.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return NextResponse.json(
      {
        error: `You already applied for ${role.title} on ${on}. Need to change something? Email ${CAREERS_EMAIL}.`,
      },
      { status: 409 },
    )
  }

  // After delivery, never before: a record for an application that never reached the inbox would
  // block its own resend. A failed save still answers 200 — the team has the email.
  const record = () =>
    payload?.create({
      collection: 'applications',
      data: {
        status: 'new',
        roleSlug: role.slug,
        roleTitle: role.title,
        name: text.name,
        email,
        phone: text.phone,
        linkedin: text.linkedin,
        portfolioUrl: text.portfolioUrl,
        files: files.map((f) => ({ name: f.name })),
      },
    }).catch((err) => console.error(`[careers] saving the application from ${email} failed:`, err))

  const key = process.env.RESEND_API_KEY
  if (key) {
    const rows: [string, string][] = [
      ['Role', role.title],
      ['Name', text.name],
      ['Email', text.email],
      ['Phone', text.phone],
      ['LinkedIn', text.linkedin || '—'],
      ['Portfolio link', text.portfolioUrl || '—'],
    ]
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: CAREERS_EMAIL,
        reply_to: text.email,
        subject: `Application: ${role.title} — ${text.name}`,
        html: `<table>${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`,
        attachments: await Promise.all(
          files.map(async (f) => ({ filename: f.name, content: Buffer.from(await f.arrayBuffer()).toString('base64') })),
        ),
      }),
    }).catch(() => null)
    if (res?.ok) {
      await record()
      return NextResponse.json({ ok: true })
    }
    console.error(`[careers] Resend failed for ${role.slug} from ${text.email}:`, res?.status, await res?.text().catch(() => ''))
    return NextResponse.json(
      { error: `We couldn’t send your application just now. Please email it to ${CAREERS_EMAIL}.` },
      { status: 502 },
    )
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(`[careers] application for ${role.slug} from ${text.email} not delivered — RESEND_API_KEY unset`)
    return NextResponse.json(
      { error: `Online applications aren’t switched on yet. Please email your application to ${CAREERS_EMAIL}.` },
      { status: 503 },
    )
  }

  console.log('[careers] application (dev — not emailed):', {
    role: role.title,
    ...text,
    files: files.map((f) => `${f.name} (${f.size} bytes)`),
  })
  // Saved in dev too, so the duplicate check can be tried locally. Local and Vercel share one
  // database, so test applications show up in the live admin — delete them there.
  await record()
  return NextResponse.json({ ok: true })
}
