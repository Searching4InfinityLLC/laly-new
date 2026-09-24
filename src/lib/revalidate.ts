// The home page is ISR (`export const revalidate = 3600` in src/app/(frontend)/page.tsx), so a save
// in /admin stayed invisible on Vercel until that window lapsed. Worse, ISR is
// stale-while-revalidate: the first request after expiry still serves the OLD html and only then
// rebuilds in the background, so an edit needs the window AND two visits to appear. Refreshing twice
// and seeing nothing change is what reads as "the CMS does not update live" — `next dev` has no such
// cache, which is why localhost always looked correct.
//
// Shape is lifted from sia-cms (src/lib/revalidate/frontendRevalidate.ts), minus its locale fan-out:
// the path set is derived from the saved doc's slug. The hook does NOT call revalidatePath
// directly, even though Payload's admin runs inside this same Next app and could. The HTTP hop is
// what lets scripts/seed-paid.ts purge as well — it drives these same collection hooks from plain
// bun, where next/cache has no store and revalidatePath throws. A fetch works from anywhere.
//
// Secret falls back to PAYLOAD_SECRET, so this needs no new Vercel env var to start working.

function resolveBaseUrl(): string | null {
  const fromEnv =
    // REVALIDATE_BASE_URL is the override that makes `bun run seed` purge production rather than the
    // localhost in .env: REVALIDATE_BASE_URL=https://laly-new.vercel.app bun run seed
    process.env.REVALIDATE_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    // Set by Vercel itself, so a deployed /admin resolves its own origin with nothing configured.
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL

  if (fromEnv) return fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3000'
  return null
}

// A page doc's slug is its route, with 'home' being the one that lives at '/'.
export const pathForSlug = (slug: string): string => (slug === 'home' ? '/' : `/${slug}`)

// Every prerendered route. Media has no way to know which page embeds the file being saved, so it
// purges the lot — four paths, and a purge is cheap next to serving a stale image url.
export const PAGE_SLUGS = ['home', 'paid-advertising', 'branding', 'development', 'careers']

export async function revalidatePages(slugs: string[]): Promise<void> {
  const baseUrl = resolveBaseUrl()
  const secret = process.env.REVALIDATE_SECRET || process.env.PAYLOAD_SECRET
  if (!baseUrl || !secret) return

  // Deduped — a caller passing the same slug twice would otherwise cost a second round trip.
  const paths = [...new Set(slugs.map(pathForSlug))]

  try {
    const res = await fetch(new URL('/api/revalidate', baseUrl).toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret, paths }),
      cache: 'no-store',
    })
    if (!res.ok) console.error('[revalidate] failed:', res.status, await res.text())
  } catch (error) {
    // Never fail the save over a cache purge — the content is already committed at this point, and
    // the ISR window is still there as the backstop.
    console.error('[revalidate] unreachable:', error)
  }
}
