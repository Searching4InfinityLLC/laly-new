'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'
import type { CSSProperties } from 'react'
import { MediaImage } from '@/components/Media/Image'
import type { MediaDoc } from '@/lib/types'

const STAGGER = 0.05 // per-slide, left->right

// Slide heights from the className below; width is whatever the aspect makes it.
const SLIDE_H = { mobile: 240, md: 340, '3xl': 476 }

const slideSizes = ({ width, height }: MediaDoc) => {
  const w = (h: number) => Math.ceil(h * (width / height))
  return `(max-width: 1151px) ${w(SLIDE_H.mobile)}px, (min-width: 1920px) ${w(SLIDE_H['3xl'])}px, ${w(SLIDE_H.md)}px`
}

// Continuous auto-scrolling image strip (Embla + auto-scroll). Slides fade in (opacity only — no
// transform, so it won't fight Embla's loop transforms), staggered left->right. The fade is gated on
// <html class="preloader-done"> (see .entry-fade in styles.css) so it starts when the curtain closes
// of the hero; Embla takes over scrolling once it hydrates.
// Pause = press and hold (pointerDown), resume on release: stopOnMouseEnter off so hover does
// nothing, stopOnInteraction off so the plugin re-plays once the drag settles instead of staying dead.
export function ImageMarquee({ slides }: { slides: MediaDoc[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true, align: 'start' }, [
    AutoScroll({ speed: 0.8, startDelay: 0, stopOnInteraction: false, stopOnMouseEnter: false }),
  ])

  // duplicated so the loop fills wide viewports seamlessly
  const rendered = [...slides, ...slides]

  return (
    <div ref={emblaRef} className="cursor-grab overflow-hidden active:cursor-grabbing">
      <div className="flex">
        {rendered.map((media, i) => (
          <div
            key={i}
            // full-bleed both edges — only the first slide carries the section's inset, so the
            // strip reads as aligned at rest and runs off both sides once it scrolls
            className={`entry-fade relative shrink-0 ${i === 0 ? 'pl-5 md:pl-12' : 'pl-3 3xl:pl-6'}`}
            style={{ '--slide-delay': `${i * STAGGER}s` } as CSSProperties}
          >
            {/* Slides are h-fixed / w-auto, so box width = height * aspect and every slide differs:
                Bus (1.78) renders 846px at 3xl where Shirt (0.67) renders 317px. One shared `sizes`
                string can't serve both — calibrated for the average, it left the wide slides soft.
                Deriving it per slide from the source aspect makes every one exact. */}
            {/* No `eager`: it fetched all 7 slides at parse time, in the hero, against LCP. Native
                lazy still loads whatever is on screen immediately, and auto-scroll runs at 0.8px a
                frame — slow enough that the lazy preload margin covers slides before they arrive. */}
            <MediaImage
              media={media}
              sizes={slideSizes(media)}
              className="h-[250px] w-auto md:h-[340px] 3xl:h-[476px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
