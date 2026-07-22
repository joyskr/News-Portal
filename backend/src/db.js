import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

function sslConfig() {
  if (process.env.PGSSLMODE === 'disable') return false;
  if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('railway')) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig(),
});

export async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to start the API.');
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const schema = await fs.readFile(path.join(__dirname, '../db/schema.sql'), 'utf8');
  await pool.query(schema);
}

export async function query(text, params) {
  return pool.query(text, params);
}
