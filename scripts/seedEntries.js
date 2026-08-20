import pkg from 'pg';
const { Client } = pkg;

const passwordRaw = 'root@komali';
const projectRef = 'zmgchehdwvycngptkqnd';
const host = 'aws-0-ap-northeast-1.pooler.supabase.com';

const connStr = `postgres://postgres.${projectRef}:${encodeURIComponent(passwordRaw)}@${host}:6543/postgres`;

function generate768DEmbedding(text) {
  const DIMENSIONS = 768;
  const vector = new Array(DIMENSIONS).fill(0);
  const cleanText = text.toLowerCase().trim();

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    const pos1 = (charCode * 31 + i * 17) % DIMENSIONS;
    const pos2 = (charCode * 59 + i * 37) % DIMENSIONS;
    vector[pos1] += Math.sin(charCode + i) * 0.45;
    vector[pos2] += Math.cos(charCode * 2 + i) * 0.35;
  }

  let sumSq = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vector.map((v) => parseFloat((v / norm).toFixed(6)));
}

async function seedSampleEntries() {
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('⚡ Connected to Supabase for sample data insertion...');

    // 1. Insert Sample Vectors into nexus_vectors
    const sampleText1 = 'Master Orchestrator Agent: DAG Decomposition & Multi-Agent Topographical Routing Policy v3.7';
    const vec1 = generate768DEmbedding(sampleText1);

    const sampleText2 = 'Code Assistant Agent (gemini-3.1-pro-preview): Synthesized non-blocking TypeScript vector similarity handler with 100% static analysis pass.';
    const vec2 = generate768DEmbedding(sampleText2);

    const sampleText3 = 'Vision Captioner Agent (gemini-3.7-flash): Spatial bounding tag analytics [0.12, 0.25, 0.45, 0.88] for architecture diagram parsing.';
    const vec3 = generate768DEmbedding(sampleText3);

    console.log('Inserting sample 768D vectors into "nexus_vectors" table...');
    await client.query(`
      INSERT INTO nexus_vectors (id, text, agent_id, agent_name, modality, node_title, tokens, embedding, projection_2d)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8::vector, $9::jsonb),
        ($10, $11, $12, $13, $14, $15, $16, $17::vector, $18::jsonb),
        ($19, $20, $21, $22, $23, $24, $25, $26::vector, $27::jsonb)
      ON CONFLICT (id) DO NOTHING;
    `, [
      'vec_demo_1', sampleText1, 'orchestrator', 'Master Orchestrator Agent', 'structured', 'System DAG Topology Spec', 64, `[${vec1.join(',')}]`, JSON.stringify([0.15, 0.32]),
      'vec_demo_2', sampleText2, 'code', 'Code Assistant Agent', 'code', 'TypeScript Dot Product Handler', 180, `[${vec2.join(',')}]`, JSON.stringify([-0.42, 0.18]),
      'vec_demo_3', sampleText3, 'vision', 'Vision Captioner Agent', 'vision', 'Spatial Bounding Tags Schema', 110, `[${vec3.join(',')}]`, JSON.stringify([0.28, -0.55])
    ]);

    // 2. Insert Sample DAG Graph into nexus_dag_graphs
    console.log('Inserting sample DAG execution graph into "nexus_dag_graphs" table...');
    const sampleGraph = {
      id: 'graph_demo_101',
      objective: 'Enterprise Multi-Modal Security & Code Audit Pipeline',
      status: 'completed',
      nodes: [
        { id: 'node-1', title: 'Master Prompt & Graph Decomposition', agentId: 'orchestrator', status: 'completed', latencyMs: 145, tokens: 88 },
        { id: 'node-2', title: 'High-Density Document Compression', agentId: 'summarizer', status: 'completed', latencyMs: 110, tokens: 120 },
        { id: 'node-3', title: 'Visual Architecture Scene Analytics', agentId: 'vision', status: 'completed', latencyMs: 230, tokens: 150 },
        { id: 'node-4', title: 'Production Code Refactor Synthesis', agentId: 'code', status: 'completed', latencyMs: 310, tokens: 340 },
        { id: 'node-5', title: 'Zero-Trust Safety & Schema Validation', agentId: 'guardrail', status: 'completed', latencyMs: 85, tokens: 64 },
        { id: 'node-6', title: 'Executive Deliverables Consolidation', agentId: 'synthesizer', status: 'completed', latencyMs: 160, tokens: 210 }
      ],
      total_tokens: 972,
      total_latency_ms: 1040,
      cache_hits: 2
    };

    await client.query(`
      INSERT INTO nexus_dag_graphs (id, objective, status, nodes, total_tokens, total_latency_ms, cache_hits, completed_at)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, NOW())
      ON CONFLICT (id) DO NOTHING;
    `, [
      sampleGraph.id, sampleGraph.objective, sampleGraph.status, JSON.stringify(sampleGraph.nodes),
      sampleGraph.total_tokens, sampleGraph.total_latency_ms, sampleGraph.cache_hits
    ]);

    // 3. Insert Sample Telemetry Logs into nexus_telemetry_logs
    console.log('Inserting sample telemetry logs into "nexus_telemetry_logs" table...');
    await client.query(`
      INSERT INTO nexus_telemetry_logs (id, node_id, agent_id, agent_name, status, confidence, alerts, suggested_action, latency_ms, tokens_used)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10),
        ($11, $12, $13, $14, $15, $16, $17::jsonb, $18, $19, $20),
        ($21, $22, $23, $24, $25, $26, $27::jsonb, $28, $29, $30)
      ON CONFLICT (id) DO NOTHING;
    `, [
      'rep_demo_1', 'node-1', 'orchestrator', 'Master Orchestrator Agent', 'success', 0.99, JSON.stringify(['Decomposed objective into 6 DAG sub-task nodes.']), 'Forward context vectors to downstream agents', 145, 88,
      'rep_demo_2', 'node-4', 'code', 'Code Assistant Agent', 'rerouted', 0.94, JSON.stringify(['Complex async static analysis requires deeper logic verification.']), 'Elevate to Gemini 3.1 Pro for deep logic verification', 310, 340,
      'rep_demo_3', 'node-5', 'guardrail', 'Guardrail Validator Agent', 'success', 1.00, JSON.stringify(['Enforced zero-trust TypeScript type bounds. 0 vulnerabilities detected.']), 'Approve payload delivery', 85, 64
    ]);

    console.log('\n🎉 SUCCESS! Sample entries inserted into Supabase tables!');

    // Read back counts
    const vecCount = await client.query('SELECT count(*) FROM nexus_vectors;');
    const graphCount = await client.query('SELECT count(*) FROM nexus_dag_graphs;');
    const logCount = await client.query('SELECT count(*) FROM nexus_telemetry_logs;');

    console.log('\n📊 Live Record Counts in Supabase:');
    console.log(` - nexus_vectors: ${vecCount.rows[0].count} rows`);
    console.log(` - nexus_dag_graphs: ${graphCount.rows[0].count} rows`);
    console.log(` - nexus_telemetry_logs: ${logCount.rows[0].count} rows`);

  } catch (err) {
    console.error('Seeding Error:', err.message);
  } finally {
    await client.end();
  }
}

seedSampleEntries();
