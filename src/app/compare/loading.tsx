import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
      <Skeleton className="h-9 w-56 mb-2" />
      <div className="rounded-xl p-6 space-y-4"
        style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.08)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10" /></div>
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
