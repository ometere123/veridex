import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Skeleton className="mb-2 h-9 w-64" />
      <Skeleton className="mb-8 h-4 w-96" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-[28px] p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
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
