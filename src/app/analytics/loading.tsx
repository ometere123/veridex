import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Skeleton className="h-9 w-44 mb-2" />
      <Skeleton className="h-4 w-80 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-5 space-y-2 text-center" style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)' }}>
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl p-6 space-y-4" style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)' }}>
            <Skeleton className="h-5 w-40" />
            {[...Array(6)].map((_, j) => <Skeleton key={j} className="h-6 w-full" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
