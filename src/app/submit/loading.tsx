import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <Skeleton className="h-9 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-xl p-6 space-y-4"
          style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)' }}>
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
