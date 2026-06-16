'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, RANK_TIERS, TIER_HEX, TIER_STARS } from '@/constants';
import type { LeaderboardEntry, RankTier } from '@/types';

const TIER_DESC: Record<string, string> = {
  'S+': 'Best-in-class verified',
  'S':  'Exceptional standing',
  'A':  'Strong reputation',
  'B':  'Credible presence',
  'C':  'Provisional',
  'D':  'Needs improvement',
  'F':  'Insufficient evidence',
};

export default function TiersPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/rankings')
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) counts[e.tier] = (counts[e.tier] ?? 0) + 1;
    return counts;
  }, [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (activeTier) list = list.filter((e) => e.tier === activeTier);
    if (activeCategory !== 'All') list = list.filter((e) => e.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.project_name.toLowerCase().includes(q));
    }
    return list;
  }, [entries, activeTier, activeCategory, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#9b938a' }}>Tiers</p>
        <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>Reputation Tier Map</h1>
      </div>

      {/* Tier spectrum bar */}
      <div className="mb-8 flex h-2 overflow-hidden rounded-xl">
        {RANK_TIERS.map((t) => {
          const count = tierCounts[t.tier] ?? 0;
          const pct = entries.length > 0 ? (count / entries.length) * 100 : 100 / RANK_TIERS.length;
          return (
            <div
              key={t.tier}
              style={{ width: `${pct}%`, background: TIER_HEX[t.tier], minWidth: count > 0 ? 4 : 0 }}
              title={`${t.tier}: ${count}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* LEFT: Tier ladder */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTier(null)}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-all"
            style={
              activeTier === null
                ? { background: '#1a1612', color: '#ffffff' }
                : { background: '#ffffff', color: '#6b6360', border: '1px solid rgba(107,142,122,0.12)' }
            }
          >
            <span>All Tiers</span>
            <span className="font-mono font-black">{entries.length}</span>
          </button>

          {RANK_TIERS.map((t) => {
            const count = tierCounts[t.tier] ?? 0;
            const active = activeTier === t.tier;
            return (
              <button
                key={t.tier}
                onClick={() => setActiveTier(active ? null : t.tier)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                style={
                  active
                    ? { background: TIER_HEX[t.tier] }
                    : { background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }
                }
              >
                <span
                  className="w-8 shrink-0 text-center font-mono text-base font-black leading-none"
                  style={{ color: active ? '#ffffff' : TIER_HEX[t.tier] }}
                >
                  {TIER_STARS[t.tier as RankTier]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: active ? '#ffffff' : '#1a1612' }}>
                    {TIER_DESC[t.tier] ?? t.tier}
                  </p>
                  <p className="font-mono text-[11px]" style={{ color: active ? 'rgba(255,255,255,0.65)' : '#9b938a' }}>
                    {count} entr{count === 1 ? 'y' : 'ies'}
                  </p>
                </div>
                <div
                  className="h-1 w-10 shrink-0 overflow-hidden rounded-full"
                  style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(107,142,122,0.10)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: entries.length > 0 ? `${(count / entries.length) * 100}%` : '0%',
                      background: active ? 'rgba(255,255,255,0.8)' : TIER_HEX[t.tier],
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: Entry list */}
        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search initiatives..."
              className="flex-1 rounded-xl px-4 py-2.5 text-sm"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(107,142,122,0.14)',
                color: '#1a1612',
                outline: 'none',
              }}
            />
            <div className="flex flex-wrap gap-1.5">
              {['All', ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className="rounded-lg px-3 py-2 text-[11px] font-medium uppercase tracking-wide"
                  style={
                    activeCategory === c
                      ? { background: '#6b8e7a', color: '#ffffff' }
                      : { background: 'rgba(107,142,122,0.06)', color: '#6b6360' }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16" style={{ color: '#6b6360' }}>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2"
                style={{ borderColor: 'rgba(107,142,122,0.2)', borderTopColor: '#6b8e7a' }}
              />
              Fetching tier data...
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm" style={{ color: '#9b938a' }}>
              No entries match these filters.
            </p>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((e) => (
                <Link
                  key={e.project_id}
                  href={`/project/${e.project_id}`}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
                  style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.10)' }}
                  onMouseEnter={(el) => (el.currentTarget.style.borderColor = 'rgba(107,142,122,0.28)')}
                  onMouseLeave={(el) => (el.currentTarget.style.borderColor = 'rgba(107,142,122,0.10)')}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black"
                    style={{ background: `${TIER_HEX[e.tier]}18`, color: TIER_HEX[e.tier] }}
                  >
                    {TIER_STARS[e.tier as RankTier]}
                  </span>
                  <span className="w-5 shrink-0 text-right font-mono text-[11px]" style={{ color: '#c8c0b8' }}>
                    {e.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: '#1a1612' }}>{e.project_name}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider" style={{ color: '#9b938a' }}>{e.category}</p>
                  </div>
                  <div className="hidden w-32 shrink-0 items-center gap-2 sm:flex">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(107,142,122,0.1)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${e.overall_score}%`, background: TIER_HEX[e.tier] }}
                      />
                    </div>
                    <span className="w-7 text-right font-mono text-xs font-bold" style={{ color: TIER_HEX[e.tier] }}>
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
