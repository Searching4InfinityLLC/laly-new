import type { CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { InView } from '@/components/ui/InView'
import { BracketLabel } from '@/components/ui/BracketLabel'
import type { PricingContent } from '@/lib/types'

// Figma 2796:9967 — Pricing on /branding. Cream ground, two cards; the second carries the brand
// keyline, a glow, and the "pay as they come in" tab straddling its top edge.
//
// /paid-advertising draws the identical block (2329:4221) and keeps its own copy of this markup
// inline: that page is signed off and frozen, so this is a deliberate duplicate, not a missed
// extraction. Fold the two together only when both are open for edits again.
export function Pricing({ content }: { content: PricingContent }) {
  return (
    <section
      aria-label={content.label}
      // mobile (2571:2660): px 20, pt 48 / pb 96, cards 24 apart
      className="w-full border-t-[0.5px] border-[#867A72] bg-[#FCF7F3] px-5 pt-12 pb-24 md:px-40 md:py-28"
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-16">
        <div className="flex flex-col gap-6 text-center">
          <BracketLabel className="mx-auto w-44 theme-label text-[var(--section-label,#867A72)] md:w-80">
            {content.label}
          </BracketLabel>
          {/* the break after "Transparent." is authored, not a wrap — whitespace-pre-line keeps
              the editor's Enter */}
          <h2 className="whitespace-pre-line font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] theme-ink text-[var(--section-heading,#262626)] md:text-[64px]">
            {content.heading}
          </h2>
        </div>

        {/* items-stretch (grid's default) is what lets the shorter card match the taller one, and
            justify-between then parks both CTAs on the same line.
            The <InView> gate is what fades the pair in on scroll — client feedback, opacity only,
            second card trailing the first by --card-delay. */}
        <InView
          className="grid gap-6 md:grid-cols-2 md:gap-8"
          // the grid is most of a screen tall, so without this it trips at the viewport
          // bottom and the fade is finished before the cards are in frame
          rootMargin="0px 0px -25% 0px"
        >
          {content.tiers.map((tier, i) => (
            <div
              key={tier.label}
              // 0.3s per card, up from 0.15 — client asked the second card to trail further
              style={{ '--card-delay': `${i * 0.3}s` } as CSSProperties}
              className={`card-fade relative flex flex-col justify-between gap-8 border theme-surface bg-[#FFFCF9] px-4 py-6 md:gap-10 md:p-10 ${
                tier.badge
                  ? 'border-[#FF6D6A] shadow-[0_0_6px_0_rgba(66,55,48,0.2),1px_1px_6px_0_rgba(66,55,48,0.2)]'
                  : 'border-[var(--panel-border,#E7DCD4)]'
              }`}
            >
              {tier.badge && (
                // straddles the keyline near the right edge — Figma pins it at left:372 on a
                // fixed-width card, which is that inset measured from the wrong side
                <span className="absolute -top-3 right-4 rounded-full bg-[#FF6D6A] px-1.5 py-1 font-fira text-xs leading-[1.25] tracking-[-1px] text-[#292624] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] md:right-10 md:text-base">
                  {tier.badge}
                </span>
              )}

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  {/* body/l — Neue Haas 20 / 125% / 0.25px, both widths */}
                  <p className="font-display text-xl font-normal leading-[1.25] tracking-[0.25px] theme-ink text-[var(--panel-muted,#867A72)]">
                    {tier.label}
                  </p>
                  <p className="font-sans text-[64px] leading-[1.25] tracking-[-0.5px] theme-ink text-[var(--panel-heading,#262626)] md:text-[72px]">
                    {tier.price}
                  </p>
                </div>
                <ul className="ml-[30px] list-disc font-sans text-xl leading-[1.5] theme-ink text-[var(--panel-body,#4A4A4A)] md:ml-9 md:text-2xl">
                  {tier.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex">
                {/* Figma sets this label at 18px mobile / 20px desktop; the Button ships 16/18 */}
                <Button
                  booking
                  href={content.cta.href}
                  className="[&>span]:text-lg [&>span]:tracking-[-1px] md:[&>span]:text-xl md:[&>span]:leading-[25px]"
                >
                  {content.cta.label}
                </Button>
              </div>
            </div>
          ))}
        </InView>
      </div>
    </section>
  )
}
