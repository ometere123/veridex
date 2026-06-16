'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { RegistryEntry } from '@/types';

interface Analytics {
  total_projects?: number;
  total_evaluations?: number;
  average_score?: number;
  ranked_projects?: number;
  category_distribution?: Record<string, number>;
}

const COMMON_MISSING = ['Security audit', 'Bug bounty', 'Verifiable team', 'GitHub activity', 'Tokenomics detail'];

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

  const riskDistribution = useMemo(() => distribution(entries.map((entry) => entry.risk_band)), [entries]);
  const levelDistribution = useMemo(() => distribution(entries.map((entry) => entry.verification_level)), [entries]);
  const staleCount = entries.filter((entry) => isStale(entry.expires_at)).length;
  const highRiskCount = entries.filter((entry) => entry.risk_band === 'HIGH' || entry.risk_band === 'CRITICAL').length;
  const averageSources = entries.length
    ? Math.round((entries.reduce((sum, entry) => sum + entry.verified_source_count, 0) / entries.length) * 10) / 10
    : 0;
  const strongestCategories = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();
    for (const entry of entries) {
      const current = grouped.get(entry.category) ?? { total: 0, count: 0 };
      current.total += entry.evidence_confidence;
      current.count += 1;
      grouped.set(entry.category, current);
    }
    return Array.from(grouped.entries())
      .map(([category, value]) => ({ category, avg: Math.round(value.total / value.count), count: value.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [entries]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <section className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[#8effc3]">Risk intelligence board</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight text-[#f5fff7]">Signals from the evidence registry.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9bb4a6]">
          Monitor verification level distribution, risk bands, stale dossiers, source coverage, and evidence strength from GenLayer-backed dossier state.
        </p>
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Dossiers" value={analytics.total_projects ?? 0} />
        <Stat label="Verifications" value={analytics.total_evaluations ?? 0} />
        <Stat label="Avg confidence" value={`${analytics.average_score ?? 0}%`} />
        <Stat label="Stale dossiers" value={staleCount} />
        <Stat label="High risk" value={highRiskCount} />
        <Stat label="Avg sources" value={averageSources} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Distribution title="Verification level distribution" data={levelDistribution} loading={loading} />
        <Distribution title="Risk band distribution" data={riskDistribution} loading={loading} />
        <IntelligenceCard title="Common missing evidence">
          <div className="flex flex-wrap gap-2">
            {COMMON_MISSING.map((item) => (
              <span key={item} className="rounded-full border border-[#d4ad634d] bg-[#d4ad6314] px-3 py-1 text-xs text-[#d4ad63]">{item}</span>
            ))}
          </div>
        </IntelligenceCard>
        <IntelligenceCard title="Categories with strongest evidence">
          {strongestCategories.length === 0 ? (
            <p className="text-sm text-[#9bb4a6]">No category signal yet.</p>
          ) : (
            <div className="space-y-3">
              {strongestCategories.map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex justify-between text-xs text-[#9bb4a6]">
                    <span>{item.category}</span>
                    <span>{item.avg}% / {item.count} dossier{item.count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#ffffff12]">
                    <div className="h-full rounded-full bg-[#8effc3]" style={{ width: `${item.avg}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </IntelligenceCard>
      </div>

      <IntelligenceCard title="Recent registry signals" className="mt-6">
        {entries.length === 0 ? (
          <p className="text-sm text-[#9bb4a6]">No registry entries yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {entries.slice(0, 8).map((entry) => (
              <Link key={entry.dossier_id} href={`/dossier/${entry.dossier_id}`} className="rounded-3xl border border-[#8effc31f] bg-[#ffffff08] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-[#f5fff7]">{entry.name}</span>
                  <span className="font-mono text-xs text-[#8effc3]">{entry.evidence_confidence}%</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#789685]">{entry.verification_level} / {entry.risk_band}</p>
              </Link>
            ))}
          </div>
        )}
      </IntelligenceCard>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[28px] border border-[#8effc326] bg-[#0b1712cc] p-5 backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[#6fae8e]">{label}</div>
      <div className="mt-2 font-mono text-2xl font-semibold text-[#f5fff7]">{value}</div>
    </div>
  );
}

function IntelligenceCard({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[34px] border border-[#8effc326] bg-[#0b1712cc] p-6 backdrop-blur-xl ${className}`}>
      <h2 className="mb-5 text-xl font-semibold text-[#f5fff7]">{title}</h2>
      {children}
    </section>
  );
}

function Distribution({ title, data, loading }: { title: string; data: Record<string, number>; loading: boolean }) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  return (
    <IntelligenceCard title={title}>
      {loading ? (
        <p className="text-sm text-[#9bb4a6]">Loading signals...</p>
      ) : total === 0 ? (
        <p className="text-sm text-[#9bb4a6]">No signal data yet.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, value]) => {
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-xs text-[#9bb4a6]">
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{value} / {pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#ffffff12]">
                  <div className="h-full rounded-full bg-[#8effc3]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </IntelligenceCard>
  );
}

function distribution(values: string[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value || 'UNKNOWN'] = (acc[value || 'UNKNOWN'] ?? 0) + 1;
    return acc;
  }, {});
}

function isStale(expiresAt?: string) {
  if (!expiresAt) return false;
  const numeric = Number(expiresAt);
  const expires = Number.isFinite(numeric) && numeric > 0 ? numeric * 1000 : Date.parse(expiresAt);
  if (!Number.isFinite(expires)) return false;
  return Date.now() > expires;
}
