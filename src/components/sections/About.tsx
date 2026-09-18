import { TeamCarousel } from '@/components/TeamCarousel'
import { BracketLabel } from '@/components/ui/BracketLabel'
import { InView } from '@/components/ui/InView'
import type { AboutContent } from '@/lib/types'

// "About us" — cream ground, same copy stack as the other sections. Bracket always animates; dev
// panel can fade the rest up.
// The desc sits tight under the heading here (Figma has them nearly touching), unlike WhoWeAre.
export default function About({ content }: { content: AboutContent }) {
  const { label, heading, description, members, story } = content

  return (
    <section
      aria-label="About us"
      // Figma desktop: 112 top+bottom, 160 sides, ground #FFFCF9
      className="about-section w-full bg-[#fffcf9] py-16 md:py-28"
    >
      {/* two gaps, not one: 32 from the caption down to the copy, 24 from the copy down to the
          carousel. The shell carries the 24 and the caption pays the extra 8 itself. */}
      <InView className="section-shell flex flex-col px-5 text-center sm:px-10 md:gap-6 md:px-40">
        <BracketLabel className="theme-label mx-auto mb-5 w-44 text-[var(--section-label,#867A72)] md:mb-2 md:w-80">
          {label}
        </BracketLabel>

        <div>
        {/* heading/h1/xl — Neue Haas 55 Roman / 64 / 110% / -1px, capped at Figma's 600 so the
            two-line break is the layout's, not the viewport's. Flat above md: the old 60->72 ladder
            was drawn against the taller card and read oversized on a laptop. */}
        <h2 className="theme-ink section-text-reveal mx-auto max-w-[600px] font-display text-[40px] font-normal leading-none tracking-tight text-[var(--section-heading,#262626)] md:text-[64px] md:leading-[1.1] md:tracking-[-1px]">
          {heading.split('\n').map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        {/* 24 under the heading — was 16, and now matches the other sections after all */}
        {/* body-2/xl — New Spirit 400 / 24 / 125% / letter-spacing 0 / #4A4A4A, centred.
            Two lines are the design, and the break is authored, exactly as Figma has it — the field
            is a textarea, so it is a real \n in the doc. A width cap was the wrong tool: guessing a
            number between "…to nurture" and the full sentence puts the fold at the mercy of the
            font metrics, and it moves the moment the copy is edited.
            md+ only. At mobile's 20px the first line alone overflows a 375 screen, so small screens
            ignore the break and wrap against the 620 cap instead. */}
        <p className="theme-ink section-text-reveal mx-auto mt-4 max-w-[620px] font-sans text-xl font-normal leading-[1.25] tracking-[-0.01em] text-[var(--section-body,#4A4A4A)] md:mt-6 md:whitespace-pre-line md:text-2xl md:tracking-normal">
          {description}
        </p>
        </div>

        <TeamCarousel members={members} story={story} />
      </InView>
    </section>
  )
}
