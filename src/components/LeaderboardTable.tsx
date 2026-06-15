import Link from 'next/link';
import { TierBadge } from './TierBadge';
import { formatScore, getScoreHex, getScoreColor, cn, safeNumber } from '@/utils';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  className?: string;
}

export function LeaderboardTable({ entries, className }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-16', className)} style={{ color: '#64748b' }}>
        No submissions assessed yet.
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(0,217,255,0.08)' }}>
            {['#', 'Project', 'Category', 'Score', 'Tier', 'Architecture', 'Governance', 'Traction'].map((h, i) => (
              <th
                key={h}
                className={cn(
                  'pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wider',
                  i >= 5 && 'hidden lg:table-cell',
                  i === 2 && 'hidden sm:table-cell'
                )}
                style={{ color: '#64748b' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={entry.project_id}
              className="transition-colors"
              style={{ borderBottom: '1px solid rgba(0,217,255,0.04)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,217,255,0.03)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {/* Rank */}
              <td className="py-3 pr-4">
                <span className="font-mono text-sm font-medium" style={{
                  color: idx === 0 ? '#fbbf24' : idx === 1 ? '#00d9ff' : idx === 2 ? '#06b6d4' : '#64748b'
                }}>
                  {Math.round(safeNumber(entry.rank))}
                </span>
              </td>

              {/* Name */}
              <td className="py-3 pr-4">
                <Link
                  href={`/project/${entry.project_id}`}
                  className="font-medium transition-colors"
                  style={{ color: '#e2e8f0' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#00d9ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#e2e8f0')}
                >
                  {entry.project_name}
                </Link>
              </td>

              {/* Category */}
              <td className="py-3 pr-4 hidden sm:table-cell">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: '#64748b' }}>
                  {entry.category}
                </span>
              </td>

              {/* Score */}
              <td className="py-3 pr-4">
                <span
                  className={cn('font-mono font-bold text-sm', getScoreColor(safeNumber(entry.overall_score)))}
                  style={{ textShadow: `0 0 8px ${getScoreHex(safeNumber(entry.overall_score))}44` }}
                >
                  {formatScore(entry.overall_score)}
                </span>
              </td>

              {/* Tier */}
              <td className="py-3 pr-4">
                <TierBadge tier={entry.tier} size="sm" />
              </td>

              {/* Sub-scores */}
              {[entry.protocol_architecture_score, entry.team_governance_score, entry.market_traction_score].map((v, i) => (
                <td key={i} className="py-3 pr-4 hidden lg:table-cell">
                  <span className="font-mono text-sm" style={{ color: getScoreHex(safeNumber(v)) }}>
                    {formatScore(v)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
