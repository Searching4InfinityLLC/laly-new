import { GridBackdrop } from '@/components/ui/GridBackdrop'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { SystemDeck } from '@/components/sections/SystemDeck'
import type { SystemContent } from '@/lib/types'

// Figma 2767:9520 (desktop) / 2739:8892 (mobile) — "The System" on /branding. Cream ground under a
// faint grid, then one centred column at both widths: eyebrow, heading, the argument, and the
// three-card deck beneath it. (An earlier revision of the desktop frame set the copy and the deck
// side by side; the frame is a single column now, so this is too.) The deck itself — its geometry,
// palette and 3s cycle — lives in SystemDeck; everything here is the frame around it.

export function BrandSystem({ content }: { content: SystemContent }) {
  return (
    <section
      aria-label={content.label}
      // Figma frame: an even 112 all round. Mobile (2739:8892): px 24, pt 48, pb 64.
      className="relative w-full overflow-hidden bg-[#FCF7F3] px-6 pt-12 pb-16 md:p-28"
    >
      {/* fade runs bottom-up here (client note) — the grid builds down the section rather than
          dropping out of it, unlike the FAQ and the /paid-advertising panels */}
      <GridBackdrop className="grid-backdrop-flip" />

      {/* Two doodles the designer drops in the margins, at each frame's own offsets — the phone puts
          the large one half off the right edge beside the stack and the small one at the bottom
          left, and both are two thirds the size they are on desktop. Decorative. Plain <img>: they
          are static shapes in /public, and the small one carries an SVG noise filter that
          next/image would have nothing to do with. */}
      <img
        src="/branding/blob-large.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[256px] right-[-16px] h-[126.397px] w-[68.542px] rotate-[148.51deg] md:bottom-auto md:right-auto md:left-[calc(50%+210px)] md:top-[527px] md:h-[189.261px] md:w-[102.631px]"
      />
      <img
        src="/branding/blob-small.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[33px] left-5 h-[41.301px] w-[15.88px] rotate-[-36.07deg] md:bottom-[73px] md:left-[calc(50%-242px)] md:h-[51.075px] md:w-[19.638px]"
      />

      {/* Figma stacks three groups on the centreline: the heading block, the argument, and the
          deck. Desktop runs 32 inside the heading block, 48 down to the argument, 80 down to the
          deck; the phone runs 24 / 24 / 32. */}
      <div className="relative mx-auto flex w-full max-w-[1216px] flex-col gap-6 md:gap-12">
        <div className="flex flex-col gap-6 text-center md:gap-8">
          <BracketLabel className="mx-auto w-44 theme-label text-[var(--section-label,#867A72)] md:w-80">
            {content.label}
          </BracketLabel>
          {/* heading/h1/xl: Neue Haas 450 (→400) / 64 / 110% / -1px, 40 on the phone. Per-line
              spans, same as Strategy — the \n is a break the designer set, not a wrap. */}
          <h2 className="font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] theme-ink text-[var(--section-heading,#292624)] md:text-[64px]">
            {content.heading.split('\n').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex flex-col items-center gap-8 md:gap-20">
          {/* The argument runs the full 1216 column, centred — no narrower cap: at 28px that is what
              sets the breaks the frame draws. */}
          <p className="w-full whitespace-pre-line text-center font-sans text-xl leading-[1.25] theme-ink text-[var(--section-body,#4A4A4A)] md:text-[28px]">
            {content.body.before}
            {/* New Spirit Bold Condensed — the thesis, set apart from the copy either side of it */}
            <strong className="font-bold">{content.body.emphasis}</strong>
            {content.body.after}
          </p>

          {/* The deck: three interchangeable cards, one at the front at a time, cycling every 3s.
              It owns its own scroll gate and timer, so this stays a server component. */}
          <SystemDeck chain={content.chain} />
        </div>
      </div>
    </section>
  )
}
