'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES } from '@/constants';
import type { RegistryEntry, RiskBand, VerificationLevel } from '@/types';

const LEVEL_LABELS: Record<string, string> = {
  VERIFIED_PLUS: 'Verified+',
  VERIFIED: 'Verified',
  SUBSTANTIATED: 'Substantiated',
  DEVELOPING: 'Developing',
  LIMITED_EVIDENCE: 'Limited Evidence',
  HIGH_RISK: 'High Risk',
  UNVERIFIABLE: 'Unverifiable',
  UNVERIFIED: 'Unverified',
};

const RISK_COLORS: Record<RiskBand | string, string> = {
  LOW: '#4f8f68',
  MODERATE: '#8b8a55',
  ELEVATED: '#b38a45',
  HIGH: '#b8633f',
  CRITICAL: '#8f3d3d',
  UNKNOWN: '#8a8178',
};

export default function RegistryPage() {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('overall');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/registry?category=${category}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) =>
      entry.name.toLowerCase().includes(query) ||
      entry.category.toLowerCase().includes(query) ||
      entry.website.toLowerCase().includes(query),
    );
  }, [entries, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.26em]" style={{ color: '#8a8178' }}>
            Public Registry
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold" style={{ color: '#1a1612' }}>
            Source-grounded verification dossiers.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: '#5f5a52' }}>
            Browse dossiers by verification level, evidence confidence, risk band, source count, and proof completeness. Registry placement is secondary to the proof trail.
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-6" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#8a8178' }}>Registry filters</p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dossier, category, or website"
            className="mt-4 w-full rounded-2xl px-4 py-3 text-sm"
            style={{ background: 'rgba(107,142,122,0.06)', color: '#1a1612', outline: 'none' }}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {['overall', ...CATEGORIES.map((item) => item.toLowerCase())].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className="rounded-full px-3 py-2 text-xs capitalize"
                style={category === item
                  ? { background: '#5f8d6b', color: '#ffffff' }
                  : { background: 'rgba(107,142,122,0.08)', color: '#5f5a52' }}
              >
                {item === 'overall' ? 'Overall' : item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm" style={{ color: '#5f5a52' }}>
        {loading ? 'Reading registry from GenLayer...' : `${filtered.length} dossier${filtered.length === 1 ? '' : 's'} in view`}
      </div>

      <div className="overflow-hidden rounded-[32px] bg-white" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
        {loading ? (
          <div className="py-24 text-center text-sm" style={{ color: '#5f5a52' }}>Fetching verification registry...</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-lg" style={{ color: '#1a1612' }}>No dossiers match these filters.</p>
            <p className="mt-2 text-sm" style={{ color: '#5f5a52' }}>Submit evidence or try another category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(107,142,122,0.12)' }}>
                  {['Position', 'Dossier', 'Level', 'Evidence', 'Risk', 'Sources', 'Last verified'].map((head) => (
                    <th key={head} className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#8a8178' }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.dossier_id} style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}>
                    <td className="px-5 py-4 font-mono text-xs" style={{ color: '#5f8d6b' }}>
                      {entry.registry_position || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/dossier/${entry.dossier_id}`} className="font-semibold" style={{ color: '#1a1612' }}>
                        {entry.name || 'Untitled dossier'}
                      </Link>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em]" style={{ color: '#8a8178' }}>
                        {entry.category} / {entry.website || 'No website'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <LevelPill level={entry.verification_level} />
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold" style={{ color: '#1a1612' }}>
                      {entry.evidence_confidence}%
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${RISK_COLORS[entry.risk_band]}18`, color: RISK_COLORS[entry.risk_band] }}>
                        {entry.risk_band}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono" style={{ color: '#5f5a52' }}>
                      {entry.verified_source_count}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#5f5a52' }}>
                      {entry.last_verified_at || 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LevelPill({ level }: { level: VerificationLevel }) {
  const strong = level === 'VERIFIED_PLUS' || level === 'VERIFIED';
  const weak = level === 'HIGH_RISK' || level === 'UNVERIFIABLE';
  const color = strong ? '#4f8f68' : weak ? '#b8633f' : '#8b8a55';

  return (
    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${color}18`, color }}>
      {LEVEL_LABELS[level] ?? level}
    </span>
  );
}
