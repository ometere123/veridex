'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { RegistryEntry } from '@/types';

interface Analytics {
  total_projects?: number;
  total_evaluations?: number;
  average_score?: number;
  ranked_projects?: number;
  category_distribution?: Record<string, number>;
}

export default function SignalsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()).catch(() => ({})),
      fetch('/api/registry').then((r) => r.json()).catch(() => ({ entries: [] })),
    ])
      .then(([analyticsData, registryData]) => {
        setAnalytics(analyticsData);
        setEntries(registryData.entries ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const riskDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const entry of entries) {
      dist[entry.risk_band] = (dist[entry.risk_band] ?? 0) + 1;
    }
    return dist;
  }, [entries]);

  const levelDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const entry of entries) {
      dist[entry.verification_level] = (dist[entry.verification_level] ?? 0) + 1;
    }
    return dist;
  }, [entries]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="mb-3 text-[11px] uppercase tracking-[0.26em]" style={{ color: '#8a8178' }}>Risk Signals</p>
        <h1 className="text-4xl font-semibold" style={{ color: '#1a1612' }}>Evidence quality across the registry.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: '#5f5a52' }}>
          Signals summarize verification coverage, level distribution, risk bands, stale dossiers, and category evidence density. This is protocol transparency, not a ranking race.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Dossiers" value={analytics.total_projects ?? 0} />
        <Stat label="Verifications" value={analytics.total_evaluations ?? 0} />
        <Stat label="Avg confidence" value={`${analytics.average_score ?? 0}%`} />
        <Stat label="Registry entries" value={analytics.ranked_projects ?? entries.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Distribution title="Verification Level Distribution" data={levelDistribution} loading={loading} />
        <Distribution title="Risk Band Distribution" data={riskDistribution} loading={loading} />
        <Distribution title="Category Coverage" data={analytics.category_distribution ?? {}} loading={loading} />

        <div className="rounded-[32px] bg-white p-6" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1a1612' }}>Recent registry signals</h2>
          {entries.length === 0 ? (
            <p className="text-sm" style={{ color: '#5f5a52' }}>No registry entries yet.</p>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, 6).map((entry) => (
                <Link key={entry.dossier_id} href={`/dossier/${entry.dossier_id}`} className="block rounded-2xl p-4" style={{ background: 'rgba(107,142,122,0.06)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold" style={{ color: '#1a1612' }}>{entry.name}</span>
                    <span className="text-xs" style={{ color: '#8a8178' }}>{entry.evidence_confidence}%</span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em]" style={{ color: '#8a8178' }}>{entry.verification_level} / {entry.risk_band}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[28px] bg-white p-5" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
      <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#8a8178' }}>{label}</div>
      <div className="mt-2 text-2xl font-semibold" style={{ color: '#4f8f68' }}>{value}</div>
    </div>
  );
}

function Distribution({ title, data, loading }: { title: string; data: Record<string, number>; loading: boolean }) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <div className="rounded-[32px] bg-white p-6" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
      <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1a1612' }}>{title}</h2>
      {loading ? (
        <p className="text-sm" style={{ color: '#5f5a52' }}>Loading signals...</p>
      ) : total === 0 ? (
        <p className="text-sm" style={{ color: '#5f5a52' }}>No signal data yet.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, value]) => {
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-xs" style={{ color: '#5f5a52' }}>
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{value} / {pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(107,142,122,0.10)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#5f8d6b' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
