'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useScramble } from '@/components/ui/ScrambleText'
import { openBooking, openDialog } from '@/lib/booking'
import { getLenis } from '@/lib/lenis'

// Presentational button primitive — styling + scramble-on-hover. No CMS logic.
// Label is Chivo Mono (font-mono): mono keeps the decrypt width-stable, no jitter/overlap, so the
// scramble is a single span. href -> Next <Link>, else <button>. Trigger is the whole button.
// Payload later: a CMSButton adapter maps the `button` field (type/page/link/styling) onto this.

const SHELL_BASE =
  // Figma Button/Medium: padding 6px vertical / 8px horizontal, gap 6px (the label's gap-1.5),
  // corner-radius/full. 23px line-height + 12px padding = the spec's 35px hug height.
  // Per-button specs differ by design — override on the instance, don't unify here.
  'inline-flex cursor-pointer items-center justify-center rounded-full px-2 py-1.5 ' +
  'shadow-[0_1px_2px_0_rgba(16,24,40,0.08)] transition-colors'
const TYPE = 'font-fira text-base font-medium leading-[23px] whitespace-nowrap 3xl:text-lg 3xl:leading-[26px]'

// variant changes ONLY the base look + the scramble flash color — not the hover text color.
const VARIANTS = {
  // outline: dark keyline + text; decrypt chars flash the logo color
  outline: {
    shell: 'border-[0.5px] border-[#262626] text-[#262626]',
    flash: '#ff6d6a',
  },
  // outlineInverse: same keyline pill but for dark grounds — white border + text, same logo flash
  outlineInverse: {
    shell: 'border-[0.5px] border-white text-white hover:bg-white/10',
    flash: '#ff6d6a',
  },
  // solid: filled, white text; decrypt chars stay white (no color change)
  solid: {
    shell: 'border-[0.5px] border-transparent bg-[#262626] text-white',
    flash: '#ffffff',
  },
  // primary: brand-pink fill, dark text; hover darkens the fill; no color flash
  primary: {
    shell: 'bg-[#ff6d6a] text-[#292624] hover:bg-[#ff7e7b]',
    flash: '#292624',
  },
} as const

type Variant = keyof typeof VARIANTS

type Props = {
  children: string
  href?: string
  variant?: Variant
  icon?: ReactNode
  scramble?: boolean
  scrambleColor?: string // overrides the variant's flash color
  className?: string
  onClick?: () => void
  altLabel?: string // second label, masked-swapped in when showAlt flips (MENU <-> CLOSE)
  showAlt?: boolean
  // Opens the booking dialog. A flag rather than an onClick because every CTA that wants this sits
  // in a server component, which cannot pass a function across the boundary — so the prop IS the
  // wiring. Wins over `href`: every CTA passes both, and a stray CMS href must not quietly turn a
  // booking button into a link.
  booking?: boolean
  // Opens the <dialog> with this id — `booking` for any other modal (the careers application form).
  // A string for the same server-component reason `booking` is a flag.
  dialog?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({
  children,
  href,
  variant = 'outline',
  icon,
  scramble = true,
  scrambleColor,
  className = '',
  onClick,
  altLabel,
  showAlt = false,
  booking = false,
  dialog,
  type = 'button',
  disabled = false,
}: Props) {
  const flash = scrambleColor ?? VARIANTS[variant].flash
  const { ref, run } = useScramble<HTMLSpanElement>(children, flash)
  // no decrypt run on a dead button — the label animating under a cursor that can't click reads as
  // the button working
  const onMouseEnter = scramble && !disabled ? run : undefined
  const current = altLabel !== undefined && showAlt ? altLabel : children

  const label = (
    <span className={`inline-flex items-center gap-1.5 ${TYPE}`}>
      {icon}
      {altLabel !== undefined ? (
        /* both labels live in one grid cell, so the pill is as wide as the wider word and
           doesn't resize mid-swap. aria-hidden — the button's aria-label carries the live one. */
        <span aria-hidden className={`mask-swap ${showAlt ? 'is-alt' : ''}`}>
          <span>{children}</span>
          <span>{altLabel}</span>
        </span>
      ) : scramble ? (
        <span ref={ref} className="whitespace-nowrap">
          {children}
        </span>
      ) : (
        children
      )}
    </span>
  )
  const cls =
    `${SHELL_BASE} ${VARIANTS[variant].shell} ${disabled ? 'cursor-not-allowed opacity-45' : ''} ${className}`.trim()

  // An in-page anchor ('#roles') glides there on Lenis instead of the browser's jump — Lenis owns
  // scrollTop, so a native jump lands without the smooth scroll the rest of the site has. No Lenis
  // (touch, reduced motion): fall through to the plain anchor.
  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const lenis = getLenis()
    if (!href?.startsWith('#') || !lenis) return
    const target = document.querySelector(href)
    if (!target) return
    e.preventDefault()
    lenis.scrollTo(target as HTMLElement)
  }

  return href && !booking && !dialog ? (
    <Link
      href={href}
      aria-label={children}
      className={cls}
      onMouseEnter={onMouseEnter}
      onClick={onLinkClick}
    >
      {label}
    </Link>
  ) : (
    <button
      type={type}
      aria-label={current}
      className={cls}
      disabled={disabled}
      onClick={booking ? openBooking : dialog ? () => openDialog(dialog) : onClick}
      onMouseEnter={onMouseEnter}
    >
      {label}
    </button>
  )
}
