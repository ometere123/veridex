import type { ProjectCategory, RankTier } from '@/types';

export const APP_NAME = 'AlphaRank';
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
  technical:     0.25,
  team:          0.20,
  market_fit:    0.20,
  security:      0.15,
  execution:     0.10,
  token_utility: 0.10,
};

// Tier colours — all built around #e6bef7 brand palette
export const TIER_COLORS: Record<RankTier, string> = {
  'S+': 'text-amber-300  bg-amber-300/10  border-amber-300/30',
  'S':  'text-[#e6bef7] bg-[#e6bef7]/10 border-[#e6bef7]/30',
  'A':  'text-violet-400 bg-violet-400/10 border-violet-400/30',
  'B':  'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'C':  'text-cyan-400   bg-cyan-400/10   border-cyan-400/30',
  'D':  'text-orange-400 bg-orange-400/10 border-orange-400/30',
  'F':  'text-red-400    bg-red-400/10    border-red-400/30',
};

// Raw hex values for inline styles / recharts
export const TIER_HEX: Record<RankTier, string> = {
  'S+': '#fbbf24',
  'S':  '#e6bef7',
  'A':  '#a78bfa',
  'B':  '#34d399',
  'C':  '#22d3ee',
  'D':  '#fb923c',
  'F':  '#f87171',
};

export const SCORE_LABELS: Record<string, string> = {
  technical_score:    'Technical Innovation',
  team_score:         'Team Quality',
  market_fit_score:   'Market Fit',
  security_score:     'Security',
  execution_score:    'Execution Progress',
  token_utility_score:'Token Utility',
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
