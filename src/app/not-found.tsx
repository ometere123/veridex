import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="text-8xl font-black font-mono mb-4 select-none"
          style={{ color: 'rgba(107,142,122,0.18)' }}
        >
          404
        </div>
        <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1a1612' }}>
          Page not found
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: '#6b6360' }}>
          This route does not exist or has moved. It may also reference an initiative
          that has not been assessed yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="font-semibold px-6 py-3 rounded-full text-sm transition-all"
            style={{ background: '#6b8e7a', color: '#ffffff' }}
          >
            Return home
          </Link>
          <Link
            href="/tiers"
            className="font-semibold px-6 py-3 rounded-full text-sm transition-all"
            style={{ background: 'rgba(107,142,122,0.08)', border: '1px solid rgba(107,142,122,0.18)', color: '#6b8e7a' }}
          >
            View standings
          </Link>
        </div>
      </div>
    </div>
  );
}
