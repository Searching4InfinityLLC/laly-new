import { MediaImage } from '@/components/Media/Image'
import { InView } from '@/components/ui/InView'
import type { MediaDoc } from '@/lib/types'

// The "brand new website" panel graphic (paid.whatYouGet.panels[0]). Still the flat export — the
// client only asked for its CTA to press itself, not for the whole mock to become DOM — so the
// button is the one live part: a patch of the card's own #FFFAF7 covers the baked button, and this
// draws it again on top so it can move without the original showing through the gap.
//
// Geometry is measured off the 1020x518 export and written as percentages of the root box, the same
// way CallsWidget carries its own; radius and type are cqw for the same reason, since the mock is
// 510px in the panel and full-bleed on a phone. The patch is 5px larger than the button on every
// side (in export pixels), which is more than the press ever travels or shrinks.
//
// No client boundary: the press is a CSS animation released by the panel's own <InView> gate.
// ponytail: one button, not a mock rebuilt as components. If a second element ever has to move,
// that is the point to reconsider the export.
export function WebsiteMock({ media, width }: { media: MediaDoc; width: number }) {
  return (
    // Its own gate, not the panel's: on a phone the mock sits a screen below the copy, so a press
    // released by the panel's gate was over before the button was on screen.
    <InView className="mock-gate @container relative w-full" rootMargin="0px 0px -25% 0px">
      <MediaImage
        media={media}
        sizes={`(min-width: 1152px) ${width}px, 100vw`}
        // block, not the inline default: an inline image leaves a descender gap in the wrapper and
        // every percentage below is measured against that wrapper
        className="block h-auto w-full"
      />

      {/* export px 525,281 / 246x68 — the button's box plus 5px of card on every side */}
      <div
        aria-hidden
        className="absolute left-[51.47%] top-[54.25%] h-[13.13%] w-[24.12%] bg-[#FFFAF7]"
      />
      {/* export px 530,286 / 236x58, fill #D1CF95, radius 12, label ~15px */}
      <div
        aria-hidden
        className="button-press absolute left-[51.96%] top-[55.21%] flex h-[11.2%] w-[23.14%] items-center justify-center rounded-[1.18cqw] bg-[#D1CF95] font-display text-[1.47cqw] font-bold leading-none tracking-[-0.01em] text-white"
      >
        Book a Call
      </div>
    </InView>
  )
}
