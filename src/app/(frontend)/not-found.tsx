import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Page not found | Laly Agency',
  robots: { index: false },
}

// Rendered inside the frontend layout, so the header, footer and booking dialog are all here.
// Static on purpose: the hero's entry classes wait on the loader, and a 404 should not.
export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] w-full flex-col items-center justify-center border-b border-[#544D49] bg-[#fffcf9] px-5 pt-[156px] pb-24 text-center sm:px-10 md:pt-[124px]">
      <p className="font-mono text-sm uppercase leading-[1.4] tracking-[0.2em] text-[#867A72] md:text-lg">
        [ 404 ]
      </p>
      <h1 className="mt-6 font-display text-[44px] font-normal leading-[1.1] tracking-tight text-[#262626] md:text-7xl md:font-medium md:leading-none">
        This page wandered off.
      </h1>
      <p className="mx-auto mt-5 max-w-[520px] font-sans text-xl leading-[1.25] tracking-[-0.01em] text-[#4A4A4A] md:mt-6 md:text-[28px]">
        The link may be old, or the address mistyped.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" href="/">
          BACK HOME
        </Button>
        <Button variant="outline" booking>
          BOOK A CALL
        </Button>
      </div>
    </section>
  )
}
