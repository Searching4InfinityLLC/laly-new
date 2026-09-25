'use client'

import { useEffect, useRef, useState, type DragEvent } from 'react'
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

// The application form on /careers/<slug>, in a modal <dialog id="apply"> so applying never means
// scrolling past the description. Both APPLY buttons are plain '#apply' links; Button opens a dialog
// target instead of scrolling to it, and a deep link to /careers/<slug>#apply opens it on load.
// The shell is the booking dialog's (.booking-dialog in styles.css: top layer, focus trap, ESC,
// backdrop-click dismiss, the same enter/exit). A plain single-column form (client note: "a standard
// form, start fresh"): boxed fields with their labels above, one drop zone for every document, one
// submit. Closing keeps what was typed; a sent application stays on its confirmation.
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
  const ref = useRef<HTMLDialogElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const downOnBackdrop = useRef(false)
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

  // Lenis keeps driving the page under a top-layer dialog, so park it while this is open (as
  // BookingDialog does). A deep link to #apply opens it on arrival.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onClose = () => getLenis()?.start()
    const obs = new MutationObserver(() => el.open && getLenis()?.stop())
    obs.observe(el, { attributes: true, attributeFilter: ['open'] })
    el.addEventListener('close', onClose)
    if (location.hash === '#apply') el.showModal()
    return () => {
      obs.disconnect()
      el.removeEventListener('close', onClose)
      getLenis()?.start()
    }
  }, [])

  // The confirmation is far shorter than the form, so bring the card's top back into view.
  const toTop = () => scroller.current?.scrollTo({ top: 0 })

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
    <dialog
      ref={ref}
      id="apply"
      aria-labelledby="application-heading"
      className="booking-dialog"
      // backdrop click dismisses, but only a press that started there (see BookingDialog)
      onPointerDown={(e) => {
        downOnBackdrop.current = e.target === ref.current
      }}
      onClick={(e) => {
        if (e.target === ref.current && downOnBackdrop.current) ref.current?.close()
      }}
    >
      <div className="relative flex max-h-[88svh] w-full flex-col border border-[#544D49] bg-[#fffcf9] md:max-h-[88dvh] md:max-w-[1120px]">
      <div
        ref={scroller}
        data-lenis-prevent
        className="flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto px-5 pt-14 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-10 md:gap-10 md:px-16 md:pt-12 md:pb-12"
      >
        <div className="flex flex-col gap-5 text-center md:gap-6">
          <BracketLabel className="theme-label mx-auto w-44 text-[var(--section-label,#867A72)] md:w-80">
            {done ? 'Sent' : 'Apply'}
          </BracketLabel>
          <h2
            id="application-heading"
            aria-live="polite"
            className="theme-ink font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] text-[var(--section-heading,#262626)] md:text-[48px]"
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
          <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-2 md:gap-x-8">
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

            <div className="md:col-span-2">
              <FileDrop files={files} error={errors.files} onChange={changeFiles} />
            </div>

            {/* The portfolio's other door: most strategists' work lives on a site or a deck link,
                and a big PDF would not fit the upload cap anyway. */}
            <div className="md:col-span-2">
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
              <p role="alert" className="theme-ink font-sans text-lg md:col-span-2 text-[var(--section-heading,#151414)]">
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
              className="mt-2 w-full py-3 md:col-span-2 [&>span]:text-lg"
            >
              {submitting ? 'SENDING…' : 'SUBMIT APPLICATION'}
            </Button>
          </form>
        )}
      </div>
        {/* the booking dialog's CLOSE pill; last in the DOM so tabbing starts on the form */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => ref.current?.close()}
          className="absolute right-4 top-3 z-20 cursor-pointer rounded-full bg-[#151414] px-2.5 py-1 font-fira text-sm text-[#fcf7f3] transition-opacity hover:opacity-80 md:right-8 md:top-8"
        >
          CLOSE
        </button>
      </div>
    </dialog>
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
        className={`mt-2 flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 border-dashed text-center has-[:focus-visible]:border-[#ff6d6a] ${BOX} ${
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
