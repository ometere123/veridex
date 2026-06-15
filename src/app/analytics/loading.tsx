import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Skeleton className="mb-2 h-9 w-44" />
      <Skeleton className="mb-8 h-4 w-80" />
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-[28px] p-5 text-center space-y-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Skeleton className="mx-auto h-8 w-16" />
            <Skeleton className="mx-auto h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-[28px] p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Skeleton className="h-5 w-40" />
            {[...Array(6)].map((_, j) => (
              <Skeleton key={j} className="h-6 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
