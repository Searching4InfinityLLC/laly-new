import { type NextRequest, NextResponse } from 'next/server'
import {
  CAREERS_EMAIL,
  FILE_FIELDS,
  type ApplicationText,
  type FileKey,
  validateApplication,
} from '@/lib/careers'
import { getRole } from '@/lib/cms'

// Receives the careers ApplicationForm's multipart POST. Re-runs the client's validator — the
// browser's copy is a convenience, this is the trust boundary.
//
// DELIVERY IS NOT WIRED YET (UI first, action later). The plan: send one email to CAREERS_EMAIL
// through Resend with the three files attached, so the agency opens the application straight from
// the inbox. Resend takes attachments as base64 in the JSON body — no SDK needed:
//
//   await fetch('https://api.resend.com/emails', {
//     method: 'POST',
//     headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
//     body: JSON.stringify({ from, to: CAREERS_EMAIL, reply_to: text.email, subject, html,
//       attachments: [{ filename: file.name, content: Buffer.from(await file.arrayBuffer()).toString('base64') }] }),
//   })
//
// No email to the applicant (client note).
//
// Until then: local dev logs the application and answers 200 so the UI can be exercised end to end;
// production answers 503, which the dialog shows with the careers inbox as the fallback — an
// application must never be "received" by a site that silently dropped it.
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
  const files = Object.fromEntries(
    FILE_FIELDS.map((f) => {
      const v = form.get(f.key)
      return [f.key, v instanceof File && v.size > 0 ? v : null]
    }),
  ) as Record<FileKey, File | null>

  const role = await getRole(str('role'))
  if (!role) return NextResponse.json({ error: 'That role is no longer open.' }, { status: 404 })

  const errors = validateApplication(text, files)
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 422 })
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(`[careers] application for ${role.slug} from ${text.email} not delivered — email not wired`)
    return NextResponse.json(
      { error: `Online applications aren’t switched on yet. Please email your application to ${CAREERS_EMAIL}.` },
      { status: 503 },
    )
  }

  console.log('[careers] application (dev — not emailed):', {
    role: role.title,
    ...text,
    files: Object.fromEntries(
      Object.entries(files).map(([k, f]) => [k, f ? `${f.name} (${f.size} bytes)` : null]),
    ),
  })
  return NextResponse.json({ ok: true })
}
