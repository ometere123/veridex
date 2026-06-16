'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ProjectComparison } from '@/components/ProjectComparison';
import { TIER_STARS } from '@/constants';
import type { Project, Evaluation, LeaderboardEntry, RankTier } from '@/types';

async function fetchProjectAndEval(id: string) {
  try {
    const [pRes, eRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/evaluate?project_id=${id}`),
    ]);
    if (!pRes.ok) return null;
    const project: Project = await pRes.json();
    const evaluation: Evaluation | null = eRes.ok ? await eRes.json() : null;
    return { project, evaluation: evaluation?.evaluation_id ? evaluation : null };
  } catch {
    return null;
  }
}

function SearchInput({
  value,
  onSelect,
  allProjects,
}: {
  value: string;
  onSelect: (id: string, name: string) => void;
  allProjects: LeaderboardEntry[];
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = allProjects
    .filter(
      (p) =>
        p.project_name.toLowerCase().includes(query.toLowerCase()) ||
        p.project_id.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 8);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search by name or enter ID..."
        className="w-full rounded-xl px-4 py-3 text-sm"
        style={{
          background: 'rgba(107,142,122,0.05)',
          border: '1px solid rgba(107,142,122,0.14)',
          color: '#1a1612',
          outline: 'none',
        }}
      />
      {open && results.length > 0 && (
        <div
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl shadow-xl"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.14)' }}
        >
          {results.map((p) => (
            <button
              key={p.project_id}
              onClick={() => { onSelect(p.project_id, p.project_name); setQuery(p.project_name); setOpen(false); }}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors"
              style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(107,142,122,0.06)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div>
                <p className="font-medium" style={{ color: '#1a1612' }}>{p.project_name}</p>
                <p className="mt-0.5 font-mono text-[10px]" style={{ color: '#9b938a' }}>{p.project_id}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-xs" style={{ color: '#6b8e7a' }}>{p.overall_score}</span>
                <span className="font-mono text-xs font-bold" style={{ color: '#6b6360' }}>{TIER_STARS[p.tier as RankTier]}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const [allProjects, setAllProjects] = useState<LeaderboardEntry[]>([]);
  const [dataA, setDataA] = useState<{ project: Project; evaluation: Evaluation | null } | null>(null);
  const [dataB, setDataB] = useState<{ project: Project; evaluation: Evaluation | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/rankings')
      .then((r) => r.json())
      .then((d) => setAllProjects(d.entries ?? []));
  }, []);

  const handleCompare = useCallback(async () => {
    if (!idA || !idB) { setError('Select or enter both submissions'); return; }
    setLoading(true);
    setError('');
    const [a, b] = await Promise.all([fetchProjectAndEval(idA), fetchProjectAndEval(idB)]);
    if (!a) { setError('Submission A not located'); setLoading(false); return; }
    if (!b) { setError('Submission B not located'); setLoading(false); return; }
    setDataA(a);
    setDataB(b);
    setLoading(false);
  }, [idA, idB]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#9b938a' }}>Compare</p>
        <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>Compare verification dossiers</h1>
        <p className="mt-2 text-sm" style={{ color: '#6b6360' }}>
          Select two dossiers to compare evidence confidence, verification dimensions, source coverage, and risk signals.
        </p>
      </div>

      {/* Challenger selection */}
      <div className="mb-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_52px_1fr]">
        {/* Card A */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.14)' }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: '#6b8e7a' }}
          >
            Dossier A
          </p>
          <SearchInput value={idA} onSelect={(id) => setIdA(id)} allProjects={allProjects} />
        </div>

        {/* VS marker */}
        <div className="flex items-center justify-center">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-black"
            style={{ background: '#1a1612', color: '#ffffff' }}
          >
            +
          </span>
        </div>

        {/* Card B */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.14)' }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: '#b8633f' }}
          >
            Dossier B
          </p>
          <SearchInput value={idB} onSelect={(id) => setIdB(id)} allProjects={allProjects} />
        </div>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: '#a85c4a' }}>{error}</p>}

      <button
        onClick={handleCompare}
        disabled={loading || !idA || !idB}
        className="mb-8 w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          background: '#6b8e7a',
          color: '#ffffff',
          boxShadow: loading ? 'none' : '0 12px 30px rgba(107,142,122,0.18)',
        }}
      >
        {loading ? 'Reading dossiers...' : 'Compare Dossiers ->'}
      </button>

      {dataA && dataB && (
        <div
          className="rounded-2xl p-6"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
        >
          <ProjectComparison
            projectA={dataA.project}
            projectB={dataB.project}
            evalA={dataA.evaluation}
            evalB={dataB.evaluation}
          />
        </div>
      )}
    </div>
  );
}
