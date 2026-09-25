'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type SectionTone = 'cream' | 'dark' | 'white'

// How far into the viewport a section has to come before its light/dark boundary trips: its top
// edge past (100 - 35)% of the section's own height, capped at the screen. Chosen with the review
// selector that used to sit bottom-left; that selector is gone and this is the signed-off value.
const INTERSECTION = 0.35
// The fixed navbar's height (header h-19). The bar only takes the dark theme once the sequence has
// scrolled up under it, so a sequence that opens dark (/careers) leaves the bar cream over the hero.
const BAR = 76

export type ThemeSection = {
  id: string
  tone: SectionTone
  texture?: 'grid'
  content: ReactNode
}

// Home keeps its named slots; service pages supply their post-scratch section sequence.
export function SectionTheme({ before, after, returnToLight, contact }: {
  before: ReactNode
  after: ReactNode
  returnToLight: ReactNode
  contact: ReactNode
}) {
  return <SectionThemeSequence sections={[
    { id: 'who-we-are', tone: 'cream', content: before },
    { id: 'strategy', tone: 'dark', content: after },
    { id: 'about', tone: 'white', content: returnToLight },
  ]} contact={contact} />
}

// Only light/dark boundaries change the shared theme. Adjacent sections with matching tones
// keep it, even when a short viewport never shows half of a tall section at once.
// The last section also goes black as Contact arrives ("black above Contact").
export function SectionThemeSequence({ sections, contact }: {
  sections: ThemeSection[]
  contact: ReactNode
}) {
  const container = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<SectionTone>(sections[0]?.tone ?? 'cream')
  const [contactReached, setContactReached] = useState(false)
  const [underBar, setUnderBar] = useState(false)

  useEffect(() => {
    const root = container.current
    const contactEl = contactRef.current
    if (!root || !contactEl) return
    const elements = Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-section-tone]'))
    let frame = 0
    const reached = (section: HTMLElement) => {
      const { top, height } = section.getBoundingClientRect()
      return top <= window.innerHeight - Math.min(height, window.innerHeight) * INTERSECTION
    }
    const update = () => {
      frame = 0
      let tone = sections[0]?.tone ?? 'cream'
      elements.forEach((element, index) => {
        if (index === 0) return
        const next = sections[index].tone
        const previous = sections[index - 1].tone
        if ((next === 'dark') !== (previous === 'dark') && reached(element)) tone = next
      })
      setPhase(tone)
      setContactReached(reached(contactEl))
      setUnderBar(root.getBoundingClientRect().top <= BAR)
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
  }, [sections])

  return (
    <>
      <div ref={container} className="section-theme" data-theme={phase === 'dark' ? 'dark' : 'light'} data-ground={phase} data-under-bar={underBar || undefined}>
        {sections.map((section, index) => (
          <div
            key={section.id}
            data-section-tone={section.tone}
            className={`section-theme-content${section.texture === 'grid' ? ' theme-grid' : ''}${index === sections.length - 1 ? ' contact-theme' : ''}`}
            data-contact-theme={index === sections.length - 1 && contactReached ? 'black' : 'current'}
          >
            {section.content}
          </div>
        ))}
      </div>
      <div ref={contactRef}>{contact}</div>
    </>
  )
}
