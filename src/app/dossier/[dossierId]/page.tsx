'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type {
  Dossier,
  EvidenceManifest,
  FactCheckReport,
  ProofEvent,
  VerificationReport,
} from '@/types';

interface DossierPayload {
  dossier: Dossier | null;
  evidence_manifest: EvidenceManifest | null;
  fact_check: FactCheckReport | null;
  verification_report: VerificationReport | null;
  proof_ledger: ProofEvent[];
}

const RISK_COLOR: Record<string, string> = {
  LOW: '#4f8f68',
  MODERATE: '#8b8a55',
  ELEVATED: '#b38a45',
  HIGH: '#b8633f',
  CRITICAL: '#8f3d3d',
  UNKNOWN: '#8a8178',
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
    return <div className="mx-auto max-w-5xl px-4 py-20 text-sm" style={{ color: '#5f5a52' }}>Reading dossier from GenLayer...</div>;
  }

  if (!payload?.dossier) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>Dossier not found</h1>
        <p className="mt-3 text-sm" style={{ color: '#5f5a52' }}>The dossier ID was not returned by the current GenLayer contract.</p>
        <Link href="/registry" className="mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold" style={{ background: '#5f8d6b', color: '#fff' }}>
          Browse registry
        </Link>
      </div>
    );
  }

  const { dossier, evidence_manifest: manifest, fact_check: factCheck, verification_report: report, proof_ledger: ledger } = payload;
  const riskColor = RISK_COLOR[dossier.risk_band] ?? RISK_COLOR.UNKNOWN;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 rounded-[32px] bg-white p-8" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.26em]" style={{ color: '#8a8178' }}>Verification Dossier</p>
            <h1 className="text-4xl font-semibold" style={{ color: '#1a1612' }}>{dossier.name || 'Untitled dossier'}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: '#5f5a52' }}>{dossier.description || 'No description supplied.'}</p>
          </div>
          <Link href="/registry" className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: 'rgba(107,142,122,0.10)', color: '#4f8f68' }}>
            Registry
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Verification Level" value={friendlyLevel(dossier.current_verification_level)} />
          <Metric label="Evidence Confidence" value={`${dossier.evidence_confidence}%`} />
          <Metric label="Risk Band" value={dossier.risk_band} color={riskColor} />
          <Metric label="Verified Sources" value={String(dossier.verified_source_count)} />
        </div>

        <div className="mt-6 grid gap-3 text-xs sm:grid-cols-2" style={{ color: '#8a8178' }}>
          <div>Dossier ID: <span className="font-mono" style={{ color: '#1a1612' }}>{dossier.dossier_id}</span></div>
          <div>Issuer: <span className="font-mono" style={{ color: '#1a1612' }}>{dossier.issuer}</span></div>
          <div>Evidence hash: <span className="font-mono" style={{ color: '#1a1612' }}>{dossier.evidence_hash || 'Pending lock'}</span></div>
          <div>Verification hash: <span className="font-mono" style={{ color: '#1a1612' }}>{dossier.current_verification_hash || 'Pending verification'}</span></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Section title="Source-Grounded Fact Check">
          <p className="text-sm leading-7" style={{ color: '#5f5a52' }}>{factCheck?.summary || 'No fact-check report has been stored yet.'}</p>
          <List title="Missing Evidence" items={factCheck?.missing_evidence ?? []} />
          <List title="Verified Claims" items={factCheck?.verified_claims ?? []} />
        </Section>

        <Section title="Evidence Manifest">
          <EvidenceRow label="Website" value={manifest?.website} />
          <EvidenceRow label="Whitepaper" value={manifest?.whitepaper_url} />
          <EvidenceRow label="Docs" value={manifest?.docs_url} />
          <EvidenceRow label="GitHub Repos" value={(manifest?.github_repos ?? []).join(', ')} />
          <EvidenceRow label="Audits" value={(manifest?.audits ?? []).map((audit) => audit.report_url || audit.firm).filter(Boolean).join(', ')} />
          <EvidenceRow label="Verification Doc" value={manifest?.verification_document_url} />
        </Section>
      </div>

      <Section title="GenLayer Verification Report" className="mt-6">
        <p className="text-sm leading-7" style={{ color: '#5f5a52' }}>{report?.summary || 'Run verification after locking evidence to generate the report.'}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(report?.verification_dimensions ?? {}).map(([key, value]) => (
            <Metric key={key} label={key.replace(/_/g, ' ')} value={`${value}%`} />
          ))}
        </div>
        <List title="Risk Signals" items={report?.risks ?? report?.critical_warnings ?? []} />
        <List title="Recommended Evidence" items={report?.recommended_evidence ?? []} />
      </Section>

      <Section title="Proof Ledger" className="mt-6">
        {ledger.length === 0 ? (
          <p className="text-sm" style={{ color: '#5f5a52' }}>No proof events are stored yet.</p>
        ) : (
          <div className="space-y-3">
            {ledger.map((event) => (
              <div key={event.event_id} className="rounded-2xl p-4" style={{ background: 'rgba(107,142,122,0.06)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: '#4f8f68' }}>{event.event_type}</span>
                  <span className="font-mono text-[11px]" style={{ color: '#8a8178' }}>{event.timestamp}</span>
                </div>
                <p className="mt-2 text-sm" style={{ color: '#1a1612' }}>{event.summary}</p>
                <p className="mt-2 break-all font-mono text-[11px]" style={{ color: '#8a8178' }}>{event.event_hash}</p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Metric({ label, value, color = '#4f8f68' }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-3xl p-5" style={{ background: 'rgba(107,142,122,0.06)', border: '1px solid rgba(107,142,122,0.12)' }}>
      <div className="mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: '#8a8178' }}>{label}</div>
      <div className="text-xl font-semibold capitalize" style={{ color }}>{value}</div>
    </div>
  );
}

function Section({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[32px] bg-white p-6 ${className}`} style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
      <h2 className="mb-4 text-lg font-semibold" style={{ color: '#1a1612' }}>{title}</h2>
      {children}
    </section>
  );
}

function EvidenceRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-[rgba(107,142,122,0.08)] py-3 text-sm">
      <span style={{ color: '#8a8178' }}>{label}: </span>
      <span className="break-all" style={{ color: '#1a1612' }}>{value || 'Not supplied'}</span>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#8a8178' }}>{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(184,99,63,0.08)', color: '#8f5b45' }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function friendlyLevel(level: string) {
  return level.replace(/_/g, ' ').toLowerCase();
}
