import type { Metadata } from 'next';
import { ProjectFormWithUpload } from '@/components/ProjectFormWithUpload';

export const metadata: Metadata = {
  title: 'Submit Evidence - Veridex',
  description: 'Create a public verification dossier and evidence manifest on GenLayer.',
};

export default function SubmitPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="mb-3 text-[11px] uppercase tracking-[0.30em]" style={{ color: '#8effc3' }}>
          Evidence Case File
        </p>
        <h1 className="mb-3 text-5xl font-semibold leading-tight" style={{ color: '#f5fff7' }}>
          Create a verification dossier
        </h1>
        <p className="max-w-2xl text-base leading-8" style={{ color: '#9bb4a6' }}>
          Provide public evidence, publish supporting documents, and create the dossier that will become
          the basis for a GenLayer verification cycle.
        </p>
      </div>

      <div
        className="mb-8 flex items-start gap-3 rounded-3xl p-5 text-sm"
        style={{
          background: 'rgba(142, 255, 195, 0.10)',
          border: '1px solid rgba(142, 255, 195, 0.22)',
          color: '#dfffee',
        }}
      >
        <span className="text-lg font-semibold" style={{ color: 'var(--brand)' }}>
          Lock
        </span>
        <div className="leading-7">
          <strong style={{ color: '#8effc3' }}>Evidence flow:</strong>
          {' '}Submit public evidence -&gt; Lock the evidence set -&gt; GenLayer fact-checks sources -&gt;
          {' '}A verification report, risk band, and proof ledger are stored on-chain.
        </div>
      </div>

      <ProjectFormWithUpload />
    </div>
  );
}
