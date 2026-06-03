import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RankTier, EvaluationScores } from '@/types';
import { RANK_TIERS, SCORE_WEIGHTS } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTier(score: number): RankTier {
  const tier = RANK_TIERS.find((t) => score >= t.min && score <= t.max);
  return tier?.tier ?? 'F';
}

export function calculateOverallScore(scores: Omit<EvaluationScores, 'overall_score'>): number {
  const weighted =
    scores.technical_score * SCORE_WEIGHTS.technical +
    scores.team_score * SCORE_WEIGHTS.team +
    scores.market_fit_score * SCORE_WEIGHTS.market_fit +
    scores.security_score * SCORE_WEIGHTS.security +
    scores.execution_score * SCORE_WEIGHTS.execution +
    scores.token_utility_score * SCORE_WEIGHTS.token_utility;
  return Math.round(weighted * 10) / 10;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateHash(hash: string, chars = 8): string {
  if (!hash) return '';
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function generateEvidenceHash(projectData: Record<string, unknown>): string {
  const serialized = JSON.stringify(projectData, Object.keys(projectData).sort());
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    const char = serialized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}

export function getRankChange(current: number, previous?: number): number {
  if (previous === undefined) return 0;
  return previous - current;
}

export function getScoreColor(score: number): string {
  if (score >= 95) return 'text-amber-300';
  if (score >= 90) return 'text-[#e6bef7]';
  if (score >= 80) return 'text-violet-400';
  if (score >= 70) return 'text-emerald-400';
  if (score >= 60) return 'text-cyan-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
}

/** Return a hex colour for use in recharts/inline styles */
export function getScoreHex(score: number): string {
  if (score >= 95) return '#fbbf24';
  if (score >= 90) return '#e6bef7';
  if (score >= 80) return '#a78bfa';
  if (score >= 70) return '#34d399';
  if (score >= 60) return '#22d3ee';
  if (score >= 50) return '#fb923c';
  return '#f87171';
}

export function categoryToLeaderboardKey(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '_');
}
