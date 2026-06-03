import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  rounded?: string;
}

export function Skeleton({ className, height, rounded = '8px' }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{
        background: 'linear-gradient(90deg, rgba(230,190,247,0.04) 25%, rgba(230,190,247,0.08) 50%, rgba(230,190,247,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
        borderRadius: rounded,
        height: height,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl p-5 space-y-3" style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.06)' }}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-5" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="w-8 h-5" rounded="4px" />
      </div>
      <Skeleton className="h-7 w-20" />
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(230,190,247,0.04)' }}>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="py-3 pr-4">
          <Skeleton className={i === 1 ? 'h-4 w-32' : 'h-4 w-16'} />
        </td>
      ))}
    </tr>
  );
}
