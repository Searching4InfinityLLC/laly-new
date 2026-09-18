import { ImageMarquee } from '@/components/ImageMarquee'
import { Button } from '@/components/ui/Button'
import { Fragment } from 'react'
import type { CSSProperties } from 'react'
import type { HeroContent } from '@/lib/types'

// Home hero — first section, cream. Height HUGS its content, like the Figma frame: the 808/818 in
// the design is a hug result, not a constraint, so a fixed height or 100dvh would only add dead
// space (tall screens) or squeeze the padding (short ones). Padding then means literally what the
// Figma panel says at every width.
// Heading = Figma display/l: Neue Haas (font-display) 500 / 72px / 100% leading / center / #262626.
// Mobile = Figma heading/h1/s: 450 (→400, only 400/500/700 shipped) / 44px / 110% leading.
// Desc = New Spirit (font-sans) 400 / 20px mobile, 28px desktop / 125% leading / center / #4A4A4A.
// Entry: Loader.tsx sets `preloader-done` as its 1.2s exit wipe starts. Heading waits 0.8s, so it
// begins shortly before the wipe clears.
export default function Hero({ content }: { content: HeroContent }) {
  const { heading, description, button, slides } = content
  const rows = heading.split('\n').map((line) => line.trim()).filter(Boolean)

  return (
    <section
      aria-label="Home"
      // Figma's frame holds the navbar, which is fixed here and out of flow — so the frame's gap
      // between navbar and copy has to carry the navbar's own 76px: 76 + 80 mobile, 76 + 48 desktop.
      // Sides 20/48, bottom 48/112. Closes on a 1px keyline.
      className="flex w-full flex-col border-b border-[#544D49] bg-[#fffcf9] px-5 pt-[156px] pb-12 sm:px-10 md:px-12 md:pt-[124px] md:pb-28"
    >
      {/* Figma mobile: text container hugs at 291px (≈50px each side on a 390 frame), children gap 20.
          That hug is a phone number, but md is 1152 here, so it was still squeezing a 900px tablet
          into 291px and wrapping every authored line in two. Released at sm so each sentence gets
          its own line on tablet like it does on desktop. */}
      <div className="mx-auto max-w-[291px] text-center sm:max-w-none md:max-w-[1056px] 3xl:max-w-[1200px]">
        {/* whole heading fades up as one — no per-letter ripple (reads tacky, team review). The
            authored \n stays a hard break via block spans; on mobile each line wraps beneath it. */}
        <h1
          aria-label={rows.join(' ')}
          className="hero-heading entry-copy font-display text-[44px] font-normal leading-[1.1] tracking-tight text-[#262626] md:text-7xl md:font-medium md:leading-none 3xl:text-8xl"
          style={{ animationDelay: '0.8s' }}
        >
          {rows.map((line, lineIndex) => {
            let charIndex = 0

            return (
              <span key={line} aria-hidden className="block">
                {line.split(' ').map((word, wordIndex) => (
                  <Fragment key={`${line}-${wordIndex}`}>
                    {wordIndex > 0 && ' '}
                    <span className="heading-word">
                      {Array.from(word).map((char, i) => (
                        <span
                          key={`${word}-${i}`}
                          className="heading-char"
                          style={
                            {
                              '--char-delay': `${lineIndex * 0.25 + charIndex++ * 0.05}s`,
                            } as CSSProperties
                          }
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  </Fragment>
                ))}
              </span>
            )
          })}
        </h1>
        <p
          // letter-spacing/l — token value unknown, eyeballed a touch tighter than default
          className="hero-desc entry-copy mx-auto mt-5 max-w-[616px] md:mt-6 font-sans text-xl font-normal leading-[1.25] tracking-[-0.01em] text-[#4A4A4A] md:text-[28px] 3xl:max-w-[800px] 3xl:text-[30px]"
          style={{ animationDelay: '0.95s' }}
        >
          {description}
        </p>
        <div
          className="hero-cta entry-copy mt-5 flex justify-center md:mt-6"
          style={{ animationDelay: '1.1s' }}
        >
          {/* 20px label from desktop up — the shared Button ships 16/18, so the label span is
              overridden here rather than moving every other button on the page */}
          <Button
            variant="primary"
            booking
            href={button.href}
            className="md:[&>span]:text-xl md:[&>span]:leading-[25px]"
          >
            {button.label}
          </Button>
        </div>
      </div>

      {/* full-bleed image strip below the button; already scrolling, slides fade in staggered */}
      {/* gap above: 56 mobile, 48 desktop. Negative margins cancel the section's side padding — the
          strip is full-bleed; ImageMarquee's first slide carries the inset on its own. */}
      <div className="-mx-5 mt-14 sm:-mx-10 md:-mx-12 md:mt-12 3xl:mt-16">
        <ImageMarquee slides={slides} />
      </div>
    </section>
  )
}
