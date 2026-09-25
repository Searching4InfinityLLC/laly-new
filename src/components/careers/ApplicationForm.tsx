'use client'

import { useRef, useState, type DragEvent } from 'react'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { Button } from '@/components/ui/Button'
import {
  CAREERS_EMAIL,
  FILE_EXT,
  type ApplicationErrors,
  type ApplicationText,
  validateApplication,
} from '@/lib/careers'
import { getLenis } from '@/lib/lenis'
import type { Role } from '@/lib/types'

// The application form on /careers/<slug>, inline under the job description (id="apply") — both
// APPLY buttons on the page scroll here. A plain single-column form (client note: "a standard form,
// start fresh"): boxed fields with their labels above, one drop zone for every document, one submit.
// Nothing beside it — the description above already says what the role is.
//
// It is the last section of the page (no Contact band below). The copy around the fields reads the
// theme vars; the fields stay cream boxes.
//
// No confirmation email goes to the applicant (client note); the confirmation that replaces the form
// is the receipt, and it hands out the careers inbox for questions instead.

const EMPTY: ApplicationText = { name: '', email: '', phone: '', linkedin: '', portfolioUrl: '' }

type TextKey = keyof ApplicationText

const TEXT_FIELDS: {
  key: Exclude<TextKey, 'portfolioUrl'>
  label: string
  type: string
  autoComplete: string
  required: boolean
  placeholder?: string
}[] = [
  { key: 'name', label: 'Full name', type: 'text', autoComplete: 'name', required: true },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
  { key: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', required: true },
  {
    key: 'linkedin',
    label: 'LinkedIn profile',
    type: 'url',
    autoComplete: 'url',
    required: false,
    placeholder: 'linkedin.com/in/yourname',
  },
]

const mb = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

// Shared by every control so the text fields and the file rows are one family.
const BOX =
  'w-full border bg-[#FFFCF9] px-4 py-3 font-display text-lg text-[#262626] outline-none transition-colors placeholder:text-[#867a72]/60 focus:border-[#ff6d6a]'
const boxBorder = (error?: string) => (error ? 'border-[#151414]' : 'border-[#544D49]/35 hover:border-[#544D49]/70')

function Label({ htmlFor, id, children, required }: { htmlFor?: string; id?: string; children: string; required: boolean }) {
  return (
    <label htmlFor={htmlFor} id={id} className="theme-ink block font-fira text-xs uppercase tracking-[1px] text-[var(--section-body,#4a4a4a)]">
      {children}
      {required ? (
        <span aria-hidden className="text-[#ff6d6a]"> *</span>
      ) : (
        <span className="normal-case tracking-normal text-[var(--section-muted,#867a72)]"> (optional)</span>
      )}
    </label>
  )
}

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <p id={id} className="theme-ink mt-1.5 font-sans text-sm text-[var(--section-heading,#151414)]">
      {children}
    </p>
  )
}

export function ApplicationForm({ role }: { role: Pick<Role, 'slug' | 'title'> }) {
  const ref = useRef<HTMLElement>(null)
  const [text, setText] = useState<ApplicationText>(EMPTY)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<ApplicationErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const setValue = (key: TextKey, v: string) => {
    setText((t) => ({ ...t, [key]: v }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  // Re-check a field on blur, but only one with something in it — tabbing past an empty field on the
  // way down shouldn't shout.
  const recheck = (key: TextKey) => {
    if (!text[key].trim()) return
    setErrors((e) => ({ ...e, [key]: validateApplication(text, files)[key] }))
  }

  const changeFiles = (next: File[]) => {
    setFiles(next)
    setErrors((e) => ({ ...e, files: undefined }))
  }

  // The confirmation is far shorter than the form, so bring the section's top back into view. Lenis
  // owns scrollTop when it is running; the section's scroll-mt-19 clears the fixed navbar either way.
  const toTop = () => {
    const el = ref.current
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el)
    else el.scrollIntoView({ block: 'start' })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateApplication(text, files)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // take the reader to the first problem rather than leaving them to hunt for it
      requestAnimationFrame(() =>
        ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
      return
    }

    setSubmitting(true)
    setFailed(null)
    try {
      const body = new FormData()
      body.set('role', role.slug)
      for (const [k, v] of Object.entries(text)) body.set(k, v.trim())
      for (const f of files) body.append('files', f)
      const res = await fetch('/api/careers/apply', { method: 'POST', body })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Something went wrong sending your application.')
      setDone(true)
      toTop()
    } catch (err) {
      setFailed(err instanceof Error ? err.message : 'Something went wrong sending your application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      ref={ref}
      id="apply"
      aria-labelledby="application-heading"
      // scroll-mt clears the fixed 76px navbar for a plain (no-Lenis) anchor jump
      className="relative w-full scroll-mt-19 bg-[#FCF7F3] px-5 py-16 sm:px-10 md:py-28"
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-10 md:gap-12">
        <div className="flex flex-col gap-5 text-center md:gap-6">
          <BracketLabel className="theme-label mx-auto w-44 text-[var(--section-label,#867A72)] md:w-80">
            {done ? 'Sent' : 'Apply'}
          </BracketLabel>
          <h2
            id="application-heading"
            aria-live="polite"
            className="theme-ink font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] text-[var(--section-heading,#262626)] md:text-[64px]"
          >
            {done ? 'Application received!' : `Apply for ${role.title}`}
          </h2>
          {!done && (
            <p className="theme-ink font-sans text-lg leading-[1.3] text-[var(--section-body,#4A4A4A)] md:text-xl">
              A few details and your documents. Takes about two minutes.
            </p>
          )}
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <p className="theme-ink font-sans text-lg leading-[1.35] text-[var(--section-body,#4a4a4a)] md:text-xl">
              Thanks for applying to <span className="text-[var(--section-heading,#262626)]">{role.title}</span> at Laly Agency.
              We review every application personally and will follow up if it’s a fit.
            </p>
            <p className="theme-ink font-sans text-lg leading-[1.35] text-[var(--section-body,#4a4a4a)] md:text-xl">
              If you have any questions, please don’t hesitate to reach out to us at{' '}
              <a
                href={`mailto:${CAREERS_EMAIL}`}
                className="border-b border-current text-[var(--section-heading,#151414)] transition-opacity hover:opacity-60"
              >
                {CAREERS_EMAIL}
              </a>
              .
            </p>
            <div className="mt-4">
              <Button variant="outline" href="/careers#roles">
                SEE OTHER ROLES
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            {TEXT_FIELDS.map((f) => {
              const id = `application-${f.key}`
              const error = errors[f.key]
              return (
                <div key={f.key}>
                  <Label htmlFor={id} required={f.required}>
                    {f.label}
                  </Label>
                  <input
                    id={id}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    value={text[f.key]}
                    aria-required={f.required || undefined}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    onBlur={() => recheck(f.key)}
                    className={`mt-2 ${BOX} ${boxBorder(error)}`}
                  />
                  <ErrorText id={`${id}-error`}>{error}</ErrorText>
                </div>
              )
            })}

            <FileDrop files={files} error={errors.files} onChange={changeFiles} />

            {/* The portfolio's other door: most strategists' work lives on a site or a deck link,
                and a big PDF would not fit the upload cap anyway. */}
            <div>
              <Label htmlFor="application-portfolioUrl" required={false}>
                Portfolio link
              </Label>
              <input
                id="application-portfolioUrl"
                type="url"
                autoComplete="url"
                placeholder="yoursite.com or a Drive / Behance link"
                value={text.portfolioUrl}
                aria-invalid={errors.portfolioUrl ? true : undefined}
                aria-describedby={errors.portfolioUrl ? 'application-portfolioUrl-error' : undefined}
                onChange={(e) => setValue('portfolioUrl', e.target.value)}
                onBlur={() => recheck('portfolioUrl')}
                className={`mt-2 ${BOX} ${boxBorder(errors.portfolioUrl)}`}
              />
              <ErrorText id="application-portfolioUrl-error">{errors.portfolioUrl}</ErrorText>
            </div>

            {failed && (
              <p role="alert" className="theme-ink font-sans text-lg text-[var(--section-heading,#151414)]">
                {failed}
                {failed && !failed.includes(CAREERS_EMAIL) && (
                  <>
                    {' '}
                    You can also email it to{' '}
                    <a href={`mailto:${CAREERS_EMAIL}`} className="border-b border-current">
                      {CAREERS_EMAIL}
                    </a>
                    .
                  </>
                )}
              </p>
            )}

            <Button
              variant="primary"
              type="submit"
              disabled={submitting}
              className="mt-2 w-full py-3 [&>span]:text-lg"
            >
              {submitting ? 'SENDING…' : 'SUBMIT APPLICATION'}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}

// Every document in one big drop zone (resume, cover letter, work samples). The real multi-file
// <input> is visually hidden but focusable, and the whole zone is its <label>, so click, keyboard and
// drag-and-drop all land on the one control. Picks add to the list rather than replace it, so files
// from two folders can go in; each chosen file gets its own remove button underneath.
function FileDrop({ files, error, onChange }: { files: File[]; error?: string; onChange: (files: File[]) => void }) {
  const [over, setOver] = useState(false)
  const id = 'application-files'

  // same name and size = the same file picked twice
  const add = (picked: FileList | null) => {
    if (!picked?.length) return
    const fresh = Array.from(picked).filter((p) => !files.some((f) => f.name === p.name && f.size === p.size))
    onChange([...files, ...fresh])
  }

  return (
    <div>
      <Label id={`${id}-label`} required>
        Resume, cover letter &amp; work samples
      </Label>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault()
          setOver(false)
          add(e.dataTransfer.files)
        }}
        className={`mt-2 flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 border-dashed text-center has-[:focus-visible]:border-[#ff6d6a] ${BOX} ${
          over ? 'border-[#ff6d6a]' : boxBorder(error)
        }`}
      >
        <span className="rounded-full border-[0.5px] border-[#262626] px-3 py-1 font-fira text-sm text-[#262626]">
          Choose files
        </span>
        <span className="font-sans text-base text-[#867a72]">
          or drop them here. PDF, DOC, slides, images or ZIP, up to 4 MB together.
        </span>
        <input
          id={id}
          type="file"
          multiple
          accept={FILE_EXT.map((x) => `.${x}`).join(',')}
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? true : undefined}
          className="sr-only"
          onChange={(e) => {
            add(e.target.files)
            e.target.value = '' // so re-picking a removed file fires onChange again
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`} className="flex items-stretch gap-2">
              <span className={`min-w-0 flex-1 truncate ${BOX} border-[#544D49]/35`}>
                {file.name} <span className="font-fira text-xs text-[#867a72]">{mb(file.size)}</span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange(files.filter((f) => f !== file))}
                className="shrink-0 cursor-pointer border border-[#544D49]/35 px-3 font-fira text-sm text-[#867a72] transition-colors hover:border-[#151414] hover:text-[#151414]"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <ErrorText id={`${id}-error`}>{error}</ErrorText>
    </div>
  )
}
