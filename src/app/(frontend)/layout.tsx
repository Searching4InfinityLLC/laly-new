import type { Metadata } from 'next'
import { fontVariables } from '@/app/(frontend)/components/Fonts'
import { BookingDialog } from '@/components/booking/BookingDialog'
import { Loader } from '@/components/Loader'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { HeaderGround } from '@/components/HeaderGround'
import { RouteTransition } from '@/components/RouteTransition'
import { SmoothScroll } from '@/components/SmoothScroll'
import './styles.css'

export const metadata: Metadata = {
  title: 'Laly Agency',
  description: 'Laly Agency',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // the anim-* classes pick the shipped animation variant; they were runtime-switchable while the
  // control panel existed, now they're just the chosen pair (see styles.css).
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontVariables} anim-heading-fade anim-sections-media`}
    >
      <head>
        {/* Before first paint, not in SmoothScroll's effect: the intro is laid out at the top of the
            document (Loader.tsx), so a reload that restored mid-page would open with it off screen. */}
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual'" }} />
      </head>
      <body className="relative min-h-screen antialiased font-sans">
        <SmoothScroll />
        <Loader />
        <RouteTransition />
        <HeaderGround />
        <Header />
        {children}
        <Footer />
        {/* One instance for the whole app — every CTA on every page opens this same dialog.
            Last in the body so it is the last thing in the tab order when shut; showModal() puts it
            in the top layer anyway, so DOM order has no bearing on what it paints over. */}
        <BookingDialog />
      </body>
    </html>
  )
}
