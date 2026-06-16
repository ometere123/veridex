'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center space-y-4"
        style={{ background: '#ffffff', border: '1px solid rgba(184,99,63,0.18)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto"
          style={{ background: 'rgba(184,99,63,0.08)', color: '#b8633f' }}
        >
          ⚠
        </div>
        <h2 className="text-xl font-bold" style={{ color: '#1a1612' }}>Something went wrong</h2>
        <p className="text-sm" style={{ color: '#6b6360' }}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono" style={{ color: '#9b938a' }}>
            Ref: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{ background: '#6b8e7a', color: '#ffffff' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
