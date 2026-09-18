'use client'

import type { VideoHTMLAttributes } from 'react'

// React leaves `muted` out of server HTML (facebook/react#10389), so iOS Safari parses an
// unmuted autoplay video and refuses to start it; hydration sets the property but never retries.
// Force muted + play() once mounted. Low Power Mode still blocks it — the poster shows then.
export function AutoplayVideo(props: VideoHTMLAttributes<HTMLVideoElement>) {
  return (
    <video
      {...props}
      autoPlay
      loop
      muted
      playsInline
      ref={(el) => {
        if (!el) return
        el.muted = true
        el.play().catch(() => {})
      }}
    />
  )
}
