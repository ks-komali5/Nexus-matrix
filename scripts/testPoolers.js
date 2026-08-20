import pkg from 'pg';
const { Client } = pkg;

const passwordRaw = 'root @komali';
const projectRef = 'zmgchehdwvycngptkqnd';

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'us-east-1',
  'us-west-1',
  'eu-central-1',
  'eu-west-1',
  'sa-east-1',
];

async function findPooler() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connStr = `postgres://postgres.${projectRef}:${encodeURIComponent(passwordRaw)}@${host}:6543/postgres`;
    console.log(`Testing region ${region} (${host})...`);
    
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000,
    });

    try {
      await client.connect();
      console.log(`🎉 SUCCESS! Connected via pooler in region: ${region}`);
      return { client, connStr };
    } catch (err) {
      console.log(`   Result: ${err.message}`);
      try { await client.end(); } catch {}
    }
  }
  return null;
}

findPooler();
