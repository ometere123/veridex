'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CATEGORIES } from '@/constants';
import type { RegistryEntry, RiskBand, VerificationLevel } from '@/types';

const LEVELS = ['ALL', 'VERIFIED_PLUS', 'VERIFIED', 'SUBSTANTIATED', 'DEVELOPING', 'LIMITED_EVIDENCE', 'HIGH_RISK', 'UNVERIFIABLE'];
const RISKS = ['ALL', 'LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL', 'UNKNOWN'];

const RISK_COLORS: Record<string, string> = {
  LOW: '#8effc3',
  MODERATE: '#b8d878',
  ELEVATED: '#d4ad63',
  HIGH: '#b8633f',
  CRITICAL: '#8f3d3d',
  UNKNOWN: '#789685',
};

export default function RegistryPage() {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('overall');
  const [level, setLevel] = useState('ALL');
  const [risk, setRisk] = useState('ALL');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'STALE'>('ALL');
  const [minConfidence, setMinConfidence] = useState(0);

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
    return entries.filter((entry) => {
      const stale = isStale(entry.expires_at);
      if (query && !`${entry.name} ${entry.category} ${entry.website}`.toLowerCase().includes(query)) return false;
      if (level !== 'ALL' && entry.verification_level !== level) return false;
      if (risk !== 'ALL' && entry.risk_band !== risk) return false;
      if (status === 'ACTIVE' && stale) return false;
      if (status === 'STALE' && !stale) return false;
      if (entry.evidence_confidence < minConfidence) return false;
      return true;
    });
  }, [entries, search, level, risk, status, minConfidence]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#8effc3]">Public verification index</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight text-[#f5fff7]">
            Browse public verification dossiers backed by GenLayer state.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9bb4a6]">
            Filter by evidence confidence, verification level, risk band, source coverage, and active/stale state. Registry position is context, not the product.
          </p>
        </div>

        <div className="rounded-[34px] border border-[#8effc326] bg-[#0b1712cc] p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">Registry filters</p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dossier, category, or website"
            className="mt-4 w-full rounded-2xl border border-[#8effc326] bg-[#ffffff08] px-4 py-3 text-sm text-[#f5fff7] outline-none placeholder:text-[#6f8b7c]"
          />
          <FilterRow label="Category">
            {['overall', ...CATEGORIES.map((item) => item.toLowerCase())].map((item) => (
              <FilterButton key={item} active={category === item} onClick={() => setCategory(item)}>
                {item === 'overall' ? 'Overall' : item}
              </FilterButton>
            ))}
          </FilterRow>
          <FilterRow label="Verification level">
            {LEVELS.map((item) => (
              <FilterButton key={item} active={level === item} onClick={() => setLevel(item)}>
                {friendly(item)}
              </FilterButton>
            ))}
          </FilterRow>
          <FilterRow label="Risk band">
            {RISKS.map((item) => (
              <FilterButton key={item} active={risk === item} onClick={() => setRisk(item)}>
                {friendly(item)}
              </FilterButton>
            ))}
          </FilterRow>
          <FilterRow label="Staleness">
            {(['ALL', 'ACTIVE', 'STALE'] as const).map((item) => (
              <FilterButton key={item} active={status === item} onClick={() => setStatus(item)}>
                {friendly(item)}
              </FilterButton>
            ))}
          </FilterRow>
          <label className="mt-4 block">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#6fae8e]">Minimum evidence confidence: {minConfidence}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={minConfidence}
              onChange={(event) => setMinConfidence(Number(event.target.value))}
              className="mt-3 w-full accent-[#8effc3]"
            />
          </label>
        </div>
      </section>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#9bb4a6]">
        <span>{loading ? 'Reading registry from GenLayer...' : `${filtered.length} dossier${filtered.length === 1 ? '' : 's'} in view`}</span>
        <span className="rounded-full border border-[#8effc326] bg-[#8effc30f] px-3 py-1 font-mono text-xs text-[#8effc3]">GenLayer source of truth</span>
      </div>

      {loading ? (
        <div className="rounded-[36px] border border-[#8effc326] bg-[#0b1712cc] p-16 text-center text-sm text-[#9bb4a6]">Fetching verification registry...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[36px] border border-dashed border-[#8effc326] bg-[#0b1712aa] p-16 text-center">
          <p className="text-xl text-[#f5fff7]">No dossiers match these filters.</p>
          <p className="mt-2 text-sm text-[#9bb4a6]">Try another evidence confidence range or submit a new dossier.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((entry) => (
            <RegistryDossierCard key={entry.dossier_id} entry={entry} />
          ))}
        </div>
      )}
    </main>
  );
}

function RegistryDossierCard({ entry }: { entry: RegistryEntry }) {
  const stale = isStale(entry.expires_at);
  const riskColor = RISK_COLORS[entry.risk_band] ?? RISK_COLORS.UNKNOWN;

  return (
    <Link href={`/dossier/${entry.dossier_id}`} className="scan-surface rounded-[34px] border border-[#8effc326] bg-[#0b1712cc] p-5 backdrop-blur-xl transition-transform hover:-translate-y-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#6fae8e]">{entry.category}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#f5fff7]">{entry.name || 'Untitled dossier'}</h2>
          <p className="mt-2 break-all text-xs text-[#789685]">{entry.website || 'No website supplied'}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${riskColor}24`, color: riskColor, border: `1px solid ${riskColor}55` }}>
          {entry.risk_band}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <MiniMetric label="Level" value={friendly(entry.verification_level)} />
        <MiniMetric label="Evidence" value={`${entry.evidence_confidence}%`} />
        <MiniMetric label="Sources" value={String(entry.verified_source_count)} />
        <MiniMetric label="Proof events" value={String(entry.proof_event_count ?? 0)} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#8effc31f] pt-4 text-xs text-[#9bb4a6]">
        <span>Last verified: {entry.last_verified_at || 'Pending'}</span>
        <span className={stale ? 'text-[#d4ad63]' : 'text-[#8effc3]'}>{stale ? 'Stale' : 'Active'}</span>
      </div>
    </Link>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#6fae8e]">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-xs capitalize"
      style={active
        ? { background: '#8effc3', color: '#07110d' }
        : { background: 'rgba(255,255,255,0.06)', color: '#9bb4a6', border: '1px solid rgba(142,255,195,0.14)' }}
    >
      {children}
    </button>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#8effc31f] bg-[#ffffff08] p-3">
      <p className="text-[9px] uppercase tracking-[0.18em] text-[#6fae8e]">{label}</p>
      <p className="mt-2 break-words font-mono text-sm text-[#f5fff7]">{value}</p>
    </div>
  );
}

function friendly(value: string | VerificationLevel | RiskBand) {
  if (value === 'ALL') return 'All';
  return String(value).replace(/_/g, ' ').toLowerCase();
}

function isStale(expiresAt?: string) {
  if (!expiresAt) return false;
  const numeric = Number(expiresAt);
  const expires = Number.isFinite(numeric) && numeric > 0 ? numeric * 1000 : Date.parse(expiresAt);
  if (!Number.isFinite(expires)) return false;
  return Date.now() > expires;
}
