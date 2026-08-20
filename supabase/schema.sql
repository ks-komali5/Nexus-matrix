-- NexusMatrix Enterprise Framework - Supabase Postgres + pgvector Schema
-- Project Reference: zmgchehdwvycngptkqnd

-- 1. Enable vector extension for 768-dimensional embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create 768D Vector Memory Table
CREATE TABLE IF NOT EXISTS nexus_vectors (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  modality TEXT NOT NULL,
  node_title TEXT,
  tokens INT DEFAULT 0,
  embedding vector(768) NOT NULL,
  projection_2d JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Cosine Distance Index for Sub-Millisecond Search
CREATE INDEX IF NOT EXISTS nexus_vectors_embedding_cosine_idx 
ON nexus_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 4. Create DAG Task Graphs Table
CREATE TABLE IF NOT EXISTS nexus_dag_graphs (
  id TEXT PRIMARY KEY,
  objective TEXT NOT NULL,
  status TEXT NOT NULL,
  nodes JSONB NOT NULL,
  total_tokens INT DEFAULT 0,
  total_latency_ms INT DEFAULT 0,
  cache_hits INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 5. Create Inter-Agent Telemetry Logs Table
CREATE TABLE IF NOT EXISTS nexus_telemetry_logs (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  alerts JSONB NOT NULL,
  suggested_action TEXT,
  latency_ms INT NOT NULL,
  tokens_used INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RPC Function for Cosine Similarity Vector Search (>0.88 Threshold)
CREATE OR REPLACE FUNCTION match_nexus_vectors (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id text,
  text text,
  agent_id text,
  agent_name text,
  modality text,
  node_title text,
  tokens int,
  similarity float,
  projection_2d jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nexus_vectors.id,
    nexus_vectors.text,
    nexus_vectors.agent_id,
    nexus_vectors.agent_name,
    nexus_vectors.modality,
    nexus_vectors.node_title,
    nexus_vectors.tokens,
    1 - (nexus_vectors.embedding <=> query_embedding) AS similarity,
    nexus_vectors.projection_2d
  FROM nexus_vectors
  WHERE 1 - (nexus_vectors.embedding <=> query_embedding) >= match_threshold
  ORDER BY nexus_vectors.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
