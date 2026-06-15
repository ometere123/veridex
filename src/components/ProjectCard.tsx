import Link from 'next/link';
import { TierBadge } from './TierBadge';
import { RankingBadge } from './RankingBadge';
import { cn, formatScore, getScoreHex, safeNumber } from '@/utils';
import type { LeaderboardEntry } from '@/types';

interface ProjectCardProps {
  entry: LeaderboardEntry;
  className?: string;
}

const MINI_SCORES = [
  { label: 'Protocol', key: 'protocol_architecture_score' },
  { label: 'Governance', key: 'team_governance_score' },
  { label: 'Traction', key: 'market_traction_score' },
  { label: 'Security', key: 'security_risk_score' },
  { label: 'Delivery', key: 'delivery_proof_score' },
  { label: 'Token', key: 'token_design_score' },
  { label: 'Evidence', key: 'evidence_integrity_score' },
] as const;

export function ProjectCard({ entry, className }: ProjectCardProps) {
  const overallHex = getScoreHex(safeNumber(entry.overall_score));

  return (
    <Link
      href={`/project/${entry.project_id}`}
      className={cn('block rounded-lg p-5 transition-all duration-200 group', className)}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(107, 142, 122, 0.1)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(107, 142, 122, 0.25)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(107, 142, 122, 0.1)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <RankingBadge rank={entry.rank} />
          <div>
            <h3
              className="font-semibold text-sm transition-colors"
              style={{ color: '#1a1612' }}
            >
              {entry.project_name}
            </h3>
            <span
              className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: '#9b938a' }}
            >
              {entry.category}
            </span>
          </div>
        </div>
        <TierBadge tier={entry.tier} size="sm" />
      </div>

      {/* Overall score */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span
          className="text-2xl font-bold font-mono"
          style={{ color: overallHex, textShadow: `0 0 12px ${overallHex}44` }}
        >
          {formatScore(entry.overall_score)}
        </span>
        <span className="text-xs" style={{ color: '#9b938a' }}>assessment</span>
      </div>

      {/* Mini score grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {MINI_SCORES.map(({ label, key }) => {
          const val = entry[key];
          const safeVal = safeNumber(val);
          const hex = getScoreHex(safeVal);
          return (
            <div
              key={label}
              className="rounded-md p-1.5 text-center"
              style={{ background: 'rgba(107, 142, 122, 0.06)' }}
            >
              <div
                className="text-sm font-mono font-bold"
                style={{ color: hex }}
              >
                {Math.round(safeVal)}
              </div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: '#9b938a' }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
