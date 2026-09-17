import { InView } from '@/components/ui/InView'
import type { NoteContent } from '@/lib/types'

// Dark qualifier band between Contact and the footer — one centred paragraph in brand pink on
// #151414 (Figma 2039:5835; it was #292624). Flat — the frame has no grain on this band. Figma: 1440
// fill x 186 hug, 48px vertical / 96px horizontal padding, text block 1248 wide.
//
// body-2/xl: New Spirit Condensed (font-sans) w400, 24px / 125%, centred.
// className is the paragraph's, not the section's: /paid-advertising sets the same band to a 458px
// column (Figma 2148:620), which is the only thing that differs between the two uses.
//
// `ground` is the band colour: #151414 on every page now, so no page passes it. Kept as a prop for a
// page that needs a different band. Inline rather than a class: Tailwind can't see through an
// interpolated arbitrary value.
export default function Note({
  content,
  className = '',
  ground = '#151414',
}: {
  content: NoteContent
  className?: string
  ground?: string
}) {
  return (
    <section
      aria-label="A note on availability"
      className="w-full"
      style={{ backgroundColor: ground }}
    >
      {/* max-w already IS Figma's 1248 text block (1440 frame minus the 96px side padding) — adding
          px-24 on top of it double-counted the inset. Side padding is just the gutter now. */}
      {/* Figma desktop: 48 top+bottom, 96 sides — the 1248 text block is just 1440 minus that */}
      <InView className="section-shell px-6 py-8 sm:px-10 md:px-24 md:py-12">
        {/* mobile = body-2/s: New Spirit 400 / 16 / 125% / letter-spacing l / #FF6D6A, centred.
            whitespace-pre-line: every \n in the copy is a real break, so \n\n is the empty line
            Figma sets above "Get in touch to be considered." */}
        <p
          className={`section-text-reveal whitespace-pre-line text-center font-sans text-base font-normal leading-[1.25] tracking-[-0.01em] text-[#FF6D6A] md:text-2xl ${className}`}
        >
          {content.body}
        </p>
      </InView>
    </section>
  )
}
