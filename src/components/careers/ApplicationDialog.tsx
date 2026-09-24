'use client'

import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import Image, { type StaticImageData } from 'next/image'
import railLogo from '../../../public/blacklogo.png'
import railTexture from '../../../public/branding/hero.webp'
import { MediaImage } from '@/components/Media/Image'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import {
  APPLICATION_DIALOG_ID,
  CAREERS_EMAIL,
  FILE_FIELDS,
  type ApplicationErrors,
  type ApplicationText,
  type FileKey,
  validateApplication,
} from '@/lib/careers'
import { getLenis } from '@/lib/lenis'
import type { MediaDoc, Role } from '@/lib/types'

// The "Apply for this role" popup on /careers/<slug>. Mounted by that page (not the layout — no other
// page needs it) and opened by Button's `dialog` prop.
//
// Built as the booking dialog's sibling on purpose, so applying and booking read as one product:
// same <dialog> + .booking-dialog top-layer animation, same two-column card with the pink recap rail,
// same underline Field, same bracketed eyebrow and outline/primary action pair. Two views instead of
// three steps — the form, then the confirmation — so there is no step meter.
//
// No confirmation email goes to the applicant (client note); the confirmation view is the receipt,
// and it hands out the careers inbox for questions instead.

// Local copy, same reason BookingDialog keeps one: importing ServiceHero's would drag the hero into
// the client bundle.
const texture = (img: StaticImageData): MediaDoc => ({
  url: img.src,
  width: img.width,
  height: img.height,
  alt: '',
  blurDataURL: img.blurDataURL,
})

const EMPTY: ApplicationText = { name: '', email: '', phone: '', linkedin: '', portfolioUrl: '' }
const NO_FILES: Record<FileKey, File | null> = { resume: null, coverLetter: null, portfolio: null }

const TEXT_FIELDS: {
  key: Exclude<keyof ApplicationText, 'portfolioUrl'>
  label: string
  type: string
  autoComplete: string
  required: boolean
  placeholder?: string
  wide?: boolean
}[] = [
  { key: 'name', label: 'Full name', type: 'text', autoComplete: 'name', required: true, wide: true },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
  { key: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', required: true },
  {
    key: 'linkedin',
    label: 'LinkedIn profile',
    type: 'url',
    autoComplete: 'url',
    required: false,
    placeholder: 'linkedin.com/in/yourname',
    wide: true,
  },
]

const mb = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export function ApplicationDialog({ role }: { role: Pick<Role, 'slug' | 'title' | 'tags' | 'pay'> }) {
  const ref = useRef<HTMLDialogElement>(null)
  const downOnBackdrop = useRef(false)
  const [text, setText] = useState<ApplicationText>(EMPTY)
  const [files, setFiles] = useState<Record<FileKey, File | null>>(NO_FILES)
  const [errors, setErrors] = useState<ApplicationErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  // Fades the body out and the confirmation in — the booking dialog's step move, minus the slide.
  const [fading, setFading] = useState(false)

  const close = useCallback(() => ref.current?.close(), [])

  const doneRef = useRef(done)
  useEffect(() => {
    doneRef.current = done
  }, [done])

  // Lenis parks while the modal is up (see BookingDialog). A finished application resets on close; a
  // half-filled one is kept, since closing mid-way almost always means coming back to it.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onClose = () => {
      getLenis()?.start()
      if (!doneRef.current) return
      setText(EMPTY)
      setFiles(NO_FILES)
      setErrors({})
      setFailed(null)
      setDone(false)
    }
    const obs = new MutationObserver(() => {
      if (el.open) getLenis()?.stop()
    })
    obs.observe(el, { attributes: true, attributeFilter: ['open'] })
    el.addEventListener('close', onClose)
    return () => {
      obs.disconnect()
      el.removeEventListener('close', onClose)
      getLenis()?.start()
    }
  }, [])

  const setFile = (key: FileKey, file: File | null) => {
    setFiles((f) => ({ ...f, [key]: file }))
    setErrors((e) => ({ ...e, [key]: undefined, files: undefined }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateApplication(text, files)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // take the reader to the first problem rather than leaving them to hunt for it
      requestAnimationFrame(() =>
        ref.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-error="true"]')?.focus(),
      )
      return
    }

    setSubmitting(true)
    setFailed(null)
    try {
      const body = new FormData()
      body.set('role', role.slug)
      for (const [k, v] of Object.entries(text)) body.set(k, v.trim())
      for (const [k, f] of Object.entries(files)) if (f) body.set(k, f)
      const res = await fetch('/api/careers/apply', { method: 'POST', body })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Something went wrong sending your application.')

      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        setDone(true)
      } else {
        setFading(true)
        setTimeout(() => {
          setDone(true)
          setFading(false)
        }, 220)
      }
    } catch (err) {
      setFailed(err instanceof Error ? err.message : 'Something went wrong sending your application.')
    } finally {
      setSubmitting(false)
    }
  }

  const facts = [...role.tags, role.pay]

  return (
    <dialog
      ref={ref}
      id={APPLICATION_DIALOG_ID}
      aria-labelledby="application-heading"
      // .booking-dialog is the shared modal shell in styles.css (layout, entry/exit, backdrop, the
      // touch scroll lock) — not booking-specific in anything but its name.
      className="booking-dialog"
      onPointerDown={(e) => {
        downOnBackdrop.current = e.target === ref.current
      }}
      onClick={(e) => {
        if (e.target === ref.current && downOnBackdrop.current) close()
      }}
    >
      <div className="relative flex h-[88svh] max-h-[88svh] w-full flex-col overflow-hidden border border-[#544D49] bg-[#fffcf9] md:h-[720px] md:max-h-[88dvh] md:max-w-[1120px] md:flex-row">
        {/* form column */}
        <div
          data-lenis-prevent
          className="order-2 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 md:order-1 md:px-12 md:pt-12 md:pb-10"
        >
          <div className="mb-5 flex items-center md:mb-10">
            <div className="flex w-56 items-center justify-between font-mono text-[11px] uppercase leading-[1.4] tracking-[0.15em] text-[#867a72] md:text-[14px] md:tracking-[0.2em]">
              <span aria-hidden>[</span>
              <span>{done ? 'Sent' : 'Application'}</span>
              <span aria-hidden>]</span>
            </div>
          </div>

          <div
            className={`flex min-h-0 flex-1 flex-col transition-opacity duration-200 ${
              fading ? 'opacity-0' : 'opacity-100'
            } ${done ? 'items-center justify-center text-center' : ''}`}
          >
            <div aria-live="polite">
              <h2
                id="application-heading"
                className={`font-display font-medium leading-[1.1] tracking-[-1px] text-[#262626] ${
                  done ? 'text-[32px] md:text-[56px]' : 'text-[32px] md:text-[44px]'
                }`}
              >
                {done ? 'Application received!' : 'Apply for this role.'}
              </h2>
            </div>

            {!done && (
              <form onSubmit={submit} noValidate className="mt-3 flex flex-1 flex-col md:mt-4">
                <p className="font-sans text-lg leading-[1.25] text-[#4a4a4a] md:text-xl">
                  A few details and three documents. Takes about two minutes.
                </p>

                <div className="mt-6 flex flex-col gap-5 md:mt-10 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-7">
                  {TEXT_FIELDS.map((f) => (
                    <Field
                      key={f.key}
                      id={`application-${f.key}`}
                      label={f.label}
                      type={f.type}
                      autoComplete={f.autoComplete}
                      required={f.required}
                      placeholder={f.placeholder}
                      className={f.wide ? 'md:col-span-2' : ''}
                      value={text[f.key]}
                      error={errors[f.key]}
                      onBlur={() => {
                        // only re-check a field that has something in it — blurring past an empty
                        // one on the way down shouldn't shout
                        if (!text[f.key].trim()) return
                        setErrors((e) => ({ ...e, [f.key]: validateApplication(text, files)[f.key] }))
                      }}
                      onChange={(v) => {
                        setText((t) => ({ ...t, [f.key]: v }))
                        if (errors[f.key]) setErrors((e) => ({ ...e, [f.key]: undefined }))
                      }}
                    />
                  ))}
                </div>

                <div className="mt-10 flex flex-col gap-5 md:mt-12">
                  {FILE_FIELDS.map((f) => (
                    <FileDrop
                      key={f.key}
                      id={`application-${f.key}`}
                      label={f.label}
                      hint={f.hint}
                      accept={f.ext.map((x) => `.${x}`).join(',')}
                      file={files[f.key]}
                      error={errors[f.key]}
                      onChange={(file) => setFile(f.key, file)}
                    />
                  ))}
                  {/* The portfolio's other door: most strategists' work lives on a site or a deck
                      link, and a big PDF would not fit the upload cap anyway. */}
                  <Field
                    id="application-portfolioUrl"
                    label="Portfolio link"
                    type="url"
                    autoComplete="url"
                    required={false}
                    placeholder="yoursite.com or a Drive / Behance link"
                    value={text.portfolioUrl}
                    error={errors.portfolioUrl}
                    onBlur={() => {
                      if (!text.portfolioUrl.trim()) return
                      setErrors((e) => ({ ...e, portfolioUrl: validateApplication(text, files).portfolioUrl }))
                    }}
                    onChange={(v) => {
                      setText((t) => ({ ...t, portfolioUrl: v }))
                      if (errors.portfolioUrl || errors.portfolio)
                        setErrors((e) => ({ ...e, portfolioUrl: undefined, portfolio: undefined }))
                    }}
                  />
                </div>

                {(errors.files || failed) && (
                  <p role="alert" className="mt-6 font-sans text-lg text-[#151414]">
                    {errors.files ?? failed}
                    {failed && !failed.includes(CAREERS_EMAIL) && (
                      <>
                        {' '}
                        You can also email it to{' '}
                        <a href={`mailto:${CAREERS_EMAIL}`} className="border-b border-[#151414]">
                          {CAREERS_EMAIL}
                        </a>
                        .
                      </>
                    )}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-4 pt-8 md:pt-10">
                  <Button variant="outline" onClick={close}>
                    CANCEL
                  </Button>
                  <Button variant="primary" type="submit" disabled={submitting}>
                    {submitting ? 'SENDING…' : 'SUBMIT APPLICATION'}
                  </Button>
                </div>
              </form>
            )}

            {done && (
              <div className="mt-3 flex w-full max-w-[520px] flex-col items-center gap-5 md:mt-4">
                <p className="font-sans text-lg leading-[1.25] text-[#4a4a4a] md:text-xl">
                  Thanks for applying to <span className="text-[#262626]">{role.title}</span> at Laly
                  Agency. We review every application personally and will follow up if it’s a fit.
                </p>
                <p className="font-sans text-lg leading-[1.25] text-[#4a4a4a] md:text-xl">
                  If you have any questions, please don’t hesitate to reach out to us at{' '}
                  <a
                    href={`mailto:${CAREERS_EMAIL}`}
                    className="border-b border-[#151414] text-[#151414] transition-opacity hover:opacity-60"
                  >
                    {CAREERS_EMAIL}
                  </a>
                  .
                </p>
                <div className="mt-5">
                  <Button variant="primary" onClick={close}>
                    DONE
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recap rail — the booking dialog's, echoing the role instead of the booking. */}
        <aside className="relative order-1 flex shrink-0 items-center gap-4 overflow-hidden border-b border-[#544D49] bg-[#ff6d6a] px-5 py-3 sm:px-8 md:order-2 md:w-[38%] md:flex-col md:items-start md:justify-center md:border-b-0 md:border-l md:px-8 md:py-12">
          <MediaImage
            media={texture(railTexture)}
            quality={40}
            sizes="430px"
            className="pointer-events-none absolute inset-0 z-0 size-full scale-125 object-cover opacity-25 blur-2xl mix-blend-multiply"
          />
          <Image
            src={railLogo}
            alt=""
            aria-hidden
            quality={100}
            sizes="120px"
            className="relative z-10 h-6 w-auto shrink-0 md:absolute md:left-8 md:top-12 md:h-7"
          />
          <dl className="relative z-10 hidden md:flex md:flex-col md:items-start md:gap-8 md:text-left">
            <div>
              <dt className="font-fira text-[11px] uppercase tracking-[1px] text-[#151414]/55">Applying for</dt>
              <dd className="mt-1.5 font-sans text-[28px] leading-[1.15] text-[#151414]">{role.title}</dd>
            </div>
            <div>
              <dt className="font-fira text-[11px] uppercase tracking-[1px] text-[#151414]/55">The role</dt>
              <dd className="mt-1.5 font-sans text-xl leading-[1.25] text-[#151414]">
                {/* each fact unbroken — "$40–$50/hour" otherwise wraps at the dash */}
                {facts.map((f, i) => (
                  <span key={f} className="whitespace-nowrap">
                    {i > 0 && ' · '}
                    {f}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </aside>

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-2.5 z-20 cursor-pointer rounded-full bg-[#151414] px-2.5 py-1 font-fira text-sm text-[#fcf7f3] transition-opacity hover:opacity-80 md:right-8 md:top-12"
        >
          CLOSE
        </button>
      </div>
    </dialog>
  )
}

// A file field in the same language as Field: Fira label above, a keyline box instead of an
// underline (a drop target needs an area), brand pink on focus/drag. The real <input type=file> is
// visually hidden but focusable, and the whole box is its <label>, so click, keyboard and drop all
// land on the one control.
function FileDrop({
  id,
  label,
  hint,
  accept,
  file,
  error,
  onChange,
}: {
  id: string
  label: string
  hint: string
  accept: string
  file: File | null
  error?: string
  onChange: (file: File | null) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) onChange(dropped)
  }

  return (
    <div>
      <p id={`${id}-label`} className="font-fira text-[11px] uppercase tracking-[1px] text-[#867a72]">
        {label}
      </p>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`mt-1.5 flex cursor-pointer items-center gap-4 border border-dashed px-4 py-4 transition-colors has-[:focus-visible]:border-solid has-[:focus-visible]:border-[#ff6d6a] md:px-5 ${
          over
            ? 'border-solid border-[#ff6d6a] bg-[#ff6d6a]/8'
            : error
              ? 'border-[#151414]'
              : 'border-[#544D49]/45 hover:border-[#151414]'
        } ${file ? 'border-solid' : ''}`}
      >
        {/* the arrow glyph the site's buttons use, turned to point down into the box */}
        <span
          aria-hidden
          className={`flex size-10 shrink-0 items-center justify-center rounded-full font-fira text-lg ${
            file ? 'bg-[#ff6d6a] text-[#292624]' : 'bg-[#151414] text-[#fcf7f3]'
          }`}
        >
          {file ? '✓' : '↓'}
        </span>
        <span className="min-w-0 flex-1">
          {file ? (
            <>
              <span className="block truncate font-display text-lg text-[#262626]">{file.name}</span>
              <span className="block font-fira text-xs text-[#867a72]">{mb(file.size)}</span>
            </>
          ) : (
            <>
              <span className="block font-display text-lg text-[#262626]">
                Drag & drop or <span className="border-b border-[#ff6d6a]">browse files</span>
              </span>
              <span className="block font-sans text-sm text-[#867a72]">{hint}</span>
            </>
          )}
        </span>
        <input
          ref={input}
          id={id}
          type="file"
          accept={accept}
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? true : undefined}
          data-error={error ? true : undefined}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {file && (
        <button
          type="button"
          onClick={() => {
            onChange(null)
            if (input.current) input.current.value = ''
          }}
          className="mt-1.5 cursor-pointer font-fira text-xs uppercase tracking-[1px] text-[#867a72] transition-colors hover:text-[#151414]"
        >
          Remove
        </button>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 font-sans text-sm text-[#151414]">
          {error}
        </p>
      )}
    </div>
  )
}
