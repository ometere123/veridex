'use client';

import { useState, useEffect } from 'react';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import type { LeaderboardEntry } from '@/types';

const CATEGORIES = ['Overall','DeFi','AI','Infrastructure','Gaming','RWA','DePIN','Consumer'];

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Reputation Index</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Categorical standings verified through GenLayer consensus.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="px-4 py-2 rounded-sm text-sm font-medium transition-all"
            style={
              category === c
                ? {
                    background: '#6b8e7a',
                    color: '#0a0f1a',
                    boxShadow: '0 0 12px rgba(107,142,122,0.25)',
                  }
                : {
                    background: 'rgba(107,142,122,0.06)',
                    border: '1px solid rgba(107,142,122,0.14)',
                    color: 'var(--muted)',
                  }
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div
        className="rounded-sm p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3" style={{ color: 'var(--muted-2)' }}>
            <span
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(107,142,122,0.2)', borderTopColor: '#6b8e7a' }}
            />
            Retrieving {category} reputation index…
          </div>
        ) : (
          <LeaderboardTable entries={entries} />
        )}
      </div>
    </div>
  );
}
