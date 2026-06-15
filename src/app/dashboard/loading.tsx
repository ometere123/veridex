import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex justify-between">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-[28px] p-5 text-center space-y-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Skeleton className="mx-auto h-8 w-12" />
            <Skeleton className="mx-auto h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[28px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}>
          <Skeleton className="h-5 w-36" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(107,142,122,0.06)' }}>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
