import type { Metadata } from 'next';
import { ProjectFormWithUpload } from '@/components/ProjectFormWithUpload';

export const metadata: Metadata = {
  title: 'Register Initiative - Veridex',
  description: 'Register your crypto initiative for AI-powered assessment by GenLayer Intelligent Contracts.',
};

export default function SubmitPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="mb-3 text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>
          Registration
        </p>
        <h1 className="mb-3 text-4xl font-semibold" style={{ color: '#1a1612' }}>
          Register your Initiative
        </h1>
        <p className="text-base leading-8" style={{ color: '#6b6360' }}>
          Provide all evidence. Finalize it. GenLayer assesses. Validators verify. Your verification score,
          tier, and evidence history are recorded on-chain.
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
          <strong style={{ color: 'var(--brand-deep)' }}>Verification flow:</strong>
          {' '}Submit your project evidence -&gt; Publish supporting documents -&gt; Lock the submission -&gt;
          {' '}GenLayer validates and scores -&gt; Your verification record becomes on-chain history.
        </div>
      </div>

      <ProjectFormWithUpload />
    </div>
  );
}
