import type { ProjectCategory, RankTier } from '@/types';

export const APP_NAME = 'Veridex';
export const APP_TAGLINE = 'On-chain verification scores powered by GenLayer intelligence.';

export const CATEGORIES: ProjectCategory[] = [
  'DeFi', 'AI', 'Gaming', 'Infrastructure', 'RWA', 'DePIN', 'Consumer', 'Other',
];

export const RANK_TIERS: { tier: RankTier; min: number; max: number; label: string }[] = [
  { tier: 'S+', min: 95, max: 100, label: '7 Stars' },
  { tier: 'S',  min: 90, max: 94,  label: '6 Stars' },
  { tier: 'A',  min: 80, max: 89,  label: '5 Stars' },
  { tier: 'B',  min: 70, max: 79,  label: '4 Stars' },
  { tier: 'C',  min: 60, max: 69,  label: '3 Stars' },
  { tier: 'D',  min: 50, max: 59,  label: '2 Stars' },
  { tier: 'F',  min: 0,  max: 49,  label: '1 Star' },
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

export const TIER_STARS: Record<RankTier, string> = {
  'S+': '7★',
  'S': '6★',
  'A': '5★',
  'B': '4★',
  'C': '3★',
  'D': '2★',
  'F': '1★',
};

export const TIER_COLORS: Record<RankTier, string> = {
  'S+': 'text-[#5f7f6d] bg-[#5f7f6d]/10 border-[#5f7f6d]/30',
  'S':  'text-[#6b8e7a] bg-[#6b8e7a]/10 border-[#6b8e7a]/30',
  'A':  'text-[#7a9b8e] bg-[#7a9b8e]/10 border-[#7a9b8e]/30',
  'B':  'text-[#8b7355] bg-[#8b7355]/10 border-[#8b7355]/30',
  'C':  'text-[#a89b7a] bg-[#a89b7a]/10 border-[#a89b7a]/30',
  'D':  'text-[#b39b6b] bg-[#b39b6b]/10 border-[#b39b6b]/30',
  'F':  'text-[#a85c4a] bg-[#a85c4a]/10 border-[#a85c4a]/30',
};

export const TIER_HEX: Record<RankTier, string> = {
  'S+': '#5f7f6d',
  'S':  '#6b8e7a',
  'A':  '#7a9b8e',
  'B':  '#8b7355',
  'C':  '#a89b7a',
  'D':  '#b39b6b',
  'F':  '#a85c4a',
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
