'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { TierBadge } from '@/components/TierBadge';
import { WalletGate } from '@/components/WalletGate';
import { cn, formatDate, getScoreColor, formatScore } from '@/utils';
import { getLocalProjectsByOwner, clearLocalProjects } from '@/lib/local-projects';
import type { Evaluation, Profile, RankTier } from '@/types';

interface ProjectRow {
  project_id: string;
  name: string;
  category: string;
  status: string;
  created_at: string;
  owner: string;
  evaluation: Evaluation | null;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!address || !mounted) return;
    setLoading(true);

    const local = getLocalProjectsByOwner(address);
    if (local.length > 0) {
      setProjects(local.map((p) => ({ ...p, evaluation: null })));
    }

    Promise.all([
      fetch(`/api/profile/${address}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/projects?owner=${address}`).then((r) => r.json()).catch(() => ({ projects: [] })),
    ])
      .then(([profileData, projectsData]) => {
        if (profileData?.wallet_address) setProfile(profileData);

        const supabaseProjects: ProjectRow[] = (projectsData?.projects ?? []).map(
          (p: { project: ProjectRow; evaluation: Evaluation | null }) => ({
            ...p.project,
            evaluation: p.evaluation,
          })
        );

        if (supabaseProjects.length > 0) {
          setProjects(supabaseProjects);
        } else if (local.length === 0) {
          setProjects([]);
        }
      })
      .finally(() => setLoading(false));
  }, [address, mounted]);

  if (!mounted) return null;
  if (!isConnected) return <WalletGate message="Link your wallet to access the control center." />;

  const totalProjects = profile?.total_projects ?? projects.length;
  const totalEvals = profile?.total_evaluations ?? 0;
  const avgScore = profile?.average_score ?? 0;
  const bestScore = profile?.best_score ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Hub</p>
          <h1 className="text-4xl font-semibold" style={{ color: '#1a1612' }}>Reputation Hub</h1>
        </div>
        <Link
          href="/register"
          className="rounded-full px-5 py-3 text-sm font-semibold transition-all"
          style={{
            background: '#6b8e7a',
            color: '#ffffff',
            boxShadow: '0 18px 38px rgba(107,142,122,0.18)',
          }}
        >
          + Register New
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Registrations', value: totalProjects },
          { label: 'Assessments', value: totalEvals },
          { label: 'Avg Verification', value: formatScore(avgScore) },
          { label: 'Peak Assessment', value: formatScore(bestScore) },
        ].map((s) => (
          <div key={s.label} className="rounded-[28px] p-5 text-center" style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
            <div className="mb-1 text-2xl font-black font-mono" style={{ color: '#6b8e7a' }}>{s.value}</div>
            <div className="text-[11px] uppercase tracking-wider" style={{ color: '#9b938a' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[32px]" style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#1a1612' }}>Your Registered Initiatives</h2>
          <div className="flex items-center gap-3">
            {projects.length > 0 ? (
              <button
                onClick={() => {
                  clearLocalProjects();
                  setProjects([]);
                }}
                className="rounded px-2 py-1 text-xs transition-colors"
                title="Purge locally cached registrations from prior contracts"
                style={{ color: '#9b938a', border: '1px solid rgba(107,142,122,0.12)' }}
              >
                Clear cache
              </button>
            ) : null}
            {address ? (
              <Link href={`/profile/${address}`} className="text-xs transition-colors" style={{ color: '#6b6360' }}>
                Public record -&gt;
              </Link>
            ) : null}
          </div>
        </div>

        {loading && projects.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-12" style={{ color: '#6b6360' }}>
            <span className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(107,142,122,0.2)', borderTopColor: '#6b8e7a' }} />
            Loading registrations...
          </div>
        ) : projects.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="mb-2 text-sm" style={{ color: '#9b938a' }}>No registered initiatives yet.</p>
            {totalProjects > 0 ? (
              <p className="mb-4 text-xs" style={{ color: '#6b6360' }}>
                GenLayer reports {totalProjects} registration(s) on-chain.{' '}
                <Link href="/register" style={{ color: '#6b8e7a' }}>Retrieve by registration hash -&gt;</Link>
              </p>
            ) : null}
            <Link href="/register" className="text-sm" style={{ color: '#6b8e7a' }}>
              Register your first initiative -&gt;
            </Link>
          </div>
        ) : (
          <div>
            {projects.map((row) => (
              <div
                key={row.project_id}
                className="flex items-center justify-between gap-4 px-6 py-4"
                style={{ borderBottom: '1px solid rgba(107,142,122,0.06)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(107,142,122,0.04)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/project/${row.project_id}`} className="text-sm font-medium transition-colors" style={{ color: '#1a1612' }}>
                      {row.name}
                    </Link>
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{
                        background:
                          row.status === 'ranked'
                            ? '#6b8e7a'
                            : row.status === 'evaluating'
                              ? '#b39b6b'
                              : row.status === 'evaluation_locked'
                                ? '#b8633f'
                                : '#9b938a',
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px]" style={{ color: '#9b938a' }}>
                    {row.category} · {formatDate(row.created_at)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-mono" style={{ color: '#9b938a' }}>{row.project_id}</p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                  {row.evaluation ? (
                    <>
                      <span className={cn('text-sm font-bold font-mono', getScoreColor(row.evaluation.overall_score))}>
                        {formatScore(row.evaluation.overall_score)}
                      </span>
                      <TierBadge tier={row.evaluation.tier as RankTier} size="sm" />
                    </>
                  ) : (
                    <span className="text-xs capitalize" style={{ color: '#9b938a' }}>
                      {row.status.replace(/_/g, ' ')}
                    </span>
                  )}
                  <Link
                    href={`/hub/project?id=${row.project_id}`}
                    className="rounded-full px-3 py-1 text-xs transition-all"
                    style={{
                      background: 'rgba(107,142,122,0.08)',
                      border: '1px solid rgba(107,142,122,0.13)',
                      color: '#6b8e7a',
                    }}
                  >
                    Details -&gt;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectLookup />
    </div>
  );
}

function ProjectLookup() {
  const [id, setId] = useState('');

  return (
    <div className="mt-6 rounded-[28px] p-5" style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9b938a' }}>
        Retrieve registration by hash
      </h3>
      <div className="flex gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter 32-character registration hash..."
          className="flex-1 rounded-2xl px-4 py-3 text-sm font-mono"
          style={{
            background: 'rgba(107,142,122,0.05)',
            border: '1px solid rgba(107,142,122,0.1)',
            color: '#1a1612',
            outline: 'none',
          }}
        />
        <Link
          href={id.trim() ? `/project/${id.trim()}` : '#'}
          className="rounded-full px-4 py-3 text-sm font-semibold transition-all"
          style={{
            background: id.trim() ? '#6b8e7a' : 'rgba(107,142,122,0.2)',
            color: '#ffffff',
            pointerEvents: id.trim() ? 'auto' : 'none',
          }}
        >
          Open -&gt;
        </Link>
      </div>
      <p className="mt-2 text-[11px]" style={{ color: '#9b938a' }}>
        If you registered an initiative but it does not appear above, enter its hash here to access it directly.
      </p>
    </div>
  );
}
