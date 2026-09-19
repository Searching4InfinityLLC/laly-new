import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// The link preview for every page (a route can override it with its own opengraph-image). Built at
// build time: the black wordmark on the Contact pink, nothing else — Satori cannot load the site's
// woff2 faces, and a headline set in a fallback font would read as off-brand.
export const alt = 'Laly Agency'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/blacklogo.png')) // 693 x 162
  const src = `data:image/png;base64,${logo.toString('base64')}`
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ff6d6a',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
        <img src={src} width={624} height={146} alt="" />
      </div>
    ),
    size,
  )
}
