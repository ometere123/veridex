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

function ProjectSearchInput({
  label,
  value,
  onSelect,
  allProjects,
}: {
  label: string;
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
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6360' }}>
        {label}
      </label>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search by name or enter ID..."
        className="w-full rounded-2xl px-4 py-3 text-sm"
        style={{
          background: 'rgba(107,142,122,0.05)',
          border: '1px solid rgba(107,142,122,0.12)',
          color: '#1a1612',
          outline: 'none',
        }}
      />
      {open && results.length > 0 ? (
        <div
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-3xl shadow-2xl"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.14)' }}
        >
          {results.map((p) => (
            <button
              key={p.project_id}
              onClick={() => {
                onSelect(p.project_id, p.project_name);
                setQuery(p.project_name);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors"
              style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(107,142,122,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <p className="font-medium" style={{ color: '#1a1612' }}>{p.project_name}</p>
                <p className="mt-0.5 text-[10px] font-mono" style={{ color: '#9b938a' }}>{p.project_id}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span className="text-xs font-mono" style={{ color: '#6b8e7a' }}>{p.overall_score}</span>
                <span className="text-xs font-bold font-mono" style={{ color: '#6b6360' }}>{p.tier}</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
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
    if (!idA || !idB) {
      setError('Select or enter both submissions');
      return;
    }

    setLoading(true);
    setError('');
    const [a, b] = await Promise.all([fetchProjectAndEval(idA), fetchProjectAndEval(idB)]);
    if (!a) {
      setError('Submission A not located');
      setLoading(false);
      return;
    }
    if (!b) {
      setError('Submission B not located');
      setLoading(false);
      return;
    }
    setDataA(a);
    setDataB(b);
    setLoading(false);
  }, [idA, idB]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-3 text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Compare</p>
        <h1 className="mb-3 text-4xl font-semibold" style={{ color: '#1a1612' }}>Head-to-Head Analysis</h1>
        <p className="text-base leading-8" style={{ color: '#6b6360' }}>
          Parallel assessment comparison across all dimensions.
        </p>
      </div>

      <div
        className="mb-6 rounded-[32px] p-6"
        style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
      >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProjectSearchInput label="Submission A" value={idA} onSelect={(id) => setIdA(id)} allProjects={allProjects} />
          <ProjectSearchInput label="Submission B" value={idB} onSelect={(id) => setIdB(id)} allProjects={allProjects} />
        </div>

        {error ? <p className="mb-3 text-sm" style={{ color: '#a85c4a' }}>{error}</p> : null}

        <button
          onClick={handleCompare}
          disabled={loading || !idA || !idB}
          className="rounded-full px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: '#6b8e7a',
            color: '#ffffff',
            boxShadow: loading ? 'none' : '0 18px 38px rgba(107,142,122,0.18)',
          }}
        >
          {loading ? 'Processing...' : 'Analyze ->'}
        </button>
      </div>

      {dataA && dataB ? (
        <div
          className="rounded-[32px] p-6"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
        >
          <ProjectComparison
            projectA={dataA.project}
            projectB={dataB.project}
            evalA={dataA.evaluation}
            evalB={dataB.evaluation}
          />
        </div>
      ) : null}
    </div>
  );
}
