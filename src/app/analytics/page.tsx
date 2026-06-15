'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { RANK_TIERS, CATEGORIES, TIER_HEX } from '@/constants';
import type { LeaderboardEntry } from '@/types';

interface Analytics {
  total_projects: number;
  total_evaluations: number;
  average_score: number;
  ranked_projects: number;
  tier_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
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

  const tierChartData = RANK_TIERS.map((t) => ({
    tier: t.tier,
    count: data?.tier_distribution?.[t.tier] ?? 0,
    fill: TIER_HEX[t.tier],
  }));

  const catChartData = CATEGORIES.map((c) => ({
    cat: c,
    count: data?.category_distribution?.[c] ?? 0,
  }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-3 text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Analytics</p>
        <h1 className="mb-3 text-4xl font-semibold" style={{ color: '#1a1612' }}>Network Metrics</h1>
        <p className="text-base leading-8" style={{ color: '#6b6360' }}>
          Real-time protocol metrics sourced from on-chain contract state.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Submissions', value: loading ? '-' : data?.total_projects ?? 0 },
          { label: 'Assessments Run', value: loading ? '-' : data?.total_evaluations ?? 0 },
          { label: 'Ranked Entries', value: loading ? '-' : data?.ranked_projects ?? 0 },
          { label: 'Protocol Mean', value: loading ? '-' : (data?.average_score ?? 0).toFixed(1) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[28px] p-5 text-center"
            style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
          >
            <div className="mb-1 text-3xl font-black font-mono" style={{ color: '#6b8e7a' }}>
              {s.value}
            </div>
            <div className="text-[11px] uppercase tracking-wider" style={{ color: '#9b938a' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] p-6" style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
          <h2 className="mb-5 text-sm font-semibold" style={{ color: '#1a1612' }}>Tier Allocation</h2>
          <div className="h-44 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,142,122,0.08)" vertical={false} />
                <XAxis dataKey="tier" tick={{ fill: '#9b938a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9b938a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.14)', borderRadius: '16px', color: '#1a1612', fontSize: 12 }}
                  cursor={{ fill: 'rgba(107,142,122,0.05)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tierChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {RANK_TIERS.map((t) => (
              <div key={t.tier} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: TIER_HEX[t.tier] }} />
                <span className="text-[11px] font-mono" style={{ color: '#6b6360' }}>
                  {t.tier} <span style={{ color: '#9b938a' }}>({data?.tier_distribution?.[t.tier] ?? 0})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] p-6" style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
          <h2 className="mb-5 text-sm font-semibold" style={{ color: '#1a1612' }}>Segment Composition</h2>
          <div className="space-y-3">
            {catChartData.length === 0 ? (
              <p className="text-sm" style={{ color: '#9b938a' }}>No entries recorded yet.</p>
            ) : catChartData.map((d) => {
              const total = catChartData.reduce((a, b) => a + b.count, 0);
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;

              return (
                <div key={d.cat}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span style={{ color: '#6b6360' }}>{d.cat}</span>
                    <span style={{ color: '#9b938a' }}>{d.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(107,142,122,0.08)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg,#6b8e7a,#b8633f)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="rounded-[28px] p-6" style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
          <h2 className="mb-5 text-sm font-semibold" style={{ color: '#1a1612' }}>Highest-Ranked Submissions</h2>
          <LeaderboardTable entries={entries.slice(0, 10)} />
        </div>
      ) : null}
    </div>
  );
}
