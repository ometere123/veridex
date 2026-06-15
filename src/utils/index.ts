import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RankTier, EvaluationScores } from '@/types';
import { RANK_TIERS, SCORE_WEIGHTS } from '@/constants';
import { safeNumber } from '@/lib/parsers';
export { safeJsonParse, safeArray, safeNumber } from '@/lib/parsers';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTier(score: number): RankTier {
  const tier = RANK_TIERS.find((t) => score >= t.min && score <= t.max);
  return tier?.tier ?? 'F';
}

export function calculateOverallScore(scores: Omit<EvaluationScores, 'overall_score'>): number {
  const weighted =
    scores.protocol_architecture_score * SCORE_WEIGHTS.protocol_architecture +
    scores.team_governance_score * SCORE_WEIGHTS.team_governance +
    scores.market_traction_score * SCORE_WEIGHTS.market_traction +
    scores.security_risk_score * SCORE_WEIGHTS.security_risk +
    scores.delivery_proof_score * SCORE_WEIGHTS.delivery_proof +
    scores.token_design_score * SCORE_WEIGHTS.token_design +
    scores.evidence_integrity_score * SCORE_WEIGHTS.evidence_integrity;
  return Math.round(weighted * 10) / 10;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatScore(score: unknown): string {
  return safeNumber(score, 0).toFixed(1);
}

export function formatPercent(value: unknown): string {
  return `${safeNumber(value, 0).toFixed(0)}%`;
}

export function getScoreValue<T extends Record<string, unknown>>(source: T, key: keyof T): number {
  return safeNumber(source[key], 0);
}

/** Returns true if the timestamp is missing, zero, or epoch (Jan 1 1970 / Jan 1 2000) */
function isInvalidTimestamp(raw: string | undefined | null): boolean {
  if (!raw || raw === '' || raw === '0') return true;
  const n = Number(raw);
  // Unix epoch 0 = Jan 1 1970, also treat very small numbers as invalid
  if (!isNaN(n) && n < 946684800) return true; // before Jan 1 2000 UTC
  const d = new Date(isNaN(n) ? raw : n * 1000);
  return isNaN(d.getTime()) || d.getFullYear() < 2000;
}

export function formatDate(dateStr: string | undefined | null): string {
  if (isInvalidTimestamp(dateStr)) return 'Pending';
  const n = Number(dateStr);
  const d = isNaN(n) ? new Date(dateStr!) : new Date(n * 1000);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (isInvalidTimestamp(dateStr)) return 'Pending chain timestamp';
  const n = Number(dateStr);
  const d = isNaN(n) ? new Date(dateStr!) : new Date(n * 1000);
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  score = safeNumber(score, 0);
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
  score = safeNumber(score, 0);
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
