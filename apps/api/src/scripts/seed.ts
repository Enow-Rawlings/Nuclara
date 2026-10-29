/**
 * Seed runner — applies SQL seed files from database/seed/ in filename order.
 *
 * ⚠️  DEVELOPMENT ONLY. Never run against a production database.
 *
 * Usage:
 *   pnpm --filter api seed
 *
 * Seed files are idempotent (use ON CONFLICT DO NOTHING) so they can be
 * re-run safely without duplicating data.
 */

import 'dotenv/config'
import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'

const DATABASE_URL = process.env.DATABASE_URL
const NODE_ENV = process.env.NODE_ENV ?? 'development'

if (!DATABASE_URL) {
  console.error('[seed] DATABASE_URL environment variable is required')
  process.exit(1)
}

if (NODE_ENV === 'production') {
  console.error('[seed] ✗ Seed script must NOT run in production. Aborting.')
  process.exit(1)
}

async function run() {
  const { default: pg } = await import('pg')
  const client = new pg.Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()
    console.log(`[seed] Connected to database (${NODE_ENV})`)
    console.log('[seed] ⚠️  Demo data is for development only. Never publish to production.')

    const seedDir = resolve(process.cwd(), '../../database/seed')
    const files = (await readdir(seedDir))
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const sql = await readFile(join(seedDir, file), 'utf-8')
      console.log(`[seed] → Applying: ${file}`)

      try {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query('COMMIT')
        console.log(`[seed] ✓ Done: ${file}`)
      } catch (err) {
        await client.query('ROLLBACK')
        console.error(`[seed] ✗ Failed on: ${file}`, err)
        process.exit(1)
      }
    }

    console.log(`[seed] All ${files.length} seed file(s) applied successfully.`)
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('[seed] Unexpected error:', err)
  process.exit(1)
})
