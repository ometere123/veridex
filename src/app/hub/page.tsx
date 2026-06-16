'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { TierBadge } from '@/components/TierBadge';
import { WalletGate } from '@/components/WalletGate';
import { formatDate, formatScore, getScoreColor } from '@/utils';
import { getLocalProjectsByOwner, clearLocalProjects } from '@/lib/local-projects';
import { TIER_HEX } from '@/constants';
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

const STATUS_COLORS: Record<string, string> = {
  ranked: '#6b8e7a',
  evaluating: '#b39b6b',
  evaluation_locked: '#b8633f',
  reevaluation_pending: '#a89b7a',
  submitted: '#8b7355',
  draft: '#9b938a',
  archived: '#c8c0b8',
};

export default function HubPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupId, setLookupId] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!address || !mounted) return;
    setLoading(true);
    const local = getLocalProjectsByOwner(address);
    if (local.length > 0) setProjects(local.map((p) => ({ ...p, evaluation: null })));

    Promise.all([
      fetch(`/api/profile/${address}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/projects?owner=${address}`).then((r) => r.json()).catch(() => ({ projects: [] })),
    ])
      .then(([profileData, projectsData]) => {
        if (profileData?.wallet_address) setProfile(profileData);
        const supabase: ProjectRow[] = (projectsData?.projects ?? []).map(
          (p: { project: ProjectRow; evaluation: Evaluation | null }) => ({ ...p.project, evaluation: p.evaluation })
        );
        if (supabase.length > 0) setProjects(supabase);
        else if (local.length === 0) setProjects([]);
      })
      .finally(() => setLoading(false));
  }, [address, mounted]);

  if (!mounted) return null;
  if (!isConnected) return <WalletGate message="Link your wallet to access your reputation hub." />;

  const totalProjects = profile?.total_projects ?? projects.length;
  const totalEvals = profile?.total_evaluations ?? 0;
  const avgScore = profile?.average_score ?? 0;
  const bestScore = profile?.best_score ?? 0;
  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#9b938a' }}>Hub</p>
          <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>Reputation Hub</h1>
          <p className="mt-1 font-mono text-xs" style={{ color: '#9b938a' }}>{shortAddr}</p>
        </div>
        <div className="flex items-center gap-3">
          {address && (
            <Link href={`/profile/${address}`} className="text-xs transition-colors" style={{ color: '#6b6360' }}>
              Public profile &rarr;
            </Link>
          )}
          <Link
            href="/register"
            className="rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{ background: '#6b8e7a', color: '#ffffff', boxShadow: '0 12px 24px rgba(107,142,122,0.20)' }}
          >
            + Register New
          </Link>
        </div>
      </div>

      {/* Stats horizontal band */}
      <div
        className="mb-6 overflow-hidden rounded-2xl"
        style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {[
            { label: 'Registrations', value: totalProjects },
            { label: 'Assessments', value: totalEvals },
            { label: 'Avg Assessment', value: formatScore(avgScore) },
            { label: 'Peak Assessment', value: formatScore(bestScore) },
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-5 py-5 text-center"
              style={{
                borderRight: i < 3 ? '1px solid rgba(107,142,122,0.10)' : undefined,
                borderBottom: i < 2 ? '1px solid rgba(107,142,122,0.10)' : undefined,
              }}
            >
              <div className="mb-1 font-mono text-2xl font-black" style={{ color: '#6b8e7a' }}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#9b938a' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lookup + clear row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          <input
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Retrieve by registration hash..."
            className="flex-1 rounded-xl px-4 py-2.5 font-mono text-sm"
            style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.14)', color: '#1a1612', outline: 'none' }}
          />
          <Link
            href={lookupId.trim() ? `/project/${lookupId.trim()}` : '#'}
            className="flex shrink-0 items-center rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{
              background: lookupId.trim() ? '#6b8e7a' : 'rgba(107,142,122,0.15)',
              color: lookupId.trim() ? '#ffffff' : '#9b938a',
              pointerEvents: lookupId.trim() ? 'auto' : 'none',
            }}
          >
            Open &rarr;
          </Link>
        </div>
        {projects.length > 0 && (
          <button
            onClick={() => { clearLocalProjects(); setProjects([]); }}
            className="shrink-0 rounded-xl px-4 py-2.5 text-xs"
            style={{ color: '#9b938a', border: '1px solid rgba(107,142,122,0.12)', background: '#ffffff' }}
          >
            Clear cache
          </button>
        )}
      </div>

      {/* Project cards */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9b938a' }}>
          Your Registered Initiatives
        </h2>

        {loading && projects.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-16" style={{ color: '#6b6360' }}>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2"
              style={{ borderColor: 'rgba(107,142,122,0.2)', borderTopColor: '#6b8e7a' }}
            />
            Retrieving initiatives...
          </div>
        ) : projects.length === 0 ? (
          <div
            className="rounded-2xl py-14 text-center"
            style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
          >
            <p className="mb-3 text-sm" style={{ color: '#9b938a' }}>No registered initiatives yet.</p>
            {(profile?.total_projects ?? 0) > 0 && (
              <p className="mb-4 text-xs" style={{ color: '#6b6360' }}>
                {profile!.total_projects} registration(s) on-chain. Enter a hash above to retrieve.
              </p>
            )}
            <Link href="/register" className="text-sm" style={{ color: '#6b8e7a' }}>
              Register your first initiative &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((row) => (
              <div
                key={row.project_id}
                className="flex flex-col gap-3 rounded-2xl p-5"
                style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
              >
                {/* Name + status dot */}
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/project/${row.project_id}`}
                    className="text-sm font-semibold leading-snug hover:underline"
                    style={{ color: '#1a1612' }}
                  >
                    {row.name}
                  </Link>
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: STATUS_COLORS[row.status] ?? '#9b938a' }}
                    title={row.status.replace(/_/g, ' ')}
                  />
                </div>

                {/* Category + date */}
                <div className="flex items-center gap-2 text-[11px]" style={{ color: '#9b938a' }}>
                  <span className="uppercase tracking-wider">{row.category}</span>
                  <span>&middot;</span>
                  <span>{formatDate(row.created_at)}</span>
                </div>

                {/* Score + tier OR status */}
                {row.evaluation ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TierBadge tier={row.evaluation.tier as RankTier} size="sm" />
                      <span className={`font-mono text-sm font-black ${getScoreColor(row.evaluation.overall_score)}`}>
                        {formatScore(row.evaluation.overall_score)}
                      </span>
                    </div>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: 'rgba(107,142,122,0.10)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${row.evaluation.overall_score}%`,
                          background: TIER_HEX[row.evaluation.tier as RankTier] ?? '#6b8e7a',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs capitalize" style={{ color: '#9b938a' }}>
                    {row.status.replace(/_/g, ' ')}
                  </span>
                )}

                {/* ID + details link */}
                <div
                  className="flex items-center justify-between pt-1"
                  style={{ borderTop: '1px solid rgba(107,142,122,0.08)' }}
                >
                  <span className="mr-2 truncate font-mono text-[10px]" style={{ color: '#c8c0b8' }}>
                    {row.project_id.slice(0, 16)}&hellip;
                  </span>
                  <Link
                    href={`/hub/project?id=${row.project_id}`}
                    className="shrink-0 text-xs font-semibold transition-colors"
                    style={{ color: '#6b8e7a' }}
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
