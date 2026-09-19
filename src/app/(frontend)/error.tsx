'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

// A render error inside a page. Without this Next shows its white "Application error" screen and
// the header, footer and booking dialog go with it; here only the page body is replaced.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="flex min-h-[70svh] w-full flex-col items-center justify-center border-b border-[#544D49] bg-[#fffcf9] px-5 pt-[156px] pb-24 text-center sm:px-10 md:pt-[124px]">
      <p className="font-mono text-sm uppercase leading-[1.4] tracking-[0.2em] text-[#867A72] md:text-lg">
        [ ERROR ]
      </p>
      <h1 className="mt-6 font-display text-[44px] font-normal leading-[1.1] tracking-tight text-[#262626] md:text-7xl md:font-medium md:leading-none">
        Something broke on our end.
      </h1>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" onClick={reset}>
          TRY AGAIN
        </Button>
        <Button variant="outline" href="/">
          BACK HOME
        </Button>
      </div>
    </section>
  )
}
