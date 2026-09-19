import { Icon } from '@/components/Icon'
import { MediaImage } from '@/components/Media/Image'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { Button } from '@/components/ui/Button'
import { InView } from '@/components/ui/InView'
import { Typewriter } from '@/components/ui/Typewriter'
import type { ContactContent } from '@/lib/types'

// "Contact" — brand-pink closing section. Oversized display heading with the team photo tucked
// behind its right edge.
//
// Bracket always animates like every other section. Dev panel can fade heading/photo/CTA up.
export default function Contact({ content }: { content: ContactContent }) {
  const { label, heading, buttons, socials, photo, photoMobile } = content
  // Only accounts that exist. An icon with no href used to fall back to href="#" in a new tab —
  // tapping Instagram opened a second copy of this page.
  const linked = socials.filter((s) => s.href)

  return (
    <section
      aria-label="Contact"
      // Figma: 48 top / 64 bottom / 20 sides mobile; 112 top+bottom / 160 sides desktop
      className="w-full overflow-hidden bg-[#ff6d6a] pt-12 pb-16 md:py-28"
    >
      {/* flex column + `order` so ONE photo node serves both layouts: on mobile it flows between the
          CTAs and the socials (order-1), at md+ it leaves the flow entirely and hangs off the
          container's right edge, overlapping the heading. */}
      {/* mobile is four blocks 32 apart: caption / heading+CTA / photo / socials. The heading and
          its CTA are one block, so they're wrapped — the wrapper goes `display:contents` at md+,
          leaving the desktop layout (absolute photo, per-child margins) exactly as it was. */}
      {/* the photo is absolute against this box, so the shell cap pulls it in with the copy
          instead of leaving it stranded at the viewport edge */}
      <InView className="section-shell relative flex flex-col gap-8 px-5 text-center sm:px-10 md:gap-0 md:px-40">
        <BracketLabel className="mx-auto w-44 text-[#262626] md:mb-12 md:w-80">
          {label}
        </BracketLabel>

        <div className="flex flex-col gap-6 md:contents">

        {/* display-2: Neue Haas 65 Medium (w500), 200px / 90% / -6px tracking, uppercase, #151414.
            -6px at 200px == -0.03em, so the tracking scales with every step of the size ladder.
            Size steps down by container width — 200px only fits once the frame is at Figma's 1120.
            Mobile runs big enough to wrap to three lines (GROW / WITH / US.) like the design. */}
        <Typewriter
          text={heading}
          // mobile: 122px / 500 / 90% / -6px tracking (not -0.03em — that's the desktop ratio).
          // "GROW" runs ~2.75em wide, so 122px needs a 336px column: phones under ~390 clipped the
          // G and W against the section's overflow. Below that it scales to the column (98px at 320).
          className="section-media-reveal relative z-10 font-display text-[length:min(122px,calc((100vw-40px)/2.85))] font-medium uppercase leading-[0.9] tracking-[-6px] text-[#151414] md:text-[140px] md:tracking-[-0.03em] xl:text-[188px] 3xl:text-[200px]"
        />

        <div className="section-media-reveal flex justify-center md:mt-12 3xl:mt-14">
          {/* scramble-on-hover uses Button's default solid-button treatment. */}
          {/* instance-only sizing, the shared Button keeps its own numbers:
              mobile  = 8.69 / 6.51 padding, 16px label, Drop shadow 0 1.09 2.17 @4%
              desktop = Large/Tertiary — 13.02 / 9.77 padding, 32px label, 0 3.26 9.77 @6% */}
          {/* no scramble (client note: no hover effects on this button) */}
          <Button
            variant="solid"
            booking
            scramble={false}
            href={buttons[1].href}
            className="bg-[#151414]! px-[8.69px]! py-[6.51px]! shadow-[0_1.09px_2.17px_0_rgba(16,24,40,0.04)]! md:px-[13.02px]! md:py-[9.77px]! md:shadow-[0_3.26px_9.77px_0_rgba(16,24,40,0.06)]! md:[&>span]:text-[32px]! md:[&>span]:leading-[40px]!"
          >
            {buttons[1].label}
          </Button>
        </div>
        </div>

        {/* team photo — tilted, overlapping the heading at md+. Two crops: landscape below md,
            portrait at md+ (the frame's aspect flips, so one file can't serve both).
            md top offset clears the bracket label, which is now a flex sibling rather than above. */}
        <div className="section-media-reveal order-1 z-0 h-[248px] w-full overflow-hidden md:rotate-2 md:absolute md:right-[180px] md:top-12 md:order-none md:mt-0 md:aspect-auto md:h-[330px] md:w-[280px] 3xl:top-14 3xl:h-[400px] 3xl:w-[340px]">
          <MediaImage
            media={photoMobile}
            sizes="100vw"
            className="h-full w-full object-cover md:hidden"
          />
          <MediaImage
            media={photo}
            sizes="(min-width: 1920px) 340px, 280px"
            className="hidden h-full w-full object-cover md:block"
          />
        </div>

        {/* socials — icons are 32x32 as drawn; last in both layouts (order-2 keeps them under the
            photo on mobile, where the photo is order-1) */}
        {linked.length > 0 && (
          <div className="section-media-reveal order-2 flex items-center justify-center gap-4 md:mt-12">
            {linked.map((s) => (
              <a
                key={s.platform}
                href={s.href}
                aria-label={s.platform}
                target="_blank"
                rel="noreferrer"
                className="group"
              >
                {/* svgs ship with #151414 baked in — ring (rect stroke) and glyph (path fill) are
                    both repainted here; CSS outranks a presentation attribute.
                    hover fills the ring instead of fading it: rect gets fill + stroke #292624 and
                    the glyph flips to #E7DCD4, so the icon inverts rather than dimming.
                    fill-transparent on the rect is load-bearing: the svg root is fill="none" and
                    `none` is not a color, so it SNAPS to the dark fill instead of fading. transparent
                    is rgba(0,0,0,0), which interpolates.
                    300/ease-out rather than the 150ms default — at 150 the glyph crossing #292624 to
                    #E7DCD4 reads as a flicker through the mid-greys instead of a fade. */}
                <Icon
                  name={s.platform}
                  className="h-8 w-8 [&_*]:transition-colors [&_*]:duration-300 [&_*]:ease-out [&_rect]:fill-transparent [&_rect]:stroke-[#292624] [&_path]:fill-[#292624] group-hover:[&_rect]:fill-[#292624] group-hover:[&_path]:fill-[#E7DCD4]"
                />
              </a>
            ))}
          </div>
        )}
      </InView>
    </section>
  )
}
