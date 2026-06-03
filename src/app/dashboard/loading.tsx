import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between mb-8">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-5 text-center space-y-2" style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.08)' }}>
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.08)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(230,190,247,0.08)' }}>
          <Skeleton className="h-5 w-36" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(230,190,247,0.04)' }}>
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
