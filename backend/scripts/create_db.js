#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const out = {};
  for (const l of lines) {
    const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m) {
      let val = m[2];
      // strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[m[1]] = val;
    }
  }
  return out;
}

async function main() {
  // Use existing env or read backend/.env
  let databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    const envPath = path.resolve(__dirname, '..', '.env');
    const loaded = parseEnvFile(envPath);
    databaseUrl = loaded.DATABASE_URL;
  }

  if (!databaseUrl) {
    console.error('DATABASE_URL not found in environment or backend/.env');
    process.exit(1);
  }

  // parse URL like postgresql://user:pass@host:port/dbname
  // Use URL to rewrite database to 'postgres' for admin connection
  let url;
  try {
    // Ensure scheme is valid for URL parser
    const normalized = databaseUrl.replace(/^postgresql:\/\//i, 'postgresql://');
    url = new URL(normalized);
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err.message);
    process.exit(1);
  }

  // target DB name will be the path portion of the original DATABASE_URL
  const targetDb = (url.pathname || '').replace(/^\//, '') || 'swipe-quiz';

  // Connect to postgres default database to run CREATE DATABASE
  const adminUrl = new URL(url.toString());
  adminUrl.pathname = '/postgres';

  const client = new Client({ connectionString: adminUrl.toString() });
  try {
    await client.connect();
    // Check if database exists
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
    if (res.rowCount > 0) {
      console.log(`Database "${targetDb}" already exists.`);
    } else {
      console.log(`Creating database "${targetDb}"...`);
      await client.query(`CREATE DATABASE \"${targetDb}\"`);
      console.log('Database created successfully.');
    }
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create database:', err.message || err);
    try { await client.end(); } catch(e){}
    process.exit(1);
  }
}

main();
