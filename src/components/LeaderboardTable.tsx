import Link from 'next/link';
import { TierBadge } from './TierBadge';
import { formatScore, getScoreHex, getScoreColor, cn } from '@/utils';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  className?: string;
}

export function LeaderboardTable({ entries, className }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-16', className)} style={{ color: '#6b5490' }}>
        No projects ranked yet.
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(230,190,247,0.08)' }}>
            {['#', 'Project', 'Category', 'Score', 'Tier', 'Tech', 'Team', 'Security'].map((h, i) => (
              <th
                key={h}
                className={cn(
                  'pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wider',
                  i >= 5 && 'hidden lg:table-cell',
                  i === 2 && 'hidden sm:table-cell'
                )}
                style={{ color: '#6b5490' }}
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
              style={{ borderBottom: '1px solid rgba(230,190,247,0.04)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(230,190,247,0.03)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {/* Rank */}
              <td className="py-3 pr-4">
                <span className="font-mono text-sm font-medium" style={{
                  color: idx === 0 ? '#fbbf24' : idx === 1 ? '#e6bef7' : idx === 2 ? '#c084fc' : '#6b5490'
                }}>
                  {entry.rank}
                </span>
              </td>

              {/* Name */}
              <td className="py-3 pr-4">
                <Link
                  href={`/project/${entry.project_id}`}
                  className="font-medium transition-colors"
                  style={{ color: '#f5eeff' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#e6bef7')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#f5eeff')}
                >
                  {entry.project_name}
                </Link>
              </td>

              {/* Category */}
              <td className="py-3 pr-4 hidden sm:table-cell">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: '#6b5490' }}>
                  {entry.category}
                </span>
              </td>

              {/* Score */}
              <td className="py-3 pr-4">
                <span
                  className={cn('font-mono font-bold text-sm', getScoreColor(entry.overall_score))}
                  style={{ textShadow: `0 0 8px ${getScoreHex(entry.overall_score)}44` }}
                >
                  {formatScore(entry.overall_score)}
                </span>
              </td>

              {/* Tier */}
              <td className="py-3 pr-4">
                <TierBadge tier={entry.tier} size="sm" />
              </td>

              {/* Sub-scores */}
              {[entry.technical_score, entry.team_score, entry.security_score].map((v, i) => (
                <td key={i} className="py-3 pr-4 hidden lg:table-cell">
                  <span className="font-mono text-sm" style={{ color: getScoreHex(v) }}>
                    {Math.round(v)}
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
