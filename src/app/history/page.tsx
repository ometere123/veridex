'use client';

import { useState, useEffect } from 'react';
import { HistoricalChart } from '@/components/HistoricalChart';
import { TIER_STARS } from '@/constants';
import type { HistoricalScore, LeaderboardEntry, RankTier } from '@/types';

export default function HistoryPage() {
  const [allProjects, setAllProjects] = useState<LeaderboardEntry[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [history, setHistory] = useState<HistoricalScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/rankings').then((r) => r.json()).then((d) => setAllProjects(d.entries ?? []));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetch(`/api/history/${selectedId}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const filtered = allProjects.filter(
    (p) =>
      !query ||
      p.project_name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  const selectedProject = allProjects.find((p) => p.project_id === selectedId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#9b938a' }}>Assessment Archive</p>
        <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>Scoring Timeline</h1>
        <p className="mt-2 text-sm" style={{ color: '#6b6360' }}>
          Chronological record of all assessment events — append-only and permanently anchored on-chain.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="sm:col-span-1">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
            <div className="p-3" style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search initiatives…"
                className="w-full px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(107,142,122,0.05)', border: '1px solid rgba(107,142,122,0.12)', color: '#1a1612', outline: 'none' }}
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-xs text-center" style={{ color: '#9b938a' }}>No initiatives found</p>
              ) : filtered.map((p) => (
                <button
                  key={p.project_id}
                  onClick={() => setSelectedId(p.project_id)}
                  className="w-full px-4 py-3 text-left transition-all"
                  style={{
                    background: selectedId === p.project_id ? 'rgba(107,142,122,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(107,142,122,0.06)',
                    borderLeft: selectedId === p.project_id ? '2px solid #6b8e7a' : '2px solid transparent',
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: selectedId === p.project_id ? '#6b8e7a' : '#1a1612' }}>
                    {p.project_name}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#9b938a' }}>
                    {p.category} · {TIER_STARS[p.tier as RankTier]} · {p.overall_score}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <div className="rounded-2xl p-5 min-h-64"
            style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
            {!selectedId ? (
              <div className="h-full flex items-center justify-center" style={{ color: '#9b938a' }}>
                <p className="text-sm">Select an initiative to view its assessment timeline</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12 gap-3" style={{ color: '#9b938a' }}>
                <span className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(107,142,122,0.2)', borderTopColor: '#6b8e7a' }} />
                Loading history…
              </div>
            ) : (
              <>
                {selectedProject && (
                  <h2 className="font-semibold text-sm mb-4" style={{ color: '#1a1612' }}>
                    {selectedProject.project_name} — Assessment Timeline
                  </h2>
                )}
                <HistoricalChart history={history} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
