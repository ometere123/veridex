'use client';

import { useEffect, useMemo, useState } from 'react';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { ProjectBoard } from '@/components/ProjectBoard';
import { CATEGORIES } from '@/constants';
import type { LeaderboardEntry } from '@/types';

export default function RankingsPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [view, setView] = useState<'table' | 'board'>('table');

  useEffect(() => {
    fetch('/api/rankings')
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (category !== 'All') list = list.filter((entry) => entry.category === category);
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((entry) => entry.project_name.toLowerCase().includes(query));
    }
    return list;
  }, [entries, category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Rankings</p>
          <h1 className="mt-3 text-4xl font-semibold" style={{ color: '#1a1612' }}>Veridex Reputation Tiers</h1>
          <p className="mt-3 text-sm leading-7" style={{ color: '#6b6360' }}>
            Sourced from on-chain contract state. Verification score, tier, and evidence history are recorded on-chain.
          </p>
        </div>
        <div className="rounded-[28px] p-6" style={{ background: '#ffffff', border: '1px solid rgba(107, 142, 122, 0.12)' }}>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Filters</p>
          <div className="mt-4 flex flex-col gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search initiatives"
              className="w-full rounded-2xl px-4 py-3 text-sm"
              style={{ background: 'rgba(107, 142, 122, 0.05)', color: '#1a1612', outline: 'none' }}
            />
            <div className="flex flex-wrap gap-2">
              {['All', ...CATEGORIES].map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className="rounded-full px-3 py-2 text-xs"
                  style={category === item ? { background: '#6b8e7a', color: '#ffffff' } : { background: 'rgba(107, 142, 122, 0.08)', color: '#6b6360' }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm" style={{ color: '#6b6360' }}>
          {loading ? 'Loading ranked initiatives...' : `${filtered.length} initiative${filtered.length === 1 ? '' : 's'} in view`}
        </p>
        <div className="flex gap-2">
          {(['table', 'board'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em]"
              style={view === item ? { background: '#b8633f', color: '#ffffff' } : { background: 'rgba(184, 99, 63, 0.08)', color: '#b8633f' }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] p-6" style={{ background: '#ffffff', border: '1px solid rgba(107, 142, 122, 0.12)' }}>
        {loading ? (
          <div className="py-20 text-center text-sm" style={{ color: '#6b6360' }}>Fetching reputation tiers...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg" style={{ color: '#1a1612' }}>No initiatives match these filters.</p>
            <p className="mt-2 text-sm" style={{ color: '#6b6360' }}>Try another category or clear the search.</p>
          </div>
        ) : view === 'table' ? (
          <LeaderboardTable entries={filtered} />
        ) : (
          <ProjectBoard entries={filtered} columns={3} />
        )}
      </div>
    </div>
  );
}
