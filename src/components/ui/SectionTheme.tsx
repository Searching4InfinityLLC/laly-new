'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

// 'focus' = the first section sits black as it approaches and fades to its own light tone once it
// crosses the intersection line; the section above Contact also goes black as Contact arrives
// (black's behaviour). The default wherever it is offered.
// 'current' ("True color") = every section keeps its authored tone. black/pink recolour only the
// section above Contact.
// 'focus-scratch' = focus, plus the scratch band above the sequence inverted until it reaches the
// same line (ScratchCover reads this off <html data-scroll-theme>).
type ContactVariant = 'focus' | 'focus-scratch' | 'current' | 'black' | 'pink'
type SectionTone = 'cream' | 'dark' | 'white'

const INTERSECTION_PERCENTAGES = [20, 25, 30, 35, 40, 45, 50, 55, 60] as const

export type ThemeSection = {
  id: string
  tone: SectionTone
  texture?: 'grid'
  content: ReactNode
}

// Home keeps its named slots; service pages supply their post-scratch section sequence.
export function SectionTheme({ before, after, returnToLight, contact, focusFirst }: {
  before: ReactNode
  after: ReactNode
  returnToLight: ReactNode
  contact: ReactNode
  focusFirst?: boolean
}) {
  return <SectionThemeSequence sections={[
    { id: 'who-we-are', tone: 'cream', content: before },
    { id: 'strategy', tone: 'dark', content: after },
    { id: 'about', tone: 'white', content: returnToLight },
  ]} contact={contact} focusFirst={focusFirst} />
}

// Only light/dark boundaries change the shared theme. Adjacent sections with matching tones
// keep it, even when a short viewport never shows half of a tall section at once.
export function SectionThemeSequence({ sections: authored, contact, focusFirst = false }: {
  sections: ThemeSection[]
  contact: ReactNode
  // offers (and defaults to) the 'focus' variant
  focusFirst?: boolean
}) {
  const container = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const [variant, setVariant] = useState<ContactVariant>(focusFirst ? 'focus' : 'current')
  const sections = authored
  // What the ground is before the first section is reached. Focus holds it black while the first
  // section approaches, so that section reveals itself by fading to its own light tone at the
  // intersection line — the same boundary rule every later section uses. Otherwise it starts on the
  // first section's own tone.
  const focus = variant === 'focus' || variant === 'focus-scratch'
  const lead: SectionTone = focus ? 'dark' : (sections[0]?.tone ?? 'cream')
  const [phase, setPhase] = useState<SectionTone>(lead)
  const [intersectionPercentage, setIntersectionPercentage] = useState(50)
  const [contactReached, setContactReached] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Published for components outside the sequence that follow the same choice (ScratchCover).
  useEffect(() => {
    const { dataset } = document.documentElement
    dataset.scrollTheme = variant
    dataset.intersection = String(intersectionPercentage)
    window.dispatchEvent(new Event('scroll')) // let them re-measure against the new line now
    return () => {
      delete dataset.scrollTheme
      delete dataset.intersection
    }
  }, [variant, intersectionPercentage])

  useEffect(() => {
    const root = container.current
    const contactEl = contactRef.current
    if (!root || !contactEl) return
    const elements = Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-section-tone]'))
    setMounted(true)
    let frame = 0
    const reached = (section: HTMLElement) => {
      const { top, height } = section.getBoundingClientRect()
      return top <= window.innerHeight - Math.min(height, window.innerHeight) * (intersectionPercentage / 100)
    }
    const update = () => {
      frame = 0
      let tone = lead
      elements.forEach((element, index) => {
        const next = sections[index].tone
        const previous = index === 0 ? lead : sections[index - 1].tone
        if ((next === 'dark') !== (previous === 'dark') && reached(element)) tone = next
      })
      setPhase(tone)
      setContactReached(reached(contactEl))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const resize = new ResizeObserver(schedule)
    elements.forEach(element => resize.observe(element))
    resize.observe(root)
    resize.observe(contactEl)
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('pageshow', schedule)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('pageshow', schedule)
    }
  }, [intersectionPercentage, sections, lead])

  return (
    <>
      {mounted && createPortal(
        <div className="theme-preview-selector">
          <label>
            <span>Intersection percentage</span>
            <select
              value={intersectionPercentage}
              onChange={(event) => setIntersectionPercentage(Number(event.target.value))}
            >
              {INTERSECTION_PERCENTAGES.map((percentage) => (
                <option key={percentage} value={percentage}>{percentage}%</option>
              ))}
            </select>
          </label>
          <label>
            <span>Scroll theme</span>
            <select value={variant} onChange={(event) => setVariant(event.target.value as ContactVariant)}>
              {focusFirst && <option value="focus">1 · Focus first + black above Contact</option>}
              {focusFirst && <option value="focus-scratch">2 · Focus + black above Contact + inverted scratch</option>}
              <option value="current">{focusFirst ? 3 : 1} · True color</option>
              <option value="black">{focusFirst ? 4 : 2} · Black above Contact</option>
              <option value="pink">{focusFirst ? 5 : 3} · Pink above Contact</option>
            </select>
          </label>
        </div>,
        document.body,
      )}
      <div ref={container} className="section-theme" data-theme={phase === 'dark' ? 'dark' : 'light'} data-ground={phase}>
        {sections.map((section, index) => (
          <div
            key={section.id}
            data-section-tone={section.tone}
            className={`section-theme-content${section.texture === 'grid' ? ' theme-grid' : ''}${index === sections.length - 1 ? ' contact-theme' : ''}`}
            data-contact-theme={
              index === sections.length - 1 && contactReached && variant !== 'current'
                ? (focus ? 'black' : variant) // focus carries black-above-contact too
                : 'current'
            }
          >
            {section.content}
          </div>
        ))}
      </div>
      <div ref={contactRef}>{contact}</div>
    </>
  )
}
