import pkg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pkg;

const passwordRaw = 'root @komali';
const projectRef = 'zmgchehdwvycngptkqnd';

const connectionHosts = [
  `postgres://postgres:${encodeURIComponent(passwordRaw)}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgres://postgres.${projectRef}:${encodeURIComponent(passwordRaw)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
  `postgres://postgres.${projectRef}:${encodeURIComponent(passwordRaw)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgres://postgres.${projectRef}:${encodeURIComponent(passwordRaw)}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  `postgres://postgres.${projectRef}:${encodeURIComponent(passwordRaw)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
];

async function runMigration() {
  const sqlPath = path.join(process.cwd(), 'supabase', 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  let connected = false;
  let client = null;

  for (const connectionString of connectionHosts) {
    try {
      console.log(`Connecting to Supabase Postgres...`);
      client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      });
      await client.connect();
      connected = true;
      console.log('⚡ Connected successfully to Supabase Postgres database!');
      break;
    } catch (err) {
      console.warn(`Connection attempt note: ${err.message}`);
      if (client) {
        try { await client.end(); } catch {}
      }
    }
  }

  if (!connected || !client) {
    console.error('Could not connect to Supabase database with provided credentials.');
    process.exit(1);
  }

  try {
    console.log('Executing schema migration SQL (pgvector, nexus_vectors, nexus_dag_graphs, nexus_telemetry_logs)...');
    await client.query(sql);
    console.log('✅ Supabase Schema Migration Executed Successfully!');
    
    // Verify tables exist
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'nexus_%';
    `);
    console.log('📋 Verified Public Tables in Supabase:', res.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('Migration Execution Error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
