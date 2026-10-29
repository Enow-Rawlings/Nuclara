/**
 * Migration runner — reads SQL files from database/migrations/ in filename order
 * and executes them against the configured Supabase PostgreSQL database.
 *
 * Usage:
 *   pnpm --filter api migrate
 *
 * This uses the DATABASE_URL directly (not the Supabase client) so it can
 * execute DDL statements that the REST API doesn't support.
 */

import 'dotenv/config'
import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('[migrate] DATABASE_URL environment variable is required')
  process.exit(1)
}

// Dynamic import so tsx can resolve this without pg being in devDeps bundle
async function run() {
  const { default: pg } = await import('pg')
  const client = new pg.Client({ connectionString: DATABASE_URL })

  try {
    await client.connect()
    console.log('[migrate] Connected to database')

    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Get already-applied migrations
    const { rows: applied } = await client.query<{ filename: string }>(
      'SELECT filename FROM _migrations ORDER BY filename'
    )
    const appliedSet = new Set(applied.map((r) => r.filename))

    // Read migration files
    const migrationsDir = resolve(process.cwd(), '../../database/migrations')
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      .sort()

    let ranCount = 0

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[migrate] ✓ Already applied: ${file}`)
        continue
      }

      const sql = await readFile(join(migrationsDir, file), 'utf-8')

      console.log(`[migrate] → Applying: ${file}`)
      await client.query('BEGIN')

      try {
        await client.query(sql)
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`[migrate] ✓ Applied: ${file}`)
        ranCount++
      } catch (err) {
        await client.query('ROLLBACK')
        console.error(`[migrate] ✗ Failed on: ${file}`, err)
        process.exit(1)
      }
    }

    if (ranCount === 0) {
      console.log('[migrate] Database is already up to date.')
    } else {
      console.log(`[migrate] Done — applied ${ranCount} migration(s).`)
    }
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('[migrate] Unexpected error:', err)
  process.exit(1)
})
