import { cn } from '@/utils';

interface RankingBadgeProps {
  rank: number;
  change?: number;
  className?: string;
}

export function RankingBadge({ rank, change, className }: RankingBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="font-mono font-bold text-base" style={{ color: '#6b8e7a' }}>
        #{rank}
      </span>
      {change !== undefined && change !== 0 && (
        <span
          className="text-[10px] font-semibold"
          style={{ color: change > 0 ? '#6b8e7a' : '#a85c4a' }}
        >
          {change > 0 ? `▲${change}` : `▼${Math.abs(change)}`}
        </span>
      )}
    </div>
  );
}
