import type { OurMethodContent } from '@/lib/types'

// Figma 3318:2717 — the dark band under "How We Help": label and heading, then four full-bleed rows,
// each one an adjective for the way we build.
//
// No description paragraph, though the frame draws one under the heading: cut on review. The rows
// already make the case, and the sentence above them only restated it — so it is gone from the
// block too, not just hidden, leaving nothing in /admin that renders nowhere.
//
// The row is a two-column split at 1440 — number and adjective on the left half, the paragraph on
// the right — and the adjective sits hard against the gutter because its half is justify-between.
// The phone (3332:4906) unpacks all three into one left-aligned column on an 8px rhythm: number,
// adjective at 40px, paragraph.
//
// The number is the row's position, not a field: "1—", "2—" and so on, so an editor reordering the
// rows renumbers them rather than leaving a 3 above a 2.
//
// Hover (frames OurMethod-Hover / -Hover-2): pointing at a row tints its adjective lilac and drops
// every other row to 60%. Read the other way round, the LIST dims on hover and the pointed-at row
// stays — two selectors in styles.css (.method-list / .method-row), so nothing here is stateful and
// this stays a server component. Off on touch, which is also what the mobile frame draws.
export default function OurMethod({ content }: { content: OurMethodContent }) {
  const { label, heading, steps } = content

  return (
    <section
      aria-label="Our method"
      // Figma frame: py 112, 48 on the phone (3332:4900); the rows set their own 40 at both
      // widths. #151414 is the darkest ground on the site — a step under the hero's #292624, so the
      // band reads as a floor under it.
      // .grain-ground (styles.css): #151414 under the site's dark grain tile — see there.
      className="grain-ground relative w-full overflow-hidden py-12 md:py-28"
    >

      <div className="relative flex flex-col items-center gap-10">
        {/* Figma: px 208 at 1440, 20 on the phone, inside the shell so it stops growing past 1600. */}
        <div className="section-shell flex w-full flex-col gap-6 px-5 text-center md:px-52">
          {/* Brackets authored here rather than <BracketLabel>, same as the hero and How We Help:
              that component spreads its brackets to the row's edges and this label hugs the words. */}
          <p className="font-mono text-sm font-normal uppercase leading-[1.4] tracking-[1px] text-[#FF6D6A] md:text-2xl">
            [ {label} ]
          </p>

          <h2 className="font-display text-[40px] font-normal leading-[1.1] tracking-[-1px] text-[#FFFCF9] md:text-[64px]">
            {heading.split('\n').map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        {/* Full-bleed: the rules run the whole 1440, so this row list is outside the shell.
            .method-list / .method-row carry the hover state — styles.css, and see the note above. */}
        <ol className="method-list flex w-full flex-col border-b border-[#292624]">
          {steps.map((step, i) => (
            <li
              key={step.title}
              // Figma draws every row with a top AND a bottom rule at both widths; drawn that way
              // they'd double up between rows, so the rule is the top one and the list carries the
              // closing edge. Padding is 40 either way — only the sides shrink on a phone.
              className="method-row flex w-full flex-col gap-2 border-t border-[#292624] px-5 py-10 md:flex-row md:items-center md:gap-16 md:p-10"
            >
              <div className="flex min-w-0 flex-1 flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-6">
                <span
                  aria-hidden
                  className="shrink-0 font-display text-xl leading-[1.25] tracking-[0.25px] text-[#BAA99E]"
                >
                  {i + 1}—
                </span>
                {/* 75 Bold against the 55 Roman everything else on the page is set in — the one
                    place the display face goes bold, and what makes the column read as a list of
                    claims rather than headings. */}
                <h3 className="font-display text-[40px] font-bold leading-[1.1] tracking-[-1px] text-[#F7F1EE] md:text-5xl">
                  {step.title}
                </h3>
              </div>

              <p className="min-w-0 flex-1 font-display text-base font-normal leading-[1.25] tracking-[0.25px] text-[#FCF7F3] opacity-85 md:text-lg">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
