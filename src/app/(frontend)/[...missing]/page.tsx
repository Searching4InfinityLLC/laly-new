import { notFound } from 'next/navigation'

// Any URL no other route claims lands here, only to hand it to (frontend)/not-found.tsx. Without it
// an unknown path fell through to Next's bare default 404: the app has two root layouts (frontend,
// payload) and no top-level one, so there is no app-wide not-found to catch it. Static routes and
// (payload)'s /admin and /api catch-alls are all more specific, so they still win.
export default function Missing() {
  notFound()
}
