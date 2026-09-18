import type { CSSProperties } from 'react'
import { themed } from '@/lib/palettes'

// The three product mocks at the foot of the "How We Help" cards (Figma 3320:4238, 3323:4314,
// 3325:4412). Pure DOM, not flat exports: every one of them is chips, bars and pills — boxes with
// text in them — so an export would be a screenshot of markup we'd have to write anyway, and it
// would go soft on a retina phone.
//
// All three are illustrations of the case study above them, not content: aria-hidden at the root,
// and the card's own two paragraphs already say what they say. Nothing here is in the CMS.
//
// Which widget a card gets comes from its position in the row, the same rule HELP_ACCENTS follows —
// the design draws one specific mock per column, so it is layout, not a field.
//
// Dark theme (Figma 3503:3609): every colour below that changes is a themed(light, dark) pair on the
// section's own --section-dark-progress, so the mocks fade with the ground instead of snapping.
// Icons swap to recoloured twins in /development/icons/dark, cross-faded on the same clock.
//
// ponytail: fixed px type rather than container queries. The widget is ~250px in the desktop column
// and ~300px full-bleed on a phone; the CallsWidget cqw treatment exists because that mock goes from
// 471px to full-bleed, which is a different problem.


// The faint inset glow the dark frame gives every chip; nothing on the light ground.
const CHIP_GLOW: CSSProperties = {
  boxShadow: `inset 0 -35px 15px 0 ${themed('rgba(247,241,238,0)', 'rgba(247,241,238,0.1)')}`,
}

// One shared leaf for the exported icons. Sized on the element rather than in a class: the sizes are
// the design's own odd numbers (10, 12, 14.294, 16, 22) and Tailwind can't see through an
// interpolated arbitrary value.
function Icon({ name, size }: { name: string; size: number }) {
  return (
    <span className="grid shrink-0" style={{ width: size, height: size }}>
      {(['', 'dark/'] as const).map((dir) => (
        <img
          key={dir}
          src={`/development/icons/${dir}${name}.svg`}
          alt=""
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            gridArea: '1 / 1',
            opacity: dir ? 'var(--section-dark-progress, 0)' : 'calc(1 - var(--section-dark-progress, 0))',
          }}
          className="block"
        />
      ))}
    </span>
  )
}

// The panel every widget sits in: 9.529px radius, a translucent lift off the card's own wash, the
// drop shadow, and the inset glow along the bottom edge that lifts it off the gradient.
function Panel({
  children,
  // card 2 sits on the strongest wash of the three and needs more ground behind it to stay legible
  ground = 'rgba(255,252,249,0.4)',
  className = '',
}: {
  children: React.ReactNode
  ground?: string
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`relative w-full overflow-clip rounded-[9.529px] shadow-[0_1.588px_3.176px_1.588px_rgba(134,122,114,0.2)] ${className}`}
    >
      {/* the dark frame drops the lift and the bottom glow: the panel is glass, clear to the wash */}
      <div className="absolute inset-0 rounded-[inherit]" style={{ backgroundColor: themed(ground, 'rgba(255,252,249,0)') }} />
      <div className="relative">{children}</div>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: `inset 0 -35px 15px 0 ${themed('rgba(247,241,238,0.34)', 'rgba(247,241,238,0)')}` }}
      />
    </div>
  )
}

// --- 1. Booking (3320:4238) ------------------------------------------------------------------
// The client's own booking flow, the thing the third-party platform was charging for.

// Selected day/time share one gradient; #A490A3 is not a token — it is the swatch on the instance.
const LILAC_FILL = 'bg-gradient-to-b from-[#A490A3] to-[#CBB1C9] text-[#FCF7F3]'
const LILAC_IDLE: CSSProperties = {
  backgroundColor: themed('#F6EEF5', 'rgba(246,238,245,0.08)'),
  color: themed('#544D49', '#F7F1EE'),
}

const DAYS = [
  { day: 'Tue', date: '14' },
  { day: 'Wed', date: '15' },
  { day: 'Thu', date: '16' },
  { day: 'Fri', date: '17' },
]
const TIMES = ['10:00 AM', '1:30 PM', '3:30 PM']

export function BookingWidget() {
  return (
    <Panel className="p-6">
      <div className="flex flex-col items-center gap-[18px]">
        <div className="flex w-full items-start gap-2.5">
          <Icon name="calendar-days" size={22} />
          <div className="flex min-w-0 flex-1 flex-col gap-1 tracking-[0.25px]">
            <p className="font-display text-lg font-medium leading-[1.25]" style={{ color: themed('#443B43', '#CBB1C9') }}>
              Schedule a Consultation
            </p>
            <div className="font-display text-xs leading-[1.25]" style={{ color: themed('#544D49', '#CBB1C9') }}>
              <p>Choose a time that works best for you.</p>
              <p>
                Your consultation request is routed directly through the client’s custom booking
                flow.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center gap-4">
          <Icon name="chevron-left" size={12} />
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {DAYS.map(({ day, date }, i) => (
              <div
                key={date}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-md px-2.5 py-2 font-display leading-[1.25] ${
                  i === 2 ? LILAC_FILL : ''
                }`}
                style={i === 2 ? CHIP_GLOW : { ...LILAC_IDLE, ...CHIP_GLOW }}
              >
                <span className="text-[10px] tracking-[-0.25px]">{day}</span>
                <span className="text-xs">{date}</span>
              </div>
            ))}
          </div>
          <Icon name="chevron-right" size={12} />
        </div>

        <div className="flex w-full items-center gap-4 px-1">
          {TIMES.map((time, i) => (
            <div
              key={time}
              className={`flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 font-fira text-[10px] leading-[1.25] ${
                i === 0 ? LILAC_FILL : ''
              }`}
              style={i === 0 ? CHIP_GLOW : { ...LILAC_IDLE, ...CHIP_GLOW }}
            >
              {time}
            </div>
          ))}
        </div>

        <div
          className={`flex w-full items-center justify-center gap-1.5 overflow-clip rounded-md px-3 py-2 ${LILAC_FILL} from-[20%]`}
          style={{ boxShadow: `0 1px 2px 0 rgba(16,24,40,0.04), ${CHIP_GLOW.boxShadow}` }}
        >
          <span className="font-fira text-[10px] leading-[1.25] tracking-[-1px]">
            Confirm booking
          </span>
          <Icon name="arrow-right" size={10} />
        </div>
      </div>
    </Panel>
  )
}

// --- 2. Lead sources (3323:4314) -------------------------------------------------------------
// The bar chart that became the analytics dashboard every client now gets.

// Figma draws the four bars at 175/85/147/115px against a 177px track, so these are percentages of
// the longest one rather than widths — the column is 250px at 1440 and full-bleed on a phone.
const SOURCES = [
  { label: 'Google', pct: 100 },
  { label: 'Instagram', pct: 48.6 },
  { label: 'Referral', pct: 84 },
  { label: 'Other', pct: 65.7 },
]

export function LeadSourcesWidget() {
  return (
    <Panel ground="rgba(255,252,249,0.7)" className="p-6">
      <div className="flex flex-col items-start gap-[18px]">
        <div className="flex w-full items-center justify-between">
          <p className="font-display text-lg font-medium leading-[1.4] tracking-[-0.4px]" style={{ color: themed('#57570F', '#CACA86') }}>
            Lead Sources
          </p>
          <div className="flex items-start gap-0.5">
            {/* Inter on the instance — the one place in the file the designer left the default UI
                face. Rendered in the display face rather than pulling a fourth webfont for 9px of
                decorative chrome. */}
            <span className="font-display text-[9.529px] font-medium leading-[14.294px]" style={{ color: themed('#807F0D', '#CACA86') }}>
              Last 30 days
            </span>
            <Icon name="chevron-down" size={14.294} />
          </div>
        </div>

        <div className="flex w-full flex-col justify-center gap-2">
          {SOURCES.map(({ label, pct }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-[61px] shrink-0 font-display text-xs leading-[1.25] tracking-[0.25px]" style={{ color: themed('#544D49', '#CACA86') }}>
                {label}
              </span>
              {/* the track, so every bar is a percentage of the same box */}
              <div className="min-w-0 flex-1">
                <div
                  className="h-[22px] rounded bg-gradient-to-b from-[rgba(202,202,134,0.63)] to-[rgba(162,161,28,0.63)]"
                  style={{ width: `${pct}%`, ...CHIP_GLOW }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          {/* Figma ships this rule as a 0.5px stroked path; a border is the same hairline */}
          <div className="h-px w-full border-t-[0.5px] border-[#807F0D]" />
          <div
            className="flex w-full items-center gap-1.5 overflow-clip rounded-md px-1 py-1.5"
            style={{
              backgroundColor: themed('#EEEECD', 'rgba(238,238,205,0.18)'),
              boxShadow: `0 1px 2px 0 rgba(16,24,40,0.04), ${CHIP_GLOW.boxShadow}`,
            }}
          >
            <div className="flex items-center justify-center rounded-[3.2px] bg-[#EBEBA3] p-0.5">
              <Icon name="trending-up" size={16} />
            </div>
            <div className="flex flex-col gap-0.5 text-center font-fira tracking-[-1px]">
              <span className="text-xs leading-[1.25]" style={{ color: themed('#313008', '#DDDCB1') }}>107 total leads</span>
              <span className="text-[8px] leading-[1.25]" style={{ color: themed('#807F0D', '#DDDCB1') }}>
                +24% from previous period
              </span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}

// --- 3. Smart intake (3325:4412) -------------------------------------------------------------
// Sources on the left, the router in the middle, the two destinations on the right.

function IntakeTile({ icon, size, lines }: { icon: string; size: number; lines: string[] }) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-2 rounded p-1"
      style={{ backgroundColor: themed('#FCF1E0', 'rgba(252,241,224,0.09)'), ...CHIP_GLOW }}
    >
      <div
        className="flex items-center justify-center rounded-[3.2px] p-0.5"
        style={{ backgroundColor: themed('#FAE3C1', 'rgba(247,214,161,0.42)') }}
      >
        <Icon name={icon} size={size} />
      </div>
      <p
        className="text-center font-display text-[10px] leading-[1.25] tracking-[0.25px]"
        style={{ color: themed('#544D49', '#FAE3C1') }}
      >
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </div>
  )
}

export function IntakeWidget() {
  return (
    <Panel className="px-3 py-6">
      <div className="flex w-full items-center justify-center gap-[18px]">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <IntakeTile icon="phone" size={12} lines={['Calls']} />
          <IntakeTile icon="window" size={16} lines={['Website leads']} />
          <IntakeTile icon="dots-horizontal" size={16} lines={['Other']} />
        </div>

        <div
          className="flex shrink-0 flex-col items-center justify-center gap-1.5 overflow-clip rounded-md px-1 py-1.5"
          style={{
            backgroundColor: themed('#FCF1E0', 'rgba(252,241,224,0.09)'),
            boxShadow: `0 1px 2px 0 rgba(16,24,40,0.04), ${CHIP_GLOW.boxShadow}`,
          }}
        >
          <div className="flex w-[89px] flex-col items-center justify-center gap-1.5 text-center font-fira tracking-[-1px]">
            <span className="text-xs leading-[1.25]" style={{ color: themed('#313008', '#FCF1E0') }}>
              Smart
              <br />
              Intake
            </span>
            <span className="h-px w-[22px] border-t-[0.5px] border-[#AE8340]" />
            <span className="text-[8px] leading-[1.25]" style={{ color: themed('#614A28', '#FCF1E0') }}>
              Sorts, filters, and routes automatically
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <IntakeTile icon="users" size={12} lines={['Low-priority', 'inquiries']} />
          <IntakeTile icon="user" size={16} lines={['High-value', 'leads']} />
        </div>
      </div>
    </Panel>
  )
}

// Column order is the design's: booking, lead sources, intake. Cycles, so a fourth card would start
// over rather than render nothing.
export const HELP_WIDGETS = [BookingWidget, LeadSourcesWidget, IntakeWidget] as const
