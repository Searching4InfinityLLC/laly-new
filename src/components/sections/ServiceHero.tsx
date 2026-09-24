import type { CSSProperties } from 'react'
import type { StaticImageData } from 'next/image'
import { MediaImage } from '@/components/Media/Image'
import { Button } from '@/components/ui/Button'
import { PILL_COLORS } from '@/lib/palettes'
import type { MediaDoc, PaidHeroContent } from '@/lib/types'

// Figma 2724:3346 — the /branding hero: dark ground, photo at 20%, bracketed eyebrow, display
// heading, a pill row, a sentence with one bolded phrase, CTA. It closes on the same 1px keyline the
// home hero uses so the next section butts against it.
//
// /paid-advertising draws the same hero (2234:4063) and keeps its own copy of this markup inline:
// that page is signed off and frozen, so this is a deliberate duplicate, not a missed extraction.
//
// PaidHeroContent is reused for the content shape — it predates this page, and nothing in it is
// paid-specific.

// Static imports rather than Media docs: the hero photo is not content — it is the layout's 20%
// wash, decorative (empty alt), with nothing for an editor to change but the design itself.
export const texture = (img: StaticImageData): MediaDoc => ({
  url: img.src,
  width: img.width,
  height: img.height,
  alt: '',
  blurDataURL: img.blurDataURL,
})

// Same 90deg wash on every pill — a warm ember that only reaches full brand pink in the last 15%,
// so the row reads as one gradient sampled four times rather than four separate chips.
const PILL_BG =
  'linear-gradient(90deg, rgba(28,25,23,0.2) 35%, rgba(85,47,42,0.2) 65%, rgba(141,68,60,0.2) 85%, rgba(255,111,97,0.1) 100%)'

export function ServiceHero({
  content,
  image,
  label,
  // Both source photos are tall portraits cropped to a ~727px band, so the interesting third has to
  // be nudged into frame per page — Figma's own crop, not a taste call. A whole literal class
  // rather than a value, because Tailwind can't see through an interpolated arbitrary value.
  //
  // Desktop is 43%, read off the 2724:3346 render rather than guessed: the photo covers a 1440x727
  // band from 1600x2240, so it scales to 2016 tall and 1289px of it is off-frame; the ridge that
  // sits 31.25% down the photo lands 10.6% down the band, which puts the offset at 553 of that
  // 1289. Anchoring to the bottom edge overshot it onto the water; the old 32% undershot onto sky.
  // The phone keeps 32% — its band is far taller against the portrait, so the same crop reads
  // differently there and its own frame is signed off.
  objectPosition = 'object-[50%_32%] md:object-[50%_43%]',
  // What the button does. Every service page opens the booking dialog (the default); the careers
  // pages pass `{}` so it follows its in-page href instead (#roles, #apply). Spread onto Button.
  cta = { booking: true },
  // /careers pages have no scratch band under the hero, so the hero takes its height instead:
  // standard hero + ScratchBand (131px desktop, 198px phone, measured on /branding), split evenly
  // between top and bottom padding so the copy stays centred in the taller band.
  tall = false,
}: {
  content: PaidHeroContent
  image: StaticImageData
  label: string // the section's accessible name; each page names its own service
  objectPosition?: string
  cta?: { booking?: boolean }
  tall?: boolean
}) {
  return (
    // .hero-dark is the header's only cue: styles.css flips the shared cream navbar to
    // transparent + light logo for any page whose hero opts in. No route check, no scroll JS.
    <section
      aria-label={label}
      // Figma frame: px 48, pt 0, pb 160, with the header's own 20px padding + 160 gap putting the
      // copy 188px down. The navbar is fixed and out of flow here, so that 188 has to be padding.
      // Mobile (2234:3799): px 20, pb 112, and 20 pad + 28 logo + 112 gap = the copy 160px down.
      className={`hero-dark relative flex w-full flex-col overflow-hidden border-b border-[#544D49] bg-[#292624] px-5 sm:px-10 md:px-12 ${
        tall
          ? 'pt-[259px] pb-[211px] md:pt-[254px] md:pb-[225px]'
          : 'pt-[160px] pb-28 md:pt-[188px] md:pb-40'
      }`}
    >
      {/* 20% is the design's own opacity — the photo is a texture, not a subject, so it is
          decorative (empty alt) and carries no blur placeholder cost worth paying. */}
      <MediaImage
        media={texture(image)}
        priority
        // 20% over near-black hides re-encode artefacts, so the LCP image doesn't need q100.
        quality={60}
        sizes="100vw"
        className={`pointer-events-none absolute inset-0 size-full object-cover opacity-20 ${objectPosition}`}
      />

      {/* Figma hero section: px 144 at 1440 -> a 1056 column, same cap the home hero uses. */}
      {/* mobile stacks on a 32px rhythm (Figma "Hero Text Container"), desktop on 24 */}
      <div className="relative mx-auto flex w-full max-w-[1056px] flex-col items-center gap-8 text-center md:gap-6 3xl:max-w-[1200px]">
        {/* Brackets are authored here rather than stored, and not BracketLabel: that component
            spreads its brackets to the row's edges, and this one hugs the words. */}
        <p
          className="entry-copy font-mono text-sm font-normal uppercase leading-[1.4] tracking-[1px] text-[#FF6D6A] md:text-2xl"
          style={{ animationDelay: '0.7s' }}
        >
          [ {content.label} ]
        </p>

        <h1
          // 338px is Figma's mobile text width, and it is what breaks the line after "when"
          className="hero-heading entry-copy max-w-[338px] font-display text-[44px] font-normal leading-[1.1] tracking-[-1px] text-[#FFFCF9] md:max-w-none md:text-7xl md:font-medium md:leading-none md:tracking-[-1px] 3xl:text-8xl"
          style={{ animationDelay: '0.8s' }}
        >
          {content.heading}
        </h1>

        {/* 558px is the Figma width, and it is what breaks the four pills 4-up on desktop and
            2-up on a phone — a max, not a fixed width, so it can shrink below it. */}
        <ul
          // hero-pills: each pill fades in from the left, left to right, and the run goes LAST —
          // after the description and the button. Both delays live in styles.css: the start has to
          // track the heading mode the way .hero-desc / .hero-cta do, and --pill-delay below only
          // has to say which pill this is.
          className="hero-pills flex max-w-[558px] flex-wrap items-center justify-center gap-x-2 gap-y-1.5"
        >
          {content.pills.map((pill, i) => (
            <li
              key={pill}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[10px] font-normal leading-[1.25] text-[#E7DCD4] md:text-xs shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]"
              style={{ backgroundImage: PILL_BG, '--pill-delay': `${i * 0.08}s` } as CSSProperties}
            >
              {/* star.svg as a mask, same trick as the Strategy badges — one asset, four tints.
                  The tint is the row position, so it cycles rather than coming from the CMS. */}
              <span
                aria-hidden
                className="h-[6.5px] w-[6px] shrink-0"
                style={
                  {
                    backgroundColor: PILL_COLORS[i % PILL_COLORS.length],
                    maskImage: 'url(/star.svg)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: 'url(/star.svg)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                  } as CSSProperties
                }
              />
              {pill}
            </li>
          ))}
        </ul>

        <p
          // tablet: the 338px mobile cap is what turned three lines into five on an iPad (client
          // note), so the tablet band takes the desktop 880 cap. Size stays the mobile 20px there —
          // the client set that explicitly; 880 of copy at 20px still breaks in three.
          className="hero-desc entry-copy max-w-[338px] font-sans text-xl font-normal leading-[1.25] text-[#F7F1EE] tablet:max-w-[880px] md:max-w-[880px] md:text-[28px]"
          style={{ animationDelay: '1.05s' }}
        >
          {content.description.before}
          {/* the designer set this phrase in Neue Haas bold at 24 against the 28px serif — a
              deliberate voice change mid-sentence, so the CMS stores the sentence in three parts
              rather than shipping a markup parser.
              /development (3292:4657) sets no such run — one flat paragraph — so an empty emphasis
              renders neither the <strong> nor the tail, rather than an empty bold node. */}
          {content.description.emphasis && (
            <>
              <strong className="font-display text-lg font-bold tracking-[0.25px] md:text-2xl">
                {content.description.emphasis}
              </strong>
              {content.description.after}
            </>
          )}
        </p>

        <div className="hero-cta entry-copy flex justify-center" style={{ animationDelay: '1.2s' }}>
          {/* Figma sets this label at 18px mobile / 20px desktop; the shared Button ships 16/18,
              so it is overridden on the instance exactly like the home hero's CTA. */}
          <Button
            variant="primary"
            {...cta}
            href={content.button.href}
            className="[&>span]:text-lg [&>span]:tracking-[-1px] md:[&>span]:text-xl md:[&>span]:leading-[25px]"
          >
            {content.button.label}
          </Button>
        </div>
      </div>
    </section>
  )
}
