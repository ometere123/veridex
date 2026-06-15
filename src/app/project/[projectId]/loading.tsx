import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)' }}>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)' }}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
