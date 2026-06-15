import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-12">
      <Skeleton className="mb-2 h-9 w-56" />
      <div className="rounded-[28px] p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10" /></div>
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
