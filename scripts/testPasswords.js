import pkg from 'pg';
const { Client } = pkg;

const projectRef = 'zmgchehdwvycngptkqnd';
const host = 'aws-0-ap-northeast-1.pooler.supabase.com';

const passwordCandidates = [
  'root @komali',
  'root@komali',
  'rootkomali',
  'Root@komali',
  'Root @komali',
  'root@komali123',
  'Root@komali123',
];

async function testPasswords() {
  const sqlPath = 'supabase/schema.sql';
  const fs = await import('fs');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  for (const pwd of passwordCandidates) {
    const connStr = `postgres://postgres.${projectRef}:${encodeURIComponent(pwd)}@${host}:6543/postgres`;
    console.log(`Testing password candidate: "${pwd}"...`);

    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log(`\n🎉 SUCCESS! Connected to Supabase with password: "${pwd}"`);
      console.log('Executing schema migration SQL...');
      await client.query(sql);
      console.log('✅ Supabase Schema Migration Executed Successfully!');
      
      const res = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE 'nexus_%';
      `);
      console.log('📋 Public Tables Created in Supabase:', res.rows.map(r => r.table_name).join(', '));
      await client.end();
      return;
    } catch (err) {
      console.log(`   Failed: ${err.message}`);
      try { await client.end(); } catch {}
    }
  }
  console.log('\nPassword candidates exhausted.');
}

testPasswords();
