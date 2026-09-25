import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Roles } from './collections/Roles'
import { Applications } from './collections/Applications'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    // Payload writes to <baseDir>/app/(payload)/admin/importMap.js
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users, Media, Pages, Roles, Applications],
  // No `editor` on purpose. Nothing in src/lib/types.ts is rich text — every field across all six
  // sections is a plain string or textarea — so no richText field exists to need one, and Payload
  // only throws MissingEditorProp when it meets one. @payloadcms/richtext-lexical stays installed but
  // unimported: its ESM build has a circular dependency that bun's loader hits as
  // "Cannot access 'DecoratorNode' before initialization", which killed `bun run seed`. Next's
  // bundler tolerates it, bun doesn't. If a richText field is ever genuinely needed, re-add
  // `editor: lexicalEditor()` AND switch the seed to `payload run` (see package.json seed:node).
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({
    url: process.env.MONGODB_URL || '',
    // Atlas SRV strings carry no database path, so name it explicitly rather than landing in `test`.
    connectOptions: { dbName: 'laly-web' },
  }),
  // Load-bearing: without sharp, uploaded Media docs get width/height = null and ImageMarquee's
  // per-slide `sizes` (height * width/height) becomes NaN.
  sharp,
  // Media lives in Vercel Blob, not on disk. Vercel's filesystem is ephemeral and read-only at
  // runtime, so disk-backed uploads 404 there and new ones fail outright.
  //
  // Unconditional on purpose — NOT gated behind NODE_ENV. Local and Vercel share one Atlas database,
  // so a doc created under disk storage keeps a /api/media/file/... url forever, which Vercel can't
  // serve. One storage backend, one set of urls, everywhere. The cost is that `bun run seed` and any
  // local /admin upload push real bytes to the Blob store; that's the trade for a coherent DB.
  //
  // The store must be Public — next/image fetches these with no auth header, and a private store
  // 401s. Public urls are <id>.public.blob.vercel-storage.com, which next.config.mjs already allows.
  plugins: [
    vercelBlobStorage({
      // Direct Blob urls instead of proxying through /api/media/file. Payload's proxy answers Range
      // requests with 200 (not 206), and iOS Safari won't play a video without a real 206. The url
      // is computed on read, so existing docs switch over with no migration. Media is public anyway.
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  // serverURL deliberately UNSET. Setting it makes Payload emit absolute upload urls
  // (http://localhost:3000/api/media/file/x.webp), which next/image then rejects without a matching
  // remotePatterns entry — and a committed localhost pattern is what ships to prod by accident.
  // Unset -> relative same-origin urls -> zero images config. If this ever gets set, the images
  // config has to change in the same commit.
})
