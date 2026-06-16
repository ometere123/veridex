'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ProjectComparison } from '@/components/ProjectComparison';
import type { Project, Evaluation, LeaderboardEntry } from '@/types';

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
        placeholder="Search by dossier name or ID..."
        className="w-full rounded-xl px-4 py-3 text-sm"
        style={{
          background: 'rgba(3,12,8,0.72)',
          border: '1px solid rgba(142,255,195,0.18)',
          color: '#e9fff2',
          outline: 'none',
        }}
      />
      {open && results.length > 0 && (
        <div
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl shadow-xl"
          style={{
            background: 'rgba(7,17,13,0.98)',
            border: '1px solid rgba(142,255,195,0.2)',
            boxShadow: '0 22px 70px rgba(0,0,0,0.36)',
          }}
        >
          {results.map((p) => (
            <button
              key={p.project_id}
              onClick={() => { onSelect(p.project_id, p.project_name); setQuery(p.project_name); setOpen(false); }}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors"
              style={{ borderBottom: '1px solid rgba(142,255,195,0.08)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(142,255,195,0.08)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div>
                <p className="font-medium" style={{ color: '#e9fff2' }}>{p.project_name}</p>
                <p className="mt-0.5 font-mono text-[10px]" style={{ color: '#7d9d8d' }}>{p.project_id}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-xs" style={{ color: '#8effc3' }}>{p.overall_score}</span>
                <span className="font-mono text-xs font-bold" style={{ color: '#b6d8c5' }}>{p.tier}</span>
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#8effc3' }}>Dossier Lens</p>
        <h1 className="text-4xl font-semibold" style={{ color: '#f3fff7' }}>Compare verification dossiers.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: '#b6d8c5' }}>
          Place two public proof files side by side and inspect evidence confidence, verification dimensions, source coverage, and risk signals.
        </p>
      </div>

      {/* Challenger selection */}
      <div className="mb-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_52px_1fr]">
        {/* Card A */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(10,27,19,0.76)', border: '1px solid rgba(142,255,195,0.16)' }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: '#8effc3' }}
          >
            Dossier A
          </p>
          <SearchInput value={idA} onSelect={(id) => setIdA(id)} allProjects={allProjects} />
        </div>

        {/* VS marker */}
        <div className="flex items-center justify-center">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-black"
            style={{ background: 'rgba(142,255,195,0.12)', color: '#8effc3', border: '1px solid rgba(142,255,195,0.24)' }}
          >
            +
          </span>
        </div>

        {/* Card B */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(10,27,19,0.76)', border: '1px solid rgba(142,255,195,0.16)' }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: '#9ec7ff' }}
          >
            Dossier B
          </p>
          <SearchInput value={idB} onSelect={(id) => setIdB(id)} allProjects={allProjects} />
        </div>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: '#ff9a84' }}>{error}</p>}

      <button
        onClick={handleCompare}
        disabled={loading || !idA || !idB}
        className="mb-8 w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #8effc3, #4ddf98)',
          color: '#04100b',
          boxShadow: loading ? 'none' : '0 18px 42px rgba(142,255,195,0.18)',
        }}
      >
        {loading ? 'Reading dossiers...' : 'Compare dossiers'}
      </button>

      {dataA && dataB && (
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(10,27,19,0.72)', border: '1px solid rgba(142,255,195,0.14)' }}
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
