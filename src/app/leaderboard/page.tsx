'use client';

import { useState, useEffect } from 'react';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import type { LeaderboardEntry } from '@/types';

const CATEGORIES = ['Overall', 'DeFi', 'AI', 'Infrastructure', 'Gaming', 'RWA', 'DePIN', 'Consumer'];

export default function LeaderboardPage() {
  const [category, setCategory] = useState('Overall');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?category=${category.toLowerCase()}`)
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-3 text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Index</p>
        <h1 className="mb-3 text-4xl font-semibold" style={{ color: '#1a1612' }}>Reputation Index</h1>
        <p className="text-base leading-8" style={{ color: '#6b6360' }}>
          Categorical standings verified through GenLayer consensus.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="rounded-2xl px-4 py-2 text-sm font-medium transition-all"
            style={
              category === c
                ? {
                    background: '#6b8e7a',
                    color: '#ffffff',
                    boxShadow: '0 12px 30px rgba(107,142,122,0.18)',
                  }
                : {
                    background: 'rgba(107,142,122,0.05)',
                    border: '1px solid rgba(107,142,122,0.14)',
                    color: '#6b6360',
                  }
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-[32px] p-6" style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20" style={{ color: '#6b6360' }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(107,142,122,0.2)', borderTopColor: '#6b8e7a' }} />
            Retrieving {category} reputation index...
          </div>
        ) : (
          <LeaderboardTable entries={entries} />
        )}
      </div>
    </div>
  );
}
