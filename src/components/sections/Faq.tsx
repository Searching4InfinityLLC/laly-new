import { Accordion } from '@/components/ui/Accordion'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { GridBackdrop } from '@/components/ui/GridBackdrop'
import { InView } from '@/components/ui/InView'
import type { FaqContent } from '@/lib/types'

// Figma 2724:3687 — FAQ on /branding. Cream under the faint grid.
//
// /paid-advertising draws the identical block (2458:5950) and keeps its own copy of this markup
// inline: that page is signed off and frozen, so this is a deliberate duplicate, not a missed
// extraction. Fold the two together only when both are open for edits again.
//
// Rows are the client <Accordion>: native <details> cannot animate its own open/close outside
// Chromium, and the panel has to slide at both widths. Everything else here stays server.
export function Faq({ content }: { content: FaqContent }) {
  return (
    <section
      aria-label={content.label}
      // mobile (2739:9048): px 20, pt 48 / pb 96, 32 between the header and the container
      className="relative w-full overflow-hidden border-y border-[#544D49] bg-[#FCF7F3] px-5 pt-12 pb-24 md:px-40 md:py-28"
    >
      <GridBackdrop />

      <div className="relative mx-auto flex w-full max-w-[1120px] flex-col gap-8 md:gap-12">
        <div className="flex flex-col gap-6 text-center">
          <BracketLabel className="mx-auto w-44 theme-label text-[var(--section-label,#867A72)] md:w-80">
            {content.label}
          </BracketLabel>
          <h2 className="font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] theme-ink text-[var(--section-heading,#292624)] md:text-[56px]">
            {content.heading}
          </h2>
        </div>

        {/* below md the whole box travels as one — border, rows and all — rather than the rows
            sliding inside a border that stays put */}
        <InView rootMargin="0px 0px -15% 0px">
          <div className="mobile-reveal flex w-full flex-col gap-4 border border-[var(--panel-border,#E7DCD4)] theme-surface bg-[#FFFCF9] px-3 py-6 md:p-6">
            {content.items.map((faq, i) => (
              <Accordion
                // the placeholder rows are identical copy, so the index is the only stable key
                key={i}
                id={`faq-${i}`}
                question={faq.question}
                answer={faq.answer}
                // last row drops the rule — Figma ends the stack on the container's own border
                className={`px-4 py-6 ${i < content.items.length - 1 ? 'border-b border-[var(--panel-border,#E7DCD4)]' : ''}`}
              />
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}
