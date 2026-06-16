import type { Metadata } from 'next';
import { getProfile } from '@/lib/genlayer';
import { getServiceClient } from '@/lib/supabase';
import { formatAddress, formatDate, formatScore, getScoreColor, getScoreHex, cn } from '@/utils';
import { TierBadge } from '@/components/TierBadge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { RankTier } from '@/types';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ wallet: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { wallet } = await params;
  return {
    title: `${formatAddress(wallet)} - Veridex Profile`,
    description: `On-chain verification history for wallet ${formatAddress(wallet)} on Veridex.`,
  };
}

async function getWalletProjects(wallet: string) {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('projects')
      .select('project_id, name, category, status, created_at')
      .eq('owner', wallet)
      .order('created_at', { ascending: false });
    const withEvals = await Promise.all(
      (data ?? []).map(async (p) => {
        try {
          const e = await (await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/evaluate?project_id=${p.project_id}`
          )).json();
          return { ...p, evaluation: e?.evaluation_id ? e : null };
        } catch { return { ...p, evaluation: null }; }
      })
    );
    return withEvals;
  } catch { return []; }
}

export default async function ProfilePage({ params }: Props) {
  const { wallet } = await params;
  let profile;
  try { profile = await getProfile(wallet); } catch { profile = null; }
  if (!profile) notFound();
  const projects = await getWalletProjects(wallet);

  const METRICS = [
    { label: 'Credibility',    value: profile.credibility_score,  desc: 'Derived from assessment track record' },
    { label: 'Consistency',    value: profile.consistency_score,  desc: 'Variance across verification events' },
    { label: 'Security Index', value: profile.security_rating,    desc: 'Mean security posture score' },
    { label: 'Execution Index',value: profile.execution_rating,   desc: 'Mean delivery execution score' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl p-8 mb-6"
        style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
            style={{ background: 'rgba(107,142,122,0.10)', color: '#6b8e7a' }}>
            {wallet.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold font-mono mb-1" style={{ color: '#1a1612' }}>
              {formatAddress(wallet)}
            </h1>
            <p className="text-sm" style={{ color: '#9b938a' }}>Active since {formatDate(profile.created_at)}</p>
            <code className="text-[11px] font-mono" style={{ color: '#c8c0b8' }}>{wallet}</code>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Initiatives', value: profile.total_projects },
            { label: 'Assessments', value: profile.total_evaluations },
            { label: 'Avg Score',   value: formatScore(profile.average_score) },
            { label: 'Peak Score',  value: formatScore(profile.best_score) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(107,142,122,0.05)', border: '1px solid rgba(107,142,122,0.10)' }}>
              <div className="text-2xl font-black font-mono mb-0.5" style={{ color: '#6b8e7a' }}>{stat.value}</div>
              <div className="text-[11px] uppercase tracking-wider" style={{ color: '#9b938a' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-2xl p-5"
            style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#1a1612' }}>{m.label}</span>
              <span className="font-mono font-bold text-sm" style={{ color: getScoreHex(m.value) }}>{formatScore(m.value)}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(107,142,122,0.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: getScoreHex(m.value) }} />
            </div>
            <p className="text-[11px]" style={{ color: '#9b938a' }}>{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}>
          <h2 className="font-semibold text-sm" style={{ color: '#1a1612' }}>Registered Initiatives</h2>
        </div>
        {projects.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm" style={{ color: '#9b938a' }}>
            No initiatives registered from this wallet.
          </div>
        ) : (
          <div>
            {projects.map((p: { project_id: string; name: string; category: string; status: string; created_at: string; evaluation: { overall_score: number; tier: RankTier } | null }, i: number) => (
              <Link key={p.project_id} href={`/project/${p.project_id}`}
                className="flex items-center justify-between px-6 py-4 transition-all"
                style={{ borderBottom: i < projects.length - 1 ? '1px solid rgba(107,142,122,0.06)' : undefined }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(107,142,122,0.03)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#1a1612' }}>{p.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#9b938a' }}>{p.category} · {formatDate(p.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {p.evaluation ? (
                    <>
                      <span className={cn('font-mono font-bold text-sm', getScoreColor(p.evaluation.overall_score))}>
                        {formatScore(p.evaluation.overall_score)}
                      </span>
                      <TierBadge tier={p.evaluation.tier} size="sm" />
                    </>
                  ) : (
                    <span className="text-xs capitalize" style={{ color: '#9b938a' }}>{p.status.replace(/_/g, ' ')}</span>
                  )}
                  <span style={{ color: '#c8c0b8' }}>›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
