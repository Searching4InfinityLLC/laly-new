// Client-side Meta (Facebook) Pixel helpers. The base snippet lives in MetaPixel.tsx;
// call trackMetaEvent from conversion points (booking success, etc.).

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || ''

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: (...args: unknown[]) => void
  }
}

/** Standard Meta events used on this site. Custom events can still be passed as a string. */
export type MetaStandardEvent =
  | 'PageView'
  | 'Lead'
  | 'Schedule'
  | 'Contact'
  | 'CompleteRegistration'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'

export function trackMetaEvent(
  event: MetaStandardEvent | (string & {}),
  params?: Record<string, unknown>,
) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  if (params) window.fbq('track', event, params)
  else window.fbq('track', event)
}
