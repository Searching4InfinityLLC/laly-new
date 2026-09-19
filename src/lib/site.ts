// The public origin every absolute URL is built from: canonical links, the share image, the sitemap.
// Set NEXT_PUBLIC_SITE_URL in Vercel to the launch domain. The fallback is where laly.agency
// redirects today, so a missing var still yields working absolute URLs rather than localhost.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.laly.agency').replace(/\/$/, '')

// The routes that exist. Shared by the sitemap; add a page here when it ships.
export const ROUTES = ['/', '/paid-advertising', '/branding', '/development'] as const
