-- AlphaRank — Supabase Schema
-- IMPORTANT: GenLayer is the source of truth.
-- Supabase is used ONLY for: caching, indexing, search, notifications, analytics.
-- Rankings and scores are NEVER generated in Supabase — only synced from GenLayer.

-- ─────────────────────────────────────────────────────────────────
-- Profiles (cache of on-chain profiles)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  wallet_address TEXT PRIMARY KEY,
  display_name TEXT,
  bio TEXT,
  twitter TEXT,
  github TEXT,
  total_projects INTEGER DEFAULT 0,
  total_evaluations INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  best_score NUMERIC(5,2) DEFAULT 0,
  credibility_score NUMERIC(5,2) DEFAULT 0,
  consistency_score NUMERIC(5,2) DEFAULT 100,
  security_rating NUMERIC(5,2) DEFAULT 0,
  execution_rating NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- Projects (cache for fast indexing/search)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  project_id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  website TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','evaluation_locked','evaluating','ranked','reevaluation_pending','archived')),
  evidence_hash TEXT,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);

-- ─────────────────────────────────────────────────────────────────
-- Evaluations (cache synced from GenLayer — NEVER source of truth)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evaluations (
  evaluation_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  technical_score NUMERIC(5,2) DEFAULT 0,
  team_score NUMERIC(5,2) DEFAULT 0,
  market_fit_score NUMERIC(5,2) DEFAULT 0,
  security_score NUMERIC(5,2) DEFAULT 0,
  execution_score NUMERIC(5,2) DEFAULT 0,
  token_utility_score NUMERIC(5,2) DEFAULT 0,
  overall_score NUMERIC(5,2) DEFAULT 0,
  tier TEXT,
  confidence INTEGER DEFAULT 0,
  evaluation_hash TEXT,
  tx_hash TEXT,
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_project ON evaluations(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_tier ON evaluations(tier);

-- ─────────────────────────────────────────────────────────────────
-- Rankings (cache — derived from GenLayer, never generated here)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rankings (
  project_id TEXT PRIMARY KEY REFERENCES projects(project_id) ON DELETE CASCADE,
  rank_position INTEGER,
  category_rank INTEGER,
  previous_rank INTEGER,
  overall_score NUMERIC(5,2),
  tier TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- Historical Rankings (append-only, never overwrite)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS historical_rankings (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  evaluation_id TEXT,
  old_score NUMERIC(5,2),
  new_score NUMERIC(5,2),
  delta NUMERIC(5,2),
  old_tier TEXT,
  new_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historical_project ON historical_rankings(project_id);

-- ─────────────────────────────────────────────────────────────────
-- Leaderboards (category snapshots)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaderboards (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  rank INTEGER,
  overall_score NUMERIC(5,2),
  tier TEXT,
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, project_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_category ON leaderboards(category);

-- ─────────────────────────────────────────────────────────────────
-- Transactions (GenLayer tx log)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  tx_hash TEXT UNIQUE,
  method TEXT,
  project_id TEXT,
  wallet TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- Notifications
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  project_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_wallet ON notifications(wallet_address);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(wallet_address, read) WHERE read = FALSE;

-- ─────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet');
