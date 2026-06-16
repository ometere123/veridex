export type ProjectCategory =
  | 'DeFi'
  | 'AI'
  | 'Gaming'
  | 'Infrastructure'
  | 'RWA'
  | 'DePIN'
  | 'Consumer'
  | 'Other';

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'evaluation_locked'
  | 'evaluating'
  | 'ranked'
  | 'reevaluation_pending'
  | 'archived'
  | 'DRAFT'
  | 'EVIDENCE_LOCKED'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'PARTIAL'
  | 'WEAK'
  | 'UNVERIFIABLE'
  | 'REFRESH_PENDING'
  | 'STALE'
  | 'ARCHIVED';

export type RankTier = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export type VerificationLevel =
  | 'UNVERIFIED'
  | 'VERIFIED_PLUS'
  | 'VERIFIED'
  | 'SUBSTANTIATED'
  | 'DEVELOPING'
  | 'LIMITED_EVIDENCE'
  | 'HIGH_RISK'
  | 'UNVERIFIABLE';

export type RiskBand = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export interface Tokenomics {
  symbol: string;
  total_supply: string;
  utility: string;
  emission_schedule: string;
}

export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
  x?: string;
}

export interface AuditReport {
  firm: string;
  report_url: string;
  audit_date: string;
}

export interface Project {
  project_id: string;
  owner: string;
  name: string;
  category: ProjectCategory;
  website: string;
  description: string;
  whitepaper_url?: string;
  docs_url?: string;
  verification_document_url?: string;
  github_repos: string[];
  roadmap: string;
  investors: string[];
  partnerships: string[];
  tokenomics: Tokenomics;
  audits: AuditReport[];
  bug_bounty_url?: string;
  team: TeamMember[];
  ecosystem_integrations: string[];
  evidence_hash?: string;
  fact_check_hash?: string;
  fact_checked_at?: string;
  verification_score: number;
  verification_status: string;
  verified_source_count: number;
  locked_at?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Dossier {
  dossier_id: string;
  issuer: string;
  name: string;
  category: ProjectCategory;
  website: string;
  description: string;
  status: ProjectStatus;
  evidence_hash?: string;
  current_verification_hash?: string;
  current_verification_level: VerificationLevel;
  evidence_confidence: number;
  risk_band: RiskBand;
  verified_source_count: number;
  proof_event_count: number;
  verification_count: number;
  created_at: string;
  updated_at: string;
  locked_at?: string;
  last_verified_at?: string;
  expires_at?: string;
}

export interface EvidenceManifest {
  dossier_id: string;
  website: string;
  whitepaper_url?: string;
  docs_url?: string;
  github_repos: string[];
  roadmap: string;
  tokenomics: Tokenomics;
  audits: AuditReport[];
  team: TeamMember[];
  investors: string[];
  partnerships: string[];
  bug_bounty_url?: string;
  ecosystem_integrations: string[];
  verification_document_url?: string;
  evidence_files: Array<{ name?: string; url: string; path?: string; size?: number; type?: string }>;
  submitted_at: string;
  locked_at?: string;
  evidence_hash?: string;
}

export interface EvaluationScores {
  protocol_architecture_score: number;
  team_governance_score: number;
  market_traction_score: number;
  security_risk_score: number;
  delivery_proof_score: number;
  token_design_score: number;
  evidence_integrity_score: number;
  overall_score: number;
}

export interface FactCheckItem {
  source_type: string;
  url: string;
  status: string;
  note: string;
}

export interface FactCheckReport {
  verification_score: number;
  verification_status: string;
  confidence: number;
  verified_source_count: number;
  summary: string;
  verified_claims: string[];
  contradictions: string[];
  missing_evidence: string[];
  source_summaries: FactCheckItem[];
  fact_check_hash?: string;
  project_id?: string;
  checked_at?: string;
}

export interface Evaluation extends EvaluationScores {
  evaluation_id: string;
  project_id: string;
  score_model_version: string;
  tier: RankTier;
  verification_score: number;
  verification_status: string;
  verified_source_count: number;
  fact_check_hash: string;
  fact_check_summary: string;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  evaluation_hash?: string;
  evaluated_at: string;
}

export interface VerificationReport {
  verification_id: string;
  dossier_id: string;
  verification_level: VerificationLevel;
  evidence_confidence: number;
  risk_band: RiskBand;
  proof_completeness: number;
  source_integrity: number;
  verified_source_count: number;
  critical_warnings: string[];
  verification_dimensions: {
    protocol_architecture: number;
    team_governance: number;
    market_traction: number;
    security_risk: number;
    delivery_proof: number;
    token_design: number;
    evidence_integrity: number;
  };
  fact_check_hash: string;
  verification_hash?: string;
  verified_at: string;
  expires_at?: string;
  summary: string;
  strengths: string[];
  risks: string[];
  recommended_evidence: string[];
  confidence: number;
}

export interface HistoricalScore {
  project_id: string;
  old_score: number;
  new_score: number;
  delta: number;
  old_tier: RankTier;
  new_tier: RankTier;
  timestamp: string;
  evaluation_id: string;
}

export interface Ranking {
  project_id: string;
  project_name: string;
  category: ProjectCategory;
  overall_score: number;
  tier: RankTier;
  overall_rank: number;
  category_rank: number;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  project_id: string;
  project_name: string;
  category: ProjectCategory;
  website: string;
  overall_score: number;
  tier: RankTier;
  protocol_architecture_score: number;
  team_governance_score: number;
  market_traction_score: number;
  security_risk_score: number;
  delivery_proof_score: number;
  token_design_score: number;
  evidence_integrity_score: number;
  last_evaluated: string;
}

export interface RegistryEntry {
  dossier_id: string;
  name: string;
  category: ProjectCategory;
  website: string;
  verification_level: VerificationLevel;
  evidence_confidence: number;
  risk_band: RiskBand;
  proof_completeness: number;
  verified_source_count: number;
  last_verified_at: string;
  expires_at?: string;
  registry_position: number;
  proof_event_count?: number;
}

export interface Profile {
  wallet_address: string;
  display_name?: string;
  bio?: string;
  twitter?: string;
  github?: string;
  total_projects: number;
  total_evaluations: number;
  average_score: number;
  best_score: number;
  credibility_score: number;
  consistency_score: number;
  security_rating: number;
  execution_rating: number;
  evidence_rating: number;
  created_at: string;
}

export interface IssuerProfile {
  issuer: string;
  submitted_dossiers: number;
  verified_dossiers: number;
  average_evidence_confidence: number;
  high_risk_dossiers: number;
  stale_dossiers: number;
  latest_activity_at: string;
}

export interface ProofEvent {
  event_id: string;
  dossier_id: string;
  actor: string;
  event_type:
    | 'DOSSIER_CREATED'
    | 'DOSSIER_UPDATED'
    | 'EVIDENCE_LOCKED'
    | 'VERIFICATION_SUBMITTED'
    | 'FACT_CHECK_COMPLETED'
    | 'VERIFICATION_COMPLETED'
    | 'VERIFICATION_REFRESH_REQUESTED'
    | 'REGISTRY_UPDATED'
    | 'DOSSIER_ARCHIVED'
    | 'FEE_PAID'
    | 'FEE_WITHDRAWN'
    | string;
  event_hash: string;
  related_hash?: string;
  summary: string;
  timestamp: string;
}

export interface GenLayerProofStep {
  label: string;
  status: 'pending' | 'complete' | 'failed';
  tx_hash?: string;
  timestamp?: string;
  method?: string;
  contract_address?: string;
}

export interface GenLayerProof {
  project_id: string;
  contract_address: string;
  evidence_hash?: string;
  evaluation_hash?: string;
  steps: GenLayerProofStep[];
}

export interface Notification {
  id: string;
  wallet_address: string;
  type: 'evaluation_complete' | 'rank_change' | 'reevaluation_approved' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  project_id?: string;
}

export interface AnalyticsData {
  total_projects: number;
  total_evaluations: number;
  average_score: number;
  tier_distribution: Record<RankTier, number>;
  category_distribution: Record<ProjectCategory, number>;
  score_over_time: { date: string; avg_score: number }[];
  top_categories: { category: ProjectCategory; count: number; avg_score: number }[];
}

export interface TreasuryState {
  total_fees_collected: string;
  contract_balance: string;
  create_project_fee: string;
  evaluation_fee: string;
  reevaluation_fee: string;
  create_dossier_fee?: string;
  verification_fee?: string;
  refresh_fee?: string;
  fees_enabled: boolean;
  owner: string;
}
