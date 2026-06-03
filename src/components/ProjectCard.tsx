import Link from 'next/link';
import { TierBadge } from './TierBadge';
import { RankingBadge } from './RankingBadge';
import { cn, formatScore, getScoreHex } from '@/utils';
import type { LeaderboardEntry } from '@/types';

interface ProjectCardProps {
  entry: LeaderboardEntry;
  className?: string;
}

const MINI_SCORES = [
  { label: 'Tech',   key: 'technical_score' },
  { label: 'Team',   key: 'team_score' },
  { label: 'Market', key: 'market_fit_score' },
  { label: 'Sec',    key: 'security_score' },
  { label: 'Exec',   key: 'execution_score' },
  { label: 'Token',  key: 'token_utility_score' },
] as const;

export function ProjectCard({ entry, className }: ProjectCardProps) {
  const overallHex = getScoreHex(entry.overall_score);

  return (
    <Link
      href={`/project/${entry.project_id}`}
      className={cn('block rounded-xl p-5 transition-all duration-200 group', className)}
      style={{
        background: '#0e0a1a',
        border: '1px solid rgba(230,190,247,0.08)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(230,190,247,0.22)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(230,190,247,0.06)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(230,190,247,0.08)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <RankingBadge rank={entry.rank} />
          <div>
            <h3
              className="font-semibold text-sm transition-colors"
              style={{ color: '#f5eeff' }}
            >
              {entry.project_name}
            </h3>
            <span
              className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: '#6b5490' }}
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
          style={{ color: overallHex, textShadow: `0 0 12px ${overallHex}66` }}
        >
          {formatScore(entry.overall_score)}
        </span>
        <span className="text-xs" style={{ color: '#6b5490' }}>/ 100</span>
      </div>

      {/* Mini score grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {MINI_SCORES.map(({ label, key }) => {
          const val = entry[key];
          const hex = getScoreHex(val);
          return (
            <div
              key={label}
              className="rounded-md p-1.5 text-center"
              style={{ background: 'rgba(230,190,247,0.04)' }}
            >
              <div
                className="text-sm font-mono font-bold"
                style={{ color: hex }}
              >
                {Math.round(val)}
              </div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: '#6b5490' }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
