#!/usr/bin/env node
/**
 * AlphaRank — Supabase Migration Script
 *
 * Usage:
 *   node scripts/migrate.mjs <DB_PASSWORD>
 *
 * The DB password is the one you set when creating your Supabase project.
 * Find it at: https://supabase.com/dashboard/project/riojawpvqawvillemios/settings/database
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const password = process.argv[2];

if (!password) {
  console.error('\n❌  Usage: node scripts/migrate.mjs <DB_PASSWORD>\n');
  console.error('  Find your DB password at:');
  console.error('  https://supabase.com/dashboard/project/riojawpvqawvillemios/settings/database\n');
  process.exit(1);
}

const CONNECTION = `postgresql://postgres.riojawpvqawvillemios:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

const sql = postgres(CONNECTION, { ssl: 'require', max: 1 });

const migrationSQL = readFileSync(
  join(__dir, '../supabase/migrations/001_initial.sql'),
  'utf8'
);

async function run() {
  console.log('\n🔌  Connecting to Supabase...');
  try {
    await sql`SELECT 1`;
    console.log('✓  Connected\n');

    console.log('📦  Running migration: 001_initial.sql');
    await sql.unsafe(migrationSQL);
    console.log('✓  Migration complete!\n');

    // Verify tables were created
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('✓  Tables created:');
    tables.forEach(t => console.log('    -', t.table_name));
    console.log();

  } catch (err) {
    console.error('\n❌  Migration failed:', err.message, '\n');
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
