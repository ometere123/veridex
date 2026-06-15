import type { Metadata } from 'next';
import { ProjectFormWithUpload } from '@/components/ProjectFormWithUpload';

export const metadata: Metadata = {
  title: 'Register Initiative — Veridex',
  description: 'Register your crypto initiative for AI-powered assessment by GenLayer Intelligent Contracts.',
};

const STEPS = [
  { n: 1, title: 'Enter details', body: 'Name, category, website, team, tokenomics, and roadmap.' },
  { n: 2, title: 'Upload evidence', body: 'Whitepaper, audits, and supporting documents.' },
  { n: 3, title: 'Lock submission', body: 'Sign and finalize on-chain. No changes after this step.' },
  { n: 4, title: 'GenLayer assesses', body: 'Intelligent contract fetches sources and scores your evidence.' },
  { n: 5, title: 'Receive your score', body: 'Tier and verification score recorded on-chain permanently.' },
];

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#9b938a' }}>Registration</p>
        <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>Register Your Initiative</h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_1fr]">
        {/* LEFT: Step guide (sticky on desktop) */}
        <div
          className="rounded-2xl p-5 lg:sticky lg:top-6"
          style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
        >
          <p className="mb-5 text-[10px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>How it works</p>
          <div className="flex flex-col">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-black"
                    style={{ background: '#6b8e7a', color: '#ffffff' }}
                  >
                    {s.n}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="my-1 w-px flex-1"
                      style={{ background: 'rgba(107,142,122,0.15)', minHeight: 20 }}
                    />
                  )}
                </div>
                <div className={i < STEPS.length - 1 ? 'pb-5' : ''}>
                  <p className="text-sm font-medium" style={{ color: '#1a1612' }}>{s.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: '#9b938a' }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-5 rounded-xl p-3 text-[11px] leading-relaxed"
            style={{ background: 'rgba(184,99,63,0.07)', color: '#8b5a3c' }}
          >
            Once locked, submissions cannot be modified. Ensure all evidence URLs are live and accessible before locking.
          </div>
        </div>

        {/* RIGHT: Form */}
        <div>
          <ProjectFormWithUpload />
        </div>
      </div>
    </div>
  );
}
