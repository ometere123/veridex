'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div
        className="max-w-md w-full rounded-sm p-8 text-center space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid rgba(248,113,113,0.18)' }}
      >
        <div
          className="w-14 h-14 rounded-sm flex items-center justify-center text-2xl mx-auto"
          style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171' }}
        >
          ⚠
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>An error occurred</h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {error.message || 'Something unexpected happened. Please retry.'}
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono" style={{ color: 'var(--muted-2)' }}>
            Ref: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="w-full py-2.5 rounded-sm font-semibold text-sm transition-all"
          style={{
            background: '#00d9ff',
            color: '#0a0f1a',
            boxShadow: '0 0 16px rgba(0,217,255,0.3)',
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
