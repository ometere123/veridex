'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES, TIER_HEX } from '@/constants';
import type { LeaderboardEntry } from '@/types';

const ALL_CATS = ['Overall', ...CATEGORIES];

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
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#9b938a' }}>Index</p>
        <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>Reputation Index</h1>
        <p className="mt-2 text-sm" style={{ color: '#6b6360' }}>
          Categorical standings verified through GenLayer consensus.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr]">
        {/* LEFT: Category column */}
        <div className="flex flex-row flex-wrap gap-1.5 lg:flex-col lg:gap-1">
          {ALL_CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="rounded-xl px-3 py-2.5 text-left text-sm transition-all"
              style={
                category === c
                  ? { background: '#6b8e7a', color: '#ffffff', fontWeight: 600 }
                  : { color: '#6b6360' }
              }
              onMouseEnter={(e) => {
                if (category !== c) (e.currentTarget as HTMLElement).style.background = 'rgba(107,142,122,0.06)';
              }}
              onMouseLeave={(e) => {
                if (category !== c) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* RIGHT: Signal board */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20" style={{ color: '#6b6360' }}>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2"
                style={{ borderColor: 'rgba(107,142,122,0.2)', borderTopColor: '#6b8e7a' }}
              />
              Retrieving {category} index...
            </div>
          ) : entries.length === 0 ? (
            <p className="py-20 text-center text-sm" style={{ color: '#9b938a' }}>
              No ranked entries in this segment yet.
            </p>
          ) : (
            <div
              className="overflow-hidden rounded-2xl"
              style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
            >
              {entries.map((e, i) => (
                <Link
                  key={e.project_id}
                  href={`/project/${e.project_id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{
                    borderBottom: i < entries.length - 1 ? '1px solid rgba(107,142,122,0.06)' : undefined,
                  }}
                  onMouseEnter={(el) => ((el.currentTarget as HTMLElement).style.background = 'rgba(107,142,122,0.03)')}
                  onMouseLeave={(el) => ((el.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  {/* Rank */}
                  <span
                    className="w-8 shrink-0 text-right font-mono text-sm font-black"
                    style={{
                      color: i === 0 ? '#b8a46a' : i === 1 ? '#9b938a' : i === 2 ? '#8b7355' : '#c8c0b8',
                    }}
                  >
                    {i + 1}
                  </span>

                  {/* Tier badge */}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-black"
                    style={{ background: `${TIER_HEX[e.tier]}15`, color: TIER_HEX[e.tier] }}
                  >
                    {e.tier}
                  </span>

                  {/* Name + category */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: '#1a1612' }}>{e.project_name}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9b938a' }}>{e.category}</p>
                  </div>

                  {/* Score bar + score */}
                  <div className="hidden w-36 shrink-0 items-center gap-2 md:flex">
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full"
                      style={{ background: 'rgba(107,142,122,0.10)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${e.overall_score}%`, background: TIER_HEX[e.tier] }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono text-xs font-bold" style={{ color: '#1a1612' }}>
                      {e.overall_score}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
