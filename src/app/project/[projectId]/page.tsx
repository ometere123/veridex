import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEvaluation, getFactCheck, getHistoricalScores, getProject } from '@/lib/genlayer';
import { VERIDEX_CONTRACT_ADDRESS } from '@/lib/veridex-contract';
import { EvidenceLockPanel } from '@/components/EvidenceLockPanel';
import { EvaluationPanel } from '@/components/EvaluationPanel';
import { FactCheckPanel } from '@/components/FactCheckPanel';
import { GenLayerProofPanel } from '@/components/GenLayerProofPanel';
import { HistoricalChart } from '@/components/HistoricalChart';
import {
  DeliveryProofCard,
  EvidenceIntegrityCard,
  MarketTractionCard,
  ProtocolArchitectureCard,
  SecurityRiskCard,
  TeamGovernanceCard,
  TokenDesignCard,
} from '@/components/ScoreCard';
import { TierBadge } from '@/components/TierBadge';
import { formatDate, formatScore, getScoreHex } from '@/utils';
import type { GenLayerProof, GenLayerProofStep } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  try {
    const project = await getProject(projectId);
    return {
      title: project ? `${project.name} - Veridex` : 'Project - Veridex',
      description: project?.description ?? 'GenLayer-evaluated crypto project.',
    };
  } catch {
    return { title: 'Project - Veridex' };
  }
}

function buildProof(
  project: NonNullable<Awaited<ReturnType<typeof getProject>>>,
  evaluation: Awaited<ReturnType<typeof getEvaluation>>,
): GenLayerProof {
  const steps: GenLayerProofStep[] = [
    { label: 'Project Submitted', status: 'complete', timestamp: project.created_at, method: 'create_project' },
    { label: 'Evidence Locked', status: project.evidence_hash ? 'complete' : 'pending', timestamp: project.locked_at, method: 'lock_project_data' },
    { label: 'Evaluation Started', status: ['evaluating', 'ranked', 'reevaluation_pending'].includes(project.status) ? 'complete' : 'pending', method: 'submit_evaluation' },
    { label: 'Evaluation Finalized', status: evaluation?.evaluation_id ? 'complete' : 'pending', timestamp: evaluation?.evaluated_at, method: 'run_evaluation' },
    { label: 'Ranking Updated', status: ['ranked', 'reevaluation_pending'].includes(project.status) ? 'complete' : 'pending', method: 'run_evaluation' },
  ];

  return {
    project_id: project.project_id,
    contract_address: VERIDEX_CONTRACT_ADDRESS,
    evidence_hash: project.evidence_hash,
    evaluation_hash: evaluation?.evaluation_hash,
    steps,
  };
}

const PANEL = {
  background: '#ffffff',
  border: '1px solid rgba(107, 142, 122, 0.12)',
  borderRadius: '28px',
  padding: '24px',
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;

  const project = await getProject(projectId).catch(() => null);
  if (!project) notFound();

  const [evaluation, factCheck, history] = await Promise.all([
    getEvaluation(projectId).catch(() => null),
    getFactCheck(projectId).catch(() => null),
    getHistoricalScores(projectId).catch(() => []),
  ]);

  const proof = buildProof(project, evaluation);
  const scoreHex = getScoreHex(evaluation?.overall_score ?? 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[36px] p-8" style={{ background: '#ffffff', border: '1px solid rgba(107, 142, 122, 0.12)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]" style={{ background: 'rgba(107, 142, 122, 0.08)', color: '#6b8e7a' }}>
              {project.category}
            </span>
            <span className="text-sm" style={{ color: '#6b6360' }}>
              Submitted {formatDate(project.created_at)}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <h1 className="text-4xl font-semibold" style={{ color: '#1a1612' }}>{project.name}</h1>
            {evaluation && <TierBadge tier={evaluation.tier} size="lg" />}
            {evaluation && (
              <span className="text-3xl font-black font-mono" style={{ color: scoreHex }}>
                {formatScore(evaluation.overall_score)}
              </span>
            )}
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-7" style={{ color: '#6b6360' }}>
            {project.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.website && (
              <a href={project.website} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(107, 142, 122, 0.08)', color: '#6b8e7a' }}>
                Website
              </a>
            )}
            {project.whitepaper_url && (
              <a href={project.whitepaper_url} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(184, 99, 63, 0.08)', color: '#b8633f' }}>
                Whitepaper
              </a>
            )}
            {project.docs_url && (
              <a href={project.docs_url} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(107, 142, 122, 0.08)', color: '#6b8e7a' }}>
                Docs
              </a>
            )}
            {project.verification_document_url && (
              <a href={project.verification_document_url} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(184, 99, 63, 0.08)', color: '#b8633f' }}>
                Verification Evidence
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <div style={PANEL}>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: '#9b938a' }}>Verification Snapshot</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[
                { label: 'Status', value: project.verification_status || project.status },
                { label: 'Verification Score', value: formatScore(project.verification_score) },
                { label: 'Verified Sources', value: String(project.verified_source_count) },
                { label: 'Evidence Hash', value: project.evidence_hash ? `${project.evidence_hash.slice(0, 12)}...` : 'Pending' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl p-4" style={{ background: 'rgba(107, 142, 122, 0.06)' }}>
                  <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#9b938a' }}>{item.label}</p>
                  <p className="mt-2 text-sm font-semibold break-all" style={{ color: '#1a1612' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={PANEL}>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: '#9b938a' }}>Supporting Links</p>
            <div className="mt-4 space-y-3 text-sm">
              {project.github_repos.length === 0 && !project.bug_bounty_url ? (
                <p style={{ color: '#6b6360' }}>No public links were provided yet.</p>
              ) : null}
              {project.github_repos.map((repo) => (
                <a key={repo} href={repo} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: '#6b8e7a' }}>
                  {repo}
                </a>
              ))}
              {project.bug_bounty_url && (
                <a href={project.bug_bounty_url} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: '#6b8e7a' }}>
                  {project.bug_bounty_url}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {evaluation && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProtocolArchitectureCard score={evaluation.protocol_architecture_score} />
          <TeamGovernanceCard score={evaluation.team_governance_score} />
          <MarketTractionCard score={evaluation.market_traction_score} />
          <SecurityRiskCard score={evaluation.security_risk_score} />
          <DeliveryProofCard score={evaluation.delivery_proof_score} />
          <TokenDesignCard score={evaluation.token_design_score} />
          <EvidenceIntegrityCard score={evaluation.evidence_integrity_score} />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <FactCheckPanel factCheck={factCheck} />
          <EvaluationPanel project={project} evaluation={evaluation} />
          {history.length > 0 && (
            <div style={PANEL}>
              <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: '#9b938a' }}>Evidence History</p>
              <div className="mt-4">
                <HistoricalChart history={history} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <EvidenceLockPanel project={project} />
          <GenLayerProofPanel proof={proof} />

          <div style={PANEL}>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: '#9b938a' }}>Project Data</p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="font-semibold" style={{ color: '#1a1612' }}>Roadmap</p>
                <p className="mt-1 whitespace-pre-line" style={{ color: '#6b6360' }}>{project.roadmap || 'No roadmap provided.'}</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1a1612' }}>Tokenomics</p>
                <p className="mt-1" style={{ color: '#6b6360' }}>
                  {project.tokenomics.symbol || 'N/A'} · {project.tokenomics.total_supply || 'N/A'}
                </p>
                <p className="mt-1" style={{ color: '#6b6360' }}>{project.tokenomics.utility || 'No utility provided.'}</p>
                <p className="mt-1" style={{ color: '#6b6360' }}>{project.tokenomics.emission_schedule || 'No emission schedule provided.'}</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1a1612' }}>Team</p>
                {project.team.length === 0 ? (
                  <p className="mt-1" style={{ color: '#6b6360' }}>No team members provided.</p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {project.team.map((member, index) => (
                      <div key={`${member.name}-${index}`} className="rounded-2xl p-3" style={{ background: 'rgba(107, 142, 122, 0.06)' }}>
                        <p className="font-semibold" style={{ color: '#1a1612' }}>{member.name}</p>
                        <p style={{ color: '#6b6360' }}>{member.role}</p>
                        <div className="mt-2 flex gap-3">
                          {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#6b8e7a' }}>LinkedIn</a>}
                          {member.x && <a href={member.x} target="_blank" rel="noopener noreferrer" style={{ color: '#6b8e7a' }}>X</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#1a1612' }}>Audits</p>
                {project.audits.length === 0 ? (
                  <p className="mt-1" style={{ color: '#6b6360' }}>No audits provided.</p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {project.audits.map((audit, index) => (
                      <a key={`${audit.firm}-${index}`} href={audit.report_url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl p-3 hover:underline" style={{ background: 'rgba(184, 99, 63, 0.08)', color: '#b8633f' }}>
                        {audit.firm} · {formatDate(audit.audit_date)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
