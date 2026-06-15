'use client';

import { useState, useEffect } from 'react';
import { HistoricalChart } from '@/components/HistoricalChart';
import type { HistoricalScore, LeaderboardEntry } from '@/types';

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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: '#e2e8f0' }}>Assessment Archive</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Chronological record of all scoring events - append-only, permanently anchored on-chain.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Project selector */}
        <div className="sm:col-span-1">
          <div className="rounded-xl overflow-hidden" style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)' }}>
            <div className="p-3" style={{ borderBottom: '1px solid rgba(0,217,255,0.06)' }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                className="w-full px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(0,217,255,0.05)', border: '1px solid rgba(0,217,255,0.1)', color: '#e2e8f0', outline: 'none' }}
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-xs text-center" style={{ color: '#64748b' }}>No projects</p>
              ) : filtered.map((p) => (
                <button
                  key={p.project_id}
                  onClick={() => setSelectedId(p.project_id)}
                  className="w-full px-4 py-3 text-left transition-all"
                  style={{
                    background: selectedId === p.project_id ? 'rgba(0,217,255,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(0,217,255,0.04)',
                    borderLeft: selectedId === p.project_id ? '2px solid #00d9ff' : '2px solid transparent',
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: selectedId === p.project_id ? '#00d9ff' : '#e2e8f0' }}>
                    {p.project_name}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
                    {p.category} · {p.tier} · {p.overall_score}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="sm:col-span-2">
          <div className="rounded-xl p-5 min-h-64" style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)' }}>
            {!selectedId ? (
              <div className="h-full flex items-center justify-center" style={{ color: '#64748b' }}>
                <p className="text-sm">Choose a submission to inspect its scoring timeline</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12 gap-3" style={{ color: '#64748b' }}>
                <span className="w-5 h-5 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(0,217,255,0.2)', borderTopColor: '#00d9ff' }} />
                Loading history…
              </div>
            ) : (
              <>
                {selectedProject && (
                  <h2 className="font-semibold text-sm mb-4" style={{ color: '#e2e8f0' }}>
                    {selectedProject.project_name} - Scoring Timeline
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
