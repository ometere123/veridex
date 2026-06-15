import { TableRowSkeleton, Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Skeleton className="h-9 w-52 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />
      <div className="rounded-2xl p-6" style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)' }}>
        <table className="w-full">
          <tbody>
            {[...Array(10)].map((_, i) => <TableRowSkeleton key={i} cols={8} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
