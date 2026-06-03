import { cn } from '@/utils';
import { TIER_COLORS } from '@/constants';
import type { RankTier } from '@/types';

interface TierBadgeProps {
  tier: RankTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: 'text-[11px] px-1.5 py-0.5 font-bold',
  md: 'text-xs   px-2   py-1   font-bold',
  lg: 'text-sm   px-2.5 py-1.5 font-black',
};

export function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono rounded-md border tracking-wider',
        TIER_COLORS[tier],
        SIZE[size],
        className
      )}
    >
      {tier}
    </span>
  );
}
