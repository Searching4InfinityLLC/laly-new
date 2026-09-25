// Shared by the careers ApplicationForm (client) and /api/careers/apply (server), so the two can't
// disagree about what a valid application is. No imports — both sides load this.

// Where applications go, and the address the confirmation hands out for questions (client note).
export const CAREERS_EMAIL = 'grow@laly.agency'

// Combined, not per file. Vercel rejects a function request body over 4.5 MB before our code ever
// runs, and every file rides in one multipart POST — so the cap is on the sum, with headroom for
// the text fields and multipart framing. A portfolio too big for it goes in as a link instead (the
// form offers one). Lifting this means uploading straight to Blob from the browser; see the route.
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024

// Extensions rather than MIME types: browsers report .doc/.docx/.key inconsistently (often as an
// empty string), and the extension is what the recipient's mail client opens by anyway.
// One upload field for everything (resume, cover letter, work samples — review note: "combine file
// upload fields into one big one"), so it takes the union of what those used to accept.
export const FILE_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'key', 'png', 'jpg', 'jpeg', 'zip'] as const

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

export type ApplicationErrors = Partial<Record<keyof ApplicationText | 'files', string>>

// One validator for both sides. `files` is name + size only, so the client can run it on File
// objects and the server on the parsed multipart parts. Which file is which is the reader's call; the
// only rule is that at least one (the resume) is there.
export function validateApplication(
  t: ApplicationText,
  files: { name: string; size: number }[],
): ApplicationErrors {
  const errors: ApplicationErrors = {}
  if (!t.name.trim()) errors.name = 'Tell us your full name.'
  if (!isEmail(t.email)) errors.email = 'That email looks off.'
  if (!isPhone(t.phone)) errors.phone = 'Add a number we can reach you on.'
  if (t.linkedin.trim() && !isUrlish(t.linkedin)) errors.linkedin = 'That link looks off.'
  if (t.portfolioUrl.trim() && !isUrlish(t.portfolioUrl)) errors.portfolioUrl = 'That link looks off.'

  const bad = files.find((f) => !(FILE_EXT as readonly string[]).includes(extOf(f.name)))
  const total = files.reduce((sum, f) => sum + f.size, 0)
  if (files.length === 0) errors.files = 'Attach your resume.'
  else if (bad) errors.files = `${bad.name} isn’t a PDF, document, slide deck, image or ZIP.`
  else if (total > MAX_TOTAL_BYTES) {
    errors.files = `Your files add up to ${(total / 1024 / 1024).toFixed(1)} MB — the limit is 4 MB together. Share your portfolio as a link instead.`
  }
  return errors
}
