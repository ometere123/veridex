import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Large 404 */}
        <div
          className="text-8xl font-black font-mono mb-4 select-none"
          style={{
            background: 'linear-gradient(135deg, #00d9ff 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 24px rgba(0,217,255,0.3))',
          }}
        >
          404
        </div>

        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
          Route Not Found
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--muted)' }}>
          This route does not exist or has been relocated.
          It could also reference a submission that has not been assessed yet.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="font-semibold px-6 py-3 rounded-sm text-sm transition-all"
            style={{
              background: '#00d9ff',
              color: '#0a0f1a',
              boxShadow: '0 0 16px rgba(0,217,255,0.3)',
            }}
          >
            Return Home
          </Link>
          <Link
            href="/rankings"
            className="font-semibold px-6 py-3 rounded-sm text-sm transition-all"
            style={{
              background: 'rgba(0,217,255,0.06)',
              border: '1px solid rgba(0,217,255,0.16)',
              color: '#00d9ff',
            }}
          >
            View Standings
          </Link>
        </div>
      </div>
    </div>
  );
}
