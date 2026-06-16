'use client';

import { useState, useEffect } from 'react';
import { RANK_TIERS, CATEGORIES, TIER_HEX, TIER_STARS } from '@/constants';
import { cn } from '@/utils';
import type { RankTier } from '@/types';
import Link from 'next/link';
import type { LeaderboardEntry } from '@/types';

interface Analytics {
  total_projects: number;
  total_evaluations: number;
  average_score: number;
  ranked_projects: number;
  tier_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
}

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circ - (pct / 100) * circ;
  const color = score >= 75 ? '#6b8e7a' : score >= 50 ? '#b8a46a' : '#b8633f';

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(107,142,122,0.10)" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="70" y="66" textAnchor="middle" fontSize="26" fontWeight="800" fill={color} fontFamily="monospace">
        {score.toFixed(1)}
      </text>
      <text x="70" y="84" textAnchor="middle" fontSize="10" fill="#9b938a" fontFamily="system-ui" letterSpacing="2">
        MEAN
      </text>
    </svg>
  );
}

function TierBar({ tier, count, total, color }: { tier: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-right text-xs font-mono font-bold" style={{ color }}>{TIER_STARS[tier as RankTier] ?? tier}</span>
      <div className="flex-1 h-5 rounded-sm overflow-hidden" style={{ background: 'rgba(107,142,122,0.08)' }}>
        <div
          className="h-full rounded-sm flex items-center pl-2 transition-all duration-700"
          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, background: color }}
        >
          {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
        </div>
      </div>
      <span className="w-8 text-right text-[10px] font-mono" style={{ color: '#9b938a' }}>
        {pct > 0 ? `${Math.round(pct)}%` : '—'}
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/rankings').then((r) => r.json()),
    ])
      .then(([analytics, rankings]) => {
        setData(analytics);
        setEntries(rankings.entries ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalTiers = RANK_TIERS.reduce((a, t) => a + (data?.tier_distribution?.[t.tier] ?? 0), 0);
  const catData = CATEGORIES
    .map((c) => ({ cat: c, count: data?.category_distribution?.[c] ?? 0 }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);
  const totalCat = catData.reduce((a, d) => a + d.count, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      {/* ── Page title ── */}
      <div className="mb-10">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#9b938a' }}>Network Metrics</p>
        <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>Protocol Overview</h1>
      </div>

      {/* ── Top: score ring + counters ── */}
      <div className="mb-8 flex flex-col sm:flex-row gap-6 items-stretch">

        {/* Score ring card */}
        <div className="flex flex-col items-center justify-center rounded-2xl p-6 min-w-[180px]"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
          {loading
            ? <div className="w-[140px] h-[140px] rounded-full animate-pulse" style={{ background: 'rgba(107,142,122,0.08)' }} />
            : <ScoreRing score={data?.average_score ?? 0} />
          }
          <p className="mt-2 text-[10px] uppercase tracking-widest" style={{ color: '#9b938a' }}>Platform Average</p>
        </div>

        {/* Counter column */}
        <div className="flex-1 grid grid-cols-1 gap-3">
          {[
            { label: 'Submissions registered', value: data?.total_projects ?? 0, icon: '◈' },
            { label: 'Assessments completed', value: data?.total_evaluations ?? 0, icon: '✦' },
            { label: 'Entries with active standings', value: data?.ranked_projects ?? 0, icon: '▲' },
          ].map((s) => (
            <div key={s.label}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.10)' }}>
              <div className="flex items-center gap-3">
                <span className="text-base" style={{ color: '#6b8e7a' }}>{s.icon}</span>
                <span className="text-sm" style={{ color: '#6b6360' }}>{s.label}</span>
              </div>
              <span className="text-2xl font-black font-mono" style={{ color: '#1a1612' }}>
                {loading ? '—' : s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tier breakdown ── */}
      <div className="mb-6 rounded-2xl p-6"
        style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold" style={{ color: '#1a1612' }}>Tier Breakdown</h2>
          <span className="text-xs font-mono" style={{ color: '#9b938a' }}>{totalTiers} total</span>
        </div>
        <div className="space-y-2">
          {RANK_TIERS.map((t) => (
            <TierBar
              key={t.tier}
              tier={t.tier}
              count={data?.tier_distribution?.[t.tier] ?? 0}
              total={totalTiers}
              color={TIER_HEX[t.tier]}
            />
          ))}
        </div>
      </div>

      {/* ── Category + top entries side by side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Category pills */}
        <div className="lg:col-span-2 rounded-2xl p-6"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#1a1612' }}>Segment Split</h2>
          {catData.length === 0
            ? <p className="text-sm" style={{ color: '#9b938a' }}>No data yet.</p>
            : <div className="flex flex-wrap gap-2">
                {catData.map((d) => {
                  const pct = totalCat > 0 ? Math.round((d.count / totalCat) * 100) : 0;
                  return (
                    <div key={d.cat}
                      className="flex flex-col items-center rounded-xl px-4 py-3"
                      style={{ background: 'rgba(107,142,122,0.06)', border: '1px solid rgba(107,142,122,0.12)', minWidth: 72 }}>
                      <span className="text-xl font-black font-mono" style={{ color: '#6b8e7a' }}>{pct}%</span>
                      <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: '#9b938a' }}>{d.cat}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#b8b0a8' }}>{d.count}</span>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Top entries list */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#1a1612' }}>Leading Submissions</h2>
          </div>
          {entries.length === 0
            ? <p className="px-5 py-8 text-sm" style={{ color: '#9b938a' }}>No ranked submissions yet.</p>
            : <div>
                {entries.slice(0, 8).map((e, i) => (
                  <Link key={e.project_id} href={`/project/${e.project_id}`}
                    className={cn('flex items-center justify-between px-5 py-3 transition-colors')}
                    style={{ borderBottom: i < 7 ? '1px solid rgba(107,142,122,0.06)' : undefined }}
                    onMouseEnter={(el) => (el.currentTarget.style.background = 'rgba(107,142,122,0.04)')}
                    onMouseLeave={(el) => (el.currentTarget.style.background = 'transparent')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono w-5 text-right shrink-0"
                        style={{ color: i === 0 ? '#b8a46a' : '#c8c0b8' }}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#1a1612' }}>{e.project_name}</p>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9b938a' }}>{e.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black font-mono" style={{ color: '#6b8e7a' }}>
                        {e.overall_score}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ background: 'rgba(107,142,122,0.08)', color: '#6b8e7a' }}>
                        {TIER_STARS[e.tier as RankTier] ?? e.tier}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
