import { TableRowSkeleton, Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Skeleton className="mb-2 h-9 w-52" />
      <Skeleton className="mb-8 h-4 w-96" />
      <div className="rounded-[32px] p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <table className="w-full">
          <tbody>
            {[...Array(10)].map((_, i) => <TableRowSkeleton key={i} cols={8} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
