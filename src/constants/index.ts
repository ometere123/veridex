import type { ProjectCategory, RankTier } from '@/types';

export const APP_NAME = 'Veridex';
export const APP_TAGLINE = 'Crypto project rankings powered by GenLayer intelligence.';

export const CATEGORIES: ProjectCategory[] = [
  'DeFi', 'AI', 'Gaming', 'Infrastructure', 'RWA', 'DePIN', 'Consumer', 'Other',
];

export const RANK_TIERS: { tier: RankTier; min: number; max: number; label: string }[] = [
  { tier: 'S+', min: 95, max: 100, label: 'Elite' },
  { tier: 'S',  min: 90, max: 94,  label: 'Exceptional' },
  { tier: 'A',  min: 80, max: 89,  label: 'Strong' },
  { tier: 'B',  min: 70, max: 79,  label: 'Good' },
  { tier: 'C',  min: 60, max: 69,  label: 'Average' },
  { tier: 'D',  min: 50, max: 59,  label: 'Below Average' },
  { tier: 'F',  min: 0,  max: 49,  label: 'Poor' },
];

export const SCORE_WEIGHTS = {
  protocol_architecture: 0.20,
  team_governance:      0.15,
  market_traction:      0.15,
  security_risk:        0.15,
  delivery_proof:       0.15,
  token_design:         0.10,
  evidence_integrity:   0.10,
};

// Tier colours - built around #00d9ff brand palette
export const TIER_COLORS: Record<RankTier, string> = {
  'S+': 'text-amber-400  bg-amber-400/10  border-amber-400/30',
  'S':  'text-[#00d9ff] bg-[#00d9ff]/10 border-[#00d9ff]/30',
  'A':  'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  'B':  'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'C':  'text-violet-400  bg-violet-400/10  border-violet-400/30',
  'D':  'text-orange-400 bg-orange-400/10 border-orange-400/30',
  'F':  'text-red-400    bg-red-400/10    border-red-400/30',
};

// Raw hex values for inline styles / recharts
export const TIER_HEX: Record<RankTier, string> = {
  'S+': '#f59e0b',
  'S':  '#00d9ff',
  'A':  '#818cf8',
  'B':  '#34d399',
  'C':  '#a78bfa',
  'D':  '#fb923c',
  'F':  '#f87171',
};

export const SCORE_LABELS: Record<string, string> = {
  protocol_architecture_score: 'Protocol Architecture',
  team_governance_score:      'Team & Governance',
  market_traction_score:      'Market Traction',
  security_risk_score:        'Security & Risk',
  delivery_proof_score:       'Delivery Proof',
  token_design_score:         'Token Design',
  evidence_integrity_score:   'Evidence Integrity',
};

export const CONTRACT_METHODS = {
  CREATE_PROJECT:      'create_project',
  UPDATE_PROJECT:      'update_project_before_lock',
  LOCK_PROJECT:        'lock_project_data',
  SUBMIT_EVALUATION:   'submit_evaluation',
  RUN_EVALUATION:      'run_evaluation',
  REQUEST_REEVALUATION:'request_reevaluation',
  FINALIZE_SCORE:      'finalize_score',
  UPDATE_LEADERBOARD:  'update_leaderboard',
  ARCHIVE_PROJECT:     'archive_project',
};
