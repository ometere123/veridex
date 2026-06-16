import type { Metadata } from 'next';
import { ProjectFormWithUpload } from '@/components/ProjectFormWithUpload';

export const metadata: Metadata = {
  title: 'Submit Evidence - Veridex',
  description: 'Create a public verification dossier and evidence manifest on GenLayer.',
};

export default function SubmitPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="mb-3 text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>
          Submit Evidence
        </p>
        <h1 className="mb-3 text-4xl font-semibold" style={{ color: '#1a1612' }}>
          Create a verification dossier
        </h1>
        <p className="text-base leading-8" style={{ color: '#6b6360' }}>
          Provide public evidence, publish supporting documents, and create the dossier that will become
          the basis for a GenLayer verification cycle.
        </p>
      </div>

      <div
        className="mb-8 flex items-start gap-3 rounded-3xl p-5 text-sm"
        style={{
          background: 'rgba(184, 99, 63, 0.08)',
          border: '1px solid rgba(184, 99, 63, 0.16)',
          color: '#1a1612',
        }}
      >
        <span className="text-lg font-semibold" style={{ color: 'var(--brand)' }}>
          +
        </span>
        <div className="leading-7">
          <strong style={{ color: 'var(--brand-deep)' }}>Evidence flow:</strong>
          {' '}Submit public evidence -&gt; Lock the evidence set -&gt; GenLayer fact-checks sources -&gt;
          {' '}A verification report, risk band, and proof ledger are stored on-chain.
        </div>
      </div>

      <ProjectFormWithUpload />
    </div>
  );
}
