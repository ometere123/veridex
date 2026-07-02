'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatDate } from '@/utils';
import { CATEGORIES } from '@/constants';

interface DossierListItem {
  dossier_id: string;
  name: string;
  category: string;
  owner: string;
  created_at: string;
  status: string;
  evidence_confidence: number;
  verification_level: string;
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: '#d4ad63',
  EVIDENCE_LOCKED: '#b8d878',
  VERIFYING: '#67d89a',
  VERIFIED: '#8effc3',
  PARTIAL: '#b8d878',
  WEAK: '#e0a35f',
  UNVERIFIABLE: '#e07a5f',
  REFRESH_PENDING: '#d4ad63',
  STALE: '#a08a6a',
  ARCHIVED: '#789685',
  UNKNOWN: '#789685',
};

export default function DossiersPage() {
  const [items, setItems] = useState<DossierListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/projects');
        const data = res.ok ? await res.json() : { projects: [] };
        const cached: Array<{ project: { project_id: string; name: string; category: string; status: string; created_at: string; owner: string } }> =
          data.projects ?? [];

        // Enrich with live on-chain status (bounded to first 30)
        const enriched = await Promise.all(
          cached.slice(0, 30).map(async ({ project }) => {
            const base: DossierListItem = {
              dossier_id: project.project_id,
              name: project.name,
              category: project.category,
              owner: project.owner,
              created_at: project.created_at,
              status: (project.status || 'UNKNOWN').toUpperCase(),
              evidence_confidence: 0,
              verification_level: 'UNVERIFIED',
            };
            try {
              const r = await fetch(`/api/dossier/${project.project_id}`);
              const d = r.ok ? await r.json() : null;
              if (d?.dossier?.dossier_id) {
                base.status = d.dossier.status || base.status;
                base.evidence_confidence = d.dossier.evidence_confidence ?? 0;
                base.verification_level = d.dossier.current_verification_level || 'UNVERIFIED';
              }
            } catch { /* keep cached values */ }
            return base;
          })
        );
        if (active) setItems(enriched);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const statuses = useMemo(
    () => ['ALL', ...Array.from(new Set(items.map((i) => i.status)))],
    [items],
  );

  const filtered = items.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.dossier_id.includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <section className="rounded-[42px] border border-[#8effc333] bg-[#0b1712cc] p-7 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#8effc3]">Case files</p>
        <h1 className="mt-3 text-4xl font-semibold text-[#f5fff7]">All Dossiers</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9bb4a6]">
          Every verification dossier created on Veridex, in any lifecycle stage: drafts, locked evidence,
          in-progress verifications, and completed reports. The <Link href="/registry" className="text-[#8effc3] underline underline-offset-2">Registry</Link> lists
          only dossiers that completed a GenLayer verification cycle, ranked by risk and confidence.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or dossier ID..."
            className="min-w-[220px] flex-1 rounded-2xl border border-[#8effc326] bg-[#06100c] px-4 py-2.5 text-sm text-[#f5fff7] placeholder-[#4f665a] outline-none focus:border-[#8effc355]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-[#8effc326] bg-[#06100c] px-4 py-2.5 text-sm text-[#f5fff7] outline-none"
          >
            {statuses.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s.replace(/_/g, ' ')}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-[#8effc326] bg-[#06100c] px-4 py-2.5 text-sm text-[#f5fff7] outline-none"
          >
            <option value="ALL">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </section>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-[34px] border border-[#8effc326] bg-[#0b1712cc] p-10 text-center text-sm text-[#9bb4a6]">
            Opening case files...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[34px] border border-[#8effc326] bg-[#0b1712cc] p-10 text-center">
            <p className="text-sm text-[#9bb4a6]">
              {items.length === 0 ? 'No dossiers have been created yet.' : 'No dossiers match your filters.'}
            </p>
            <Link href="/submit" className="mt-5 inline-flex rounded-full bg-[#8effc3] px-5 py-3 text-sm font-semibold text-[#07110d]">
              Create the first dossier
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const color = STATUS_COLOR[item.status] ?? STATUS_COLOR.UNKNOWN;
              return (
                <Link
                  key={item.dossier_id}
                  href={`/dossier/${item.dossier_id}`}
                  className="group rounded-[28px] border border-[#8effc31f] bg-[#0b1712cc] p-5 transition-all hover:border-[#8effc355]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold text-[#f5fff7] group-hover:text-[#8effc3]">{item.name || 'Untitled dossier'}</h2>
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: `${color}1a`, color, border: `1px solid ${color}40` }}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#6fae8e]">{item.category || 'Uncategorised'} · {formatDate(item.created_at)}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-[#8effc31a] pt-3 text-xs">
                    <span className="text-[#9bb4a6]">
                      {item.evidence_confidence > 0 ? `${item.evidence_confidence}% confidence` : 'Not yet verified'}
                    </span>
                    <span className="font-mono text-[#789685]">{item.dossier_id.slice(0, 10)}...</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
