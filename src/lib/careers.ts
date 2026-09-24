// Shared by the careers ApplicationForm (client) and /api/careers/apply (server), so the two can't
// disagree about what a valid application is. No imports — both sides load this.

// Where applications go, and the address the confirmation hands out for questions (client note).
export const CAREERS_EMAIL = 'grow@laly.agency'

// Combined, not per file. Vercel rejects a function request body over 4.5 MB before our code ever
// runs, and all three files ride in one multipart POST — so the cap is on the sum, with headroom for
// the text fields and multipart framing. A portfolio too big for it goes in as a link instead (the
// form offers one). Lifting this means uploading straight to Blob from the browser; see the route.
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024

// Extensions rather than MIME types: browsers report .doc/.docx/.key inconsistently (often as an
// empty string), and the extension is what the recipient's mail client opens by anyway.
export const DOC_EXT = ['pdf', 'doc', 'docx'] as const
export const PORTFOLIO_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'key', 'png', 'jpg', 'jpeg', 'zip'] as const

export const FILE_FIELDS = [
  { key: 'resume', label: 'Resume', ext: DOC_EXT, hint: 'PDF, DOC or DOCX' },
  { key: 'coverLetter', label: 'Cover letter', ext: DOC_EXT, hint: 'PDF, DOC or DOCX' },
  {
    key: 'portfolio',
    label: 'Portfolio / work sample',
    ext: PORTFOLIO_EXT,
    hint: 'PDF, slides, images or ZIP — or paste a link below',
  },
] as const

export type FileKey = (typeof FILE_FIELDS)[number]['key']

export type ApplicationText = {
  name: string
  email: string
  phone: string
  linkedin: string
  portfolioUrl: string
}

export const extOf = (filename: string) => filename.split('.').pop()?.toLowerCase() ?? ''

// Loose on purpose, same as the booking form: it rejects what is obviously wrong and nothing else.
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
// At least 7 digits in whatever format people type phone numbers in.
export const isPhone = (v: string) => (v.match(/\d/g)?.length ?? 0) >= 7
// Bare domains ("linkedin.com/in/x") are fine — that is how most people copy them.
export const isUrlish = (v: string) => /^(https?:\/\/)?[^\s/$.?#]+\.[^\s]+$/i.test(v.trim())

export type ApplicationErrors = Partial<Record<keyof ApplicationText | FileKey | 'files', string>>

// One validator for both sides. `files` is name + size only, so the client can run it on File
// objects and the server on the parsed multipart parts.
export function validateApplication(
  t: ApplicationText,
  files: Partial<Record<FileKey, { name: string; size: number } | null>>,
): ApplicationErrors {
  const errors: ApplicationErrors = {}
  if (!t.name.trim()) errors.name = 'Tell us your full name.'
  if (!isEmail(t.email)) errors.email = 'That email looks off.'
  if (!isPhone(t.phone)) errors.phone = 'Add a number we can reach you on.'
  if (t.linkedin.trim() && !isUrlish(t.linkedin)) errors.linkedin = 'That link looks off.'
  if (t.portfolioUrl.trim() && !isUrlish(t.portfolioUrl)) errors.portfolioUrl = 'That link looks off.'

  for (const f of FILE_FIELDS) {
    const file = files[f.key]
    if (!file) {
      // the portfolio is satisfied by a link instead of a file
      if (f.key === 'portfolio' && t.portfolioUrl.trim()) continue
      errors[f.key] =
        f.key === 'portfolio' ? 'Attach a work sample or paste a link to one.' : `Attach your ${f.label.toLowerCase()}.`
      continue
    }
    if (!(f.ext as readonly string[]).includes(extOf(file.name))) errors[f.key] = `${f.hint.split(' —')[0]} only.`
  }

  const total = FILE_FIELDS.reduce((sum, f) => sum + (files[f.key]?.size ?? 0), 0)
  if (total > MAX_TOTAL_BYTES) {
    errors.files = `Your files add up to ${(total / 1024 / 1024).toFixed(1)} MB — the limit is 4 MB together. Share your portfolio as a link instead.`
  }
  return errors
}
