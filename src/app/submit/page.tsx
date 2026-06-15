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
        <h1 className="text-3xl font-black mb-2" style={{ color: '#e2e8f0' }}>
          Register your Initiative
        </h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Provide all evidence. Finalize it. GenLayer assesses. Validators verify.
          Your verification score, tier, and evidence history are recorded on-chain.
        </p>
      </div>

      {/* How it works banner */}
      <div
        className="rounded-3xl p-5 mb-8 text-sm flex items-start gap-3"
        style={{
          background: 'rgba(184, 99, 63, 0.08)',
          border: '1px solid rgba(184, 99, 63, 0.16)',
          color: 'var(--foreground)',
        }}
      >
        <span className="text-lg flex-shrink-0" style={{ color: 'var(--brand)' }}>⬡</span>
        <div>
          <strong style={{ color: 'var(--brand-deep)' }}>Verification flow:</strong>
          Submit your project evidence → Publish supporting documents → Lock the submission →
          GenLayer validates and scores → Your verification record becomes on-chain history.
        </div>
      </div>

      <ProjectFormWithUpload />
    </div>
  );
}
