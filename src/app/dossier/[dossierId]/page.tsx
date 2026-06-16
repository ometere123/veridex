'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Dossier, EvidenceManifest, FactCheckReport, HistoricalScore, ProofEvent, VerificationReport } from '@/types';

interface DossierPayload {
  dossier: Dossier | null;
  evidence_manifest: EvidenceManifest | null;
  fact_check: FactCheckReport | null;
  verification_report: VerificationReport | null;
  verification_history?: HistoricalScore[];
  proof_ledger: ProofEvent[];
}

const RISK_COLOR: Record<string, string> = {
  LOW: '#8effc3',
  MODERATE: '#b8d878',
  ELEVATED: '#d4ad63',
  HIGH: '#b8633f',
  CRITICAL: '#8f3d3d',
  UNKNOWN: '#789685',
};

export default function DossierPage() {
  const params = useParams<{ dossierId: string }>();
  const dossierId = params.dossierId;
  const [payload, setPayload] = useState<DossierPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dossierId) return;
    fetch(`/api/dossier/${dossierId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPayload(data))
      .catch(() => setPayload(null))
      .finally(() => setLoading(false));
  }, [dossierId]);

  if (loading) {
    return <Shell><div className="rounded-[36px] border border-[#8effc326] bg-[#0b1712cc] p-12 text-sm text-[#9bb4a6]">Opening investigation file...</div></Shell>;
  }

  if (!payload?.dossier) {
    return (
      <Shell>
        <div className="rounded-[36px] border border-[#8effc326] bg-[#0b1712cc] p-10">
          <h1 className="text-3xl font-semibold text-[#f5fff7]">Dossier not found</h1>
          <p className="mt-3 text-sm text-[#9bb4a6]">The current GenLayer contract did not return a dossier for this ID.</p>
          <Link href="/registry" className="mt-6 inline-flex rounded-full bg-[#8effc3] px-5 py-3 text-sm font-semibold text-[#07110d]">Browse registry</Link>
        </div>
      </Shell>
    );
  }

  const { dossier, evidence_manifest: manifest, fact_check: factCheck, verification_report: report, verification_history: history = [], proof_ledger: ledger } = payload;
  const riskColor = RISK_COLOR[dossier.risk_band] ?? RISK_COLOR.UNKNOWN;

  return (
    <Shell>
      <section className="scan-surface rounded-[42px] border border-[#8effc333] bg-[#0b1712cc] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#8effc3]">Public verification dossier</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-[#f5fff7]">{dossier.name || 'Untitled dossier'}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#9bb4a6]">{dossier.description || 'No description supplied.'}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <HashChip label="Evidence hash" value={dossier.evidence_hash || 'Pending lock'} />
              <HashChip label="Verification hash" value={dossier.current_verification_hash || 'Pending verification'} />
            </div>
          </div>
          <div className="rounded-[32px] border border-[#8effc326] bg-[#06100ccc] p-5">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[#6fae8e]">Verification Seal</p>
            <ConfidenceRing value={dossier.evidence_confidence} />
            <div className="mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold" style={{ background: `${riskColor}22`, color: riskColor, border: `1px solid ${riskColor}55` }}>
              Risk Band: {dossier.risk_band}
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Verification Level" value={friendly(dossier.current_verification_level)} />
          <Metric label="Evidence Confidence" value={`${dossier.evidence_confidence}%`} />
          <Metric label="Last Verified" value={dossier.last_verified_at || 'Pending'} />
          <Metric label="Verified Sources" value={String(dossier.verified_source_count)} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel title="Fact Check Summary" eyebrow="Source-grounded layer">
          <p className="text-sm leading-7 text-[#9bb4a6]">{factCheck?.summary || 'No fact-check report has been stored yet.'}</p>
          <PillList title="Verified claims" items={factCheck?.verified_claims ?? []} />
          <PillList title="Missing evidence" items={factCheck?.missing_evidence ?? []} tone="warn" />
        </Panel>
        <Panel title="Evidence Manifest" eyebrow="Case file sources">
          <EvidenceRow label="Website" value={manifest?.website} />
          <EvidenceRow label="Whitepaper" value={manifest?.whitepaper_url} />
          <EvidenceRow label="Docs" value={manifest?.docs_url} />
          <EvidenceRow label="GitHub Repos" value={(manifest?.github_repos ?? []).join(', ')} />
          <EvidenceRow label="Audits" value={(manifest?.audits ?? []).map((audit) => audit.report_url || audit.firm).filter(Boolean).join(', ')} />
          <EvidenceRow label="Evidence files" value={(manifest?.evidence_files ?? []).map((file) => file.url).join(', ')} />
        </Panel>
      </div>

      <Panel title="Verification Dimensions" eyebrow="GenLayer verification report" className="mt-6">
        <p className="mb-5 text-sm leading-7 text-[#9bb4a6]">{report?.summary || 'Run verification after locking evidence to generate the report.'}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(report?.verification_dimensions ?? {}).map(([key, value]) => (
            <Metric key={key} label={key.replace(/_/g, ' ')} value={`${value}%`} />
          ))}
        </div>
        <PillList title="Risk flags" items={report?.risks ?? report?.critical_warnings ?? []} tone="warn" />
        <PillList title="Recommended evidence" items={report?.recommended_evidence ?? []} />
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Panel title="Proof Ledger Timeline" eyebrow="Public audit trail">
          <ProofTimeline events={ledger} />
        </Panel>
        <Panel title="GenLayer Record" eyebrow="Source of truth">
          <EvidenceRow label="Dossier ID" value={dossier.dossier_id} />
          <EvidenceRow label="Issuer" value={dossier.issuer} />
          <EvidenceRow label="Status" value={dossier.status} />
          <EvidenceRow label="Evidence locked" value={dossier.locked_at || 'Pending'} />
          <EvidenceRow label="Expires" value={dossier.expires_at || 'Not set'} />
          <EvidenceRow label="Verification history" value={`${history.length} cycle${history.length === 1 ? '' : 's'}`} />
        </Panel>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-7xl px-4 py-12">{children}</main>;
}

function ConfidenceRing({ value }: { value: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="mt-5 flex justify-center">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={radius} fill="none" stroke="rgba(142,255,195,0.12)" strokeWidth="10" />
        <circle cx="75" cy="75" r={radius} fill="none" stroke="#8effc3" strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 75 75)" />
        <text x="75" y="72" textAnchor="middle" fontSize="28" fontWeight="800" fill="#f5fff7" fontFamily="monospace">{value}</text>
        <text x="75" y="92" textAnchor="middle" fontSize="10" fill="#9bb4a6" letterSpacing="2">CONFIDENCE</text>
      </svg>
    </div>
  );
}

function Panel({ eyebrow, title, children, className = '' }: { eyebrow: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[34px] border border-[#8effc326] bg-[#0b1712cc] p-6 backdrop-blur-xl ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-[#f5fff7]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#8effc31f] bg-[#ffffff08] p-4">
      <p className="text-[9px] uppercase tracking-[0.2em] text-[#6fae8e]">{label}</p>
      <p className="mt-3 break-all font-mono text-lg text-[#f5fff7]">{value}</p>
    </div>
  );
}

function HashChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="max-w-full rounded-full border border-[#8effc326] bg-[#8effc30f] px-4 py-2 text-xs text-[#dfffee]">
      <span className="mr-2 text-[#8effc3]">{label}</span>
      <span className="break-all font-mono">{value}</span>
    </span>
  );
}

function EvidenceRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-[#8effc31f] py-3 text-sm">
      <span className="text-[#6fae8e]">{label}: </span>
      <span className="break-all text-[#dfffee]">{value || 'Not supplied'}</span>
    </div>
  );
}

function PillList({ title, items, tone = 'good' }: { title: string; items: string[]; tone?: 'good' | 'warn' }) {
  if (!items.length) return null;
  const color = tone === 'warn' ? '#d4ad63' : '#8effc3';
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6fae8e]">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full px-3 py-1 text-xs" style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProofTimeline({ events }: { events: ProofEvent[] }) {
  if (!events.length) return <p className="text-sm text-[#9bb4a6]">No proof events are stored yet.</p>;
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.event_id} className="proof-terminal rounded-3xl p-4 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-[#8effc314] px-3 py-1 text-[#8effc3]">{event.event_type}</span>
            <span className="text-[#6fae8e]">{event.timestamp}</span>
          </div>
          <p className="mt-3 text-[#f5fff7]">{event.summary}</p>
          <p className="mt-2 break-all text-[#9bb4a6]">event: {event.event_hash}</p>
          <p className="mt-1 break-all text-[#9bb4a6]">related: {event.related_hash || 'none'}</p>
          <p className="mt-1 break-all text-[#9bb4a6]">actor: {event.actor}</p>
        </div>
      ))}
    </div>
  );
}

function friendly(value: string) {
  return value.replace(/_/g, ' ').toLowerCase();
}
