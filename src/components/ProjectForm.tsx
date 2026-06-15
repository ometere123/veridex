'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils';
import { CATEGORIES } from '@/constants';
import { contractCreateProject } from '@/lib/genlayer-write';
import { saveProjectLocally } from '@/lib/local-projects';
import type { ProjectCategory } from '@/types';

interface ProjectFormData {
  name: string; category: ProjectCategory; website: string; description: string;
  whitepaper_url: string; docs_url: string; github_repos: string; roadmap: string;
  investors: string; partnerships: string;
  token_utility: string; token_emissions: string; token_supply: string; token_symbol: string;
  audit_auditor: string; audit_url: string; audit_date: string; bug_bounty_url: string;
  team_name: string; team_role: string; team_linkedin: string; team_x: string; ecosystem_integrations: string;
  verification_doc_url: string;
}

const INITIAL: ProjectFormData = {
  name: '', category: 'DeFi', website: '', description: '',
  whitepaper_url: '', docs_url: '', github_repos: '', roadmap: '',
  investors: '', partnerships: '',
  token_utility: '', token_emissions: '', token_supply: '', token_symbol: '',
  audit_auditor: '', audit_url: '', audit_date: '', bug_bounty_url: '',
  team_name: '', team_role: '', team_linkedin: '', team_x: '', ecosystem_integrations: '',
  verification_doc_url: '',
};

const INPUT_STYLE = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  color: 'var(--foreground)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
} as const;

function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        {label} {required && <span style={{ color: '#b8633f' }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: 'var(--muted-2)' }}>{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 placeholder-[#3d2a6b]';

interface ProjectFormProps {
  uploadedFiles?: Array<{ name: string; size: number; type: string; url: string }>;
}

export function ProjectForm({ uploadedFiles = [] }: ProjectFormProps) {
  // ── ALL hooks at top - no conditional returns before this block ──
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [form, setForm]         = useState<ProjectFormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep]         = useState('');
  const [error, setError]       = useState('');
  // mounted guard: only affects RENDER OUTPUT, never skips hooks
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const set = (field: keyof ProjectFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Derived values ────────────────────────────────────────────────
  // These are only used in the submit handler (after mount) - safe
  const canSubmit = mounted && isConnected && !!address;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) { setError('Connect your wallet first'); return; }
    if (!form.name.trim())        { setError('Project name is required'); return; }
    if (!form.website.trim())     { setError('Website is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.roadmap.trim())     { setError('Roadmap is required'); return; }

    setSubmitting(true);
    setError('');
    setStep('');

    try {
      setStep('Sending to GenLayer - approve in your wallet…');

      const project_id = await contractCreateProject(address!, {
        name:        form.name.trim(),
        category:    form.category,
        website:     form.website.trim(),
        description: form.description.trim(),
        whitepaper_url: form.whitepaper_url.trim(),
        docs_url:    form.docs_url.trim(),
        github_repos: form.github_repos.split('\n').map((r) => r.trim()).filter(Boolean).map((url) => ({ url })),
        roadmap:     form.roadmap.trim(),
        tokenomics: {
          symbol:            form.token_symbol.trim(),
          total_supply:      form.token_supply.trim(),
          utility:           form.token_utility.trim(),
          emission_schedule: form.token_emissions.trim(),
        },
        audits: form.audit_auditor.trim()
          ? [{ firm: form.audit_auditor.trim(), report_url: form.audit_url.trim(), audit_date: form.audit_date }]
          : [],
        team: form.team_name.trim()
          ? [{ name: form.team_name.trim(), role: form.team_role.trim(), linkedin: form.team_linkedin.trim(), x: form.team_x.trim() }]
          : [],
        investors:    form.investors.split(',').map((s) => s.trim()).filter(Boolean),
        partnerships: form.partnerships.split(',').map((s) => s.trim()).filter(Boolean),
        bug_bounty_url: form.bug_bounty_url.trim(),
        ecosystem_integrations: form.ecosystem_integrations.split(',').map((s) => s.trim()).filter(Boolean),
        verification_document_url: form.verification_doc_url.trim() || uploadedFiles[0]?.url || '',
      });

      // ── Save to localStorage immediately (works even without Supabase) ──
      saveProjectLocally({
        project_id,
        name: form.name,
        category: form.category,
        website: form.website,
        description: form.description,
        owner: address!,
        status: 'draft',
        created_at: new Date().toISOString(),
      });

      // Sync to Supabase cache (non-blocking, fails silently if tables missing)
      setStep('Syncing to index…');
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id, owner: address,
          name: form.name, category: form.category,
          website: form.website, description: form.description,
        }),
      }).catch(() => {});

      // project_id is the actual contract-returned ID, not the tx hash
      if (project_id && !project_id.startsWith('0x')) {
        router.push(`/project/${project_id}`);
      } else {
        // Shouldn't happen, but fallback to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Try again.');
      setStep('');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Stable label & style (based on mounted state only - no flash) ──
  const btnLabel = !mounted
    ? '⬡ Submit Project'                          // same on server + first paint
    : submitting
      ? (step || '⬡ Submitting to GenLayer…')
      : !isConnected
        ? 'Connect wallet to continue'
        : '⬡ Submit Project';

  const btnDisabled = submitting || !mounted || !isConnected;

  const btnStyle = {
    background: btnDisabled
      ? 'rgba(184,99,63,0.18)'
      : 'linear-gradient(135deg, #8b7355 0%, #b8633f 55%, #a86f4f 100%)',
    color: '#fff',
    boxShadow: btnDisabled ? 'none' : '0 16px 40px rgba(184,99,63,0.16)',
  };

  // ── Section styles (pure constants - identical on server and client) ──
  const sectionStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 12px 32px rgba(26, 22, 18, 0.05)',
  };
  const sectionHead = {
    fontSize: '15px', fontWeight: 700, color: 'var(--foreground)',
    marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Basic Info ─────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={sectionHead}><span style={{ color: 'var(--brand)' }}>◈</span> Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Project Name" required>
            <input className={inputCls} style={INPUT_STYLE} value={form.name}
              onChange={set('name')} placeholder="Proof submission title" required />
          </Field>
          <Field label="Category" required>
            <select className={inputCls} style={{ ...INPUT_STYLE, cursor: 'pointer' }}
              value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Website" required>
            <input className={inputCls} style={INPUT_STYLE} value={form.website}
              onChange={set('website')} placeholder="https://" required />
          </Field>
          <Field label="Description" required>
            <textarea className={cn(inputCls, 'resize-none h-20')} style={INPUT_STYLE}
              value={form.description} onChange={set('description')}
              placeholder="What problem does this solve?" required />
          </Field>
        </div>
      </section>

      {/* ── Technical ──────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={sectionHead}><span style={{ color: 'var(--brand)' }}>⬡</span> Technical Evidence</h2>
        <div className="space-y-4">
          <Field label="Whitepaper URL">
            <input className={inputCls} style={INPUT_STYLE} value={form.whitepaper_url}
              onChange={set('whitepaper_url')} placeholder="https://genlayer.example.com/whitepaper" />
          </Field>
          <Field label="Verification Document URL" hint="Link to PDF or hosted proof document">
            <input className={inputCls} style={INPUT_STYLE} value={form.verification_doc_url}
              onChange={set('verification_doc_url')} placeholder="https://genlayer.example.com/verification.pdf" />
          </Field>
          {uploadedFiles.length > 0 && (
            <div className="rounded-2xl px-4 py-3 text-xs" style={{ background: 'rgba(107, 142, 122, 0.06)', color: 'var(--brand-deep)' }}>
              Uploaded evidence URL that will be used if this field is empty: {uploadedFiles[0]?.url}
            </div>
          )}
          <Field label="Documentation URL">
            <input className={inputCls} style={INPUT_STYLE} value={form.docs_url}
              onChange={set('docs_url')} placeholder="https://genlayer.example.com/docs" />
          </Field>
          <Field label="GitHub Repositories" hint="One URL per line">
            <textarea className={cn(inputCls, 'resize-none h-24 font-mono text-xs')}
              style={INPUT_STYLE} value={form.github_repos} onChange={set('github_repos')}
              placeholder="https://github.com/genlayer/project" />
          </Field>
        </div>
      </section>

      {/* ── Business ───────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={sectionHead}><span style={{ color: 'var(--brand)' }}>▷</span> Business & Roadmap</h2>
        <div className="space-y-4">
          <Field label="Roadmap" required>
            <textarea className={cn(inputCls, 'resize-none h-28')} style={INPUT_STYLE}
              value={form.roadmap} onChange={set('roadmap')}
              placeholder="Release milestones, audit cycles, launch phases..." required />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Investors" hint="Comma separated">
              <input className={inputCls} style={INPUT_STYLE} value={form.investors}
                onChange={set('investors')} placeholder="Gen Ventures, Chain Capital" />
            </Field>
            <Field label="Partnerships" hint="Comma separated">
              <input className={inputCls} style={INPUT_STYLE} value={form.partnerships}
                onChange={set('partnerships')} placeholder="Oracle providers, validator partners" />
            </Field>
          </div>
          <Field label="Ecosystem Integrations" hint="Comma separated">
            <input className={inputCls} style={INPUT_STYLE} value={form.ecosystem_integrations}
              onChange={set('ecosystem_integrations')} placeholder="Ethereum, Polygon, Infura..." />
          </Field>
        </div>
      </section>

      {/* ── Tokenomics ─────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={sectionHead}><span style={{ color: 'var(--brand)' }}>◉</span> Tokenomics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Token Symbol">
            <input className={inputCls} style={INPUT_STYLE} value={form.token_symbol}
              onChange={set('token_symbol')} placeholder="GEN" />
          </Field>
          <Field label="Total Supply">
            <input className={inputCls} style={INPUT_STYLE} value={form.token_supply}
              onChange={set('token_supply')} placeholder="1,000,000,000" />
          </Field>
          <Field label="Token Utility">
            <textarea className={cn(inputCls, 'resize-none h-20')} style={INPUT_STYLE}
              value={form.token_utility} onChange={set('token_utility')}
              placeholder="Governance, staking, fee capture..." />
          </Field>
          <Field label="Emission Schedule">
            <textarea className={cn(inputCls, 'resize-none h-20')} style={INPUT_STYLE}
              value={form.token_emissions} onChange={set('token_emissions')}
              placeholder="50% launch, 50% vesting over 3 years..." />
          </Field>
        </div>
      </section>

      {/* ── Security ───────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={sectionHead}><span style={{ color: 'var(--brand)' }}>◇</span> Security</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Audit Firm">
            <input className={inputCls} style={INPUT_STYLE} value={form.audit_auditor}
              onChange={set('audit_auditor')} placeholder="GenAudit, Certik, Trail of Bits" />
          </Field>
          <Field label="Audit Report URL">
            <input className={inputCls} style={INPUT_STYLE} value={form.audit_url}
              onChange={set('audit_url')} placeholder="https://genlayer.example.com/audit-report" />
          </Field>
          <Field label="Audit Date">
            <input type="date" className={inputCls} style={INPUT_STYLE}
              value={form.audit_date} onChange={set('audit_date')} />
          </Field>
          <Field label="Bug Bounty URL">
            <input className={inputCls} style={INPUT_STYLE} value={form.bug_bounty_url}
              onChange={set('bug_bounty_url')} placeholder="https://immunefi.com/bounty/genlayer" />
          </Field>
        </div>
      </section>

      {/* ── Team ───────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2 style={sectionHead}><span style={{ color: 'var(--brand)' }}>◈</span> Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Name">
            <input className={inputCls} style={INPUT_STYLE} value={form.team_name}
              onChange={set('team_name')} placeholder="Jane Smith" />
          </Field>
          <Field label="Role">
            <input className={inputCls} style={INPUT_STYLE} value={form.team_role}
              onChange={set('team_role')} placeholder="CEO, CTO..." />
          </Field>
          <Field label="LinkedIn">
            <input className={inputCls} style={INPUT_STYLE} value={form.team_linkedin}
              onChange={set('team_linkedin')} placeholder="https://linkedin.com/in/..." />
          </Field>
          <Field label="X / Twitter">
            <input className={inputCls} style={INPUT_STYLE} value={form.team_x}
              onChange={set('team_x')} placeholder="https://x.com/... or @genlayer" />
          </Field>
        </div>
      </section>

      {/* ── Status messages - only shown after mount (client-only) ─ */}
      {mounted && error && (
        <div className="rounded-xl p-4 text-sm"
          style={{ background: 'rgba(184, 99, 63, 0.08)', border: '1px solid rgba(184, 99, 63, 0.18)', color: '#a85c4a' }}>
          {error}
        </div>
      )}

      {mounted && !isConnected && (
        <div className="rounded-xl p-4 text-sm"
          style={{ background: 'rgba(107,142,122,0.08)', border: '1px solid rgba(107,142,122,0.15)', color: 'var(--brand-deep)' }}>
          Connect your wallet to submit a project.
        </div>
      )}

      {/* ── Submit button - same markup on server and client until mounted ── */}
      <button
        type="submit"
        disabled={btnDisabled}
        className="w-full font-bold py-4 px-6 rounded-xl text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={btnStyle}
      >
        {btnLabel}
      </button>

    </form>
  );
}
