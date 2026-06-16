import Link from 'next/link';
import { Coins, Rocket, ShieldCheck, TrendingUp, Users, Waypoints, type LucideIcon } from 'lucide-react';

const FLOW_STEPS = [
  { n: '01', label: 'Register Initiative',   desc: 'Upload whitepaper, GitHub, docs, tokenomics, and team data.' },
  { n: '02', label: 'Finalize Evidence',     desc: 'Generate an immutable SHA-256 hash. Evidence is frozen.' },
  { n: '03', label: 'GenLayer Assesses',     desc: 'AI agents evaluate the full 7-factor Veridex score model through Intelligent Contracts.' },
  { n: '04', label: 'Validators Verify',     desc: 'Decentralized validators reach consensus on results.' },
  { n: '05', label: 'Verification History Recorded', desc: 'Verification score, tier, and evidence history are recorded on-chain.' },
];

const PROBLEMS = [
  { label: 'Hype-Driven Scores', desc: 'Attention and sponsorship overpower evidence and audit history.' },
  { label: 'Influencer Amplification', desc: 'Loud narratives get rewarded while proof stays hidden.' },
  { label: 'Opaque Evaluation', desc: 'Scores are assigned without clear verification criteria.' },
  { label: 'Claim Without Trace', desc: 'Assertions lack a documented evidence trail to validate them.' },
];

const DIMENSIONS: { code: string; icon: LucideIcon; label: string }[] = [
  { code: 'protocol_architecture', icon: Waypoints, label: 'Protocol Architecture' },
  { code: 'team_governance', icon: Users, label: 'Team & Governance' },
  { code: 'market_traction', icon: TrendingUp, label: 'Market Traction' },
  { code: 'security_risk', icon: ShieldCheck, label: 'Security & Risk' },
  { code: 'delivery_proof', icon: Rocket, label: 'Delivery Proof' },
  { code: 'token_design', icon: Coins, label: 'Token Design' },
  { code: 'evidence_integrity', icon: Waypoints, label: 'Evidence Integrity' },
];


export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(circle at top left, rgba(107, 142, 122, 0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(184, 99, 63, 0.08), transparent 25%)',
          }}
        />

        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.3fr_0.9fr] items-start">
          <div className="space-y-8">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em]"
              style={{
                borderColor: 'rgba(107, 142, 122, 0.25)',
                color: '#6b8e7a',
                background: 'rgba(107, 142, 122, 0.07)',
              }}
            >
              VERIFIED PROTOCOL
            </span>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-5xl sm:text-6xl font-semibold leading-tight"
                style={{ color: '#1a1612', fontFamily: 'var(--font-space-grotesk)' }}>
                Evidence-first reputation for crypto projects that demand real verification.
              </h1>

              <p className="text-lg max-w-xl leading-8" style={{ color: '#6b6360' }}>
                Veridex turns documentation, audit proofs, and public source evidence into an immutable verification profile on-chain. This is reputation backed by data, not opinions.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row items-start">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold transition-all"
                  style={{
                    background: '#6b8e7a',
                    color: '#ffffff',
                  }}
                >
                  Submit a project
                </Link>
                <Link
                  href="/tiers"
                  className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold transition-all border"
                  style={{
                    background: 'transparent',
                    borderColor: 'rgba(107, 142, 122, 0.22)',
                    color: '#1a1612',
                  }}
                >
                  Explore tiers
                </Link>
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-[rgba(107,142,122,0.12)] bg-[rgba(255,255,255,0.92)] p-8 shadow-[0_20px_80px_rgba(15,15,15,0.05)] backdrop-blur-xl">
            <div className="mb-8">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: '#9b938a' }}>
                Verification vault
              </div>
              <h2 className="text-2xl font-semibold" style={{ color: '#1a1612' }}>
                Evidence, audit, and consensus in one place.
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-[rgba(107,142,122,0.12)] bg-[rgba(107,142,122,0.04)] p-4">
                <p className="text-sm font-semibold" style={{ color: '#6b8e7a' }}>Immutable proof layer</p>
                <p className="text-sm mt-2" style={{ color: '#6b6360' }}>
                  Each project stores evidence metadata on-chain so validation is repeatable and auditable.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-3xl border border-[rgba(107,142,122,0.12)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] mb-2" style={{ color: '#9b938a' }}>Fee coverage</p>
                  <p className="font-semibold" style={{ color: '#1a1612' }}>Dynamic protocol fees for submission, review, and reassessment.</p>
                </div>
                <div className="rounded-3xl border border-[rgba(107,142,122,0.12)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] mb-2" style={{ color: '#9b938a' }}>Audit-ready</p>
                  <p className="font-semibold" style={{ color: '#1a1612' }}>All evidence references are URL-based, supporting documentation and proofs directly.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Why it matters ───────────────────────────────── */}
      <section className="px-4 pb-14 sm:pb-20">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start">
          <div className="rounded-[32px] border border-[rgba(107,142,122,0.12)] bg-[rgba(255,255,255,0.92)] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(107,142,122,0.12)] text-sm font-bold" style={{ color: '#6b8e7a' }}>01</span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Why current ranks fail</p>
                <h3 className="text-2xl font-semibold" style={{ color: '#1a1612' }}>Most systems rank noise, not proof.</h3>
              </div>
            </div>
            <p className="text-sm leading-7" style={{ color: '#6b6360' }}>
              Today’s crypto scores are shaped by marketing, promoters, and social buzz. Veridex reorients value around evidence, audit depth, and protocol transparency.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PROBLEMS.map((p) => (
              <div key={p.label} className="rounded-[28px] border border-[rgba(107,142,122,0.12)] bg-[rgba(255,255,255,0.94)] p-6 shadow-sm">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: '#b8633f' }}>{p.label}</div>
                <p className="text-sm leading-6" style={{ color: '#6b6360' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verification sequence ───────────────────────── */}
      <section className="px-4 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-3 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#9b938a' }}>Verification sequence</p>
            <h2 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>A process built around evidence and consensus.</h2>
          </div>

          <div className="space-y-5">
            {FLOW_STEPS.map((step, index) => (
              <div
                key={step.n}
                className={`grid gap-4 rounded-[32px] border border-[rgba(107,142,122,0.12)] bg-[rgba(255,255,255,0.9)] p-6 ${index % 2 === 0 ? 'lg:grid-cols-[64px_auto]' : 'lg:grid-cols-[auto_64px]'} items-center`}
              >
                {index % 2 === 0 ? (
                  <div className="rounded-3xl bg-[rgba(107,142,122,0.08)] p-4 text-center text-sm font-bold" style={{ color: '#6b8e7a' }}>
                    {step.n}
                  </div>
                ) : null}
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#1a1612' }}>{step.label}</div>
                  <p className="mt-2 text-sm leading-6" style={{ color: '#6b6360' }}>{step.desc}</p>
                </div>
                {index % 2 !== 0 ? (
                  <div className="rounded-3xl bg-[rgba(107,142,122,0.08)] p-4 text-center text-sm font-bold" style={{ color: '#6b8e7a' }}>
                    {step.n}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dimensions ─────────────────────────────────── */}
      <section className="px-4 pb-14 sm:pb-20">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-[rgba(107,142,122,0.12)] bg-[rgba(255,255,255,0.94)] p-8 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.24em] mb-4" style={{ color: '#9b938a' }}>Evaluation dimensions</p>
            <h2 className="text-3xl font-semibold mb-4" style={{ color: '#1a1612' }}>Seven source-grounded dimensions shape every score.</h2>
            <p className="text-sm leading-7" style={{ color: '#6b6360' }}>
              Veridex scores protocol architecture, governance credibility, traction, security posture, delivery proof, token design, and evidence integrity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {DIMENSIONS.map((dimension, index) => (
              <div
                key={dimension.code}
                className="rounded-3xl border border-[rgba(107,142,122,0.12)] bg-[rgba(255,255,255,0.96)] p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold"
                    style={{
                      background: index % 2 === 0 ? 'rgba(107, 142, 122, 0.12)' : 'rgba(184, 99, 63, 0.08)',
                      color: index % 2 === 0 ? '#6b8e7a' : '#b8633f',
                    }}
                  >
                    <dimension.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold" style={{ color: '#1a1612' }}>{dimension.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="px-4 pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: '#9b938a' }}>
              Proof-first reputation
            </p>
            <h2 className="text-4xl font-semibold leading-tight mb-6" style={{ color: '#1a1612' }}>
              Make every claim accountable on-chain.
            </h2>
            <p className="max-w-2xl text-base leading-8 mb-8" style={{ color: '#6b6360' }}>
              Veridex is built for the projects that want more than a label - they want verifiable on-chain proof of their claims and a transparent reputation path.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-[#6b8e7a] px-8 py-4 text-sm font-semibold text-white"
              >
                Submit evidence
              </Link>
              <Link
                href="/hub"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(107,142,122,0.22)] px-8 py-4 text-sm font-semibold"
                style={{ color: '#1a1612' }}
              >
                Open the hub
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-[rgba(107,142,122,0.12)] bg-[rgba(255,255,255,0.96)] p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Why Veridex</p>
              <h3 className="text-2xl font-semibold mt-3" style={{ color: '#1a1612' }}>Verification designed for transparency.</h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-[rgba(107,142,122,0.08)] p-5">
                <p className="text-sm font-semibold" style={{ color: '#6b8e7a' }}>On-chain evidence links</p>
                <p className="text-sm mt-2" style={{ color: '#6b6360' }}>Projects include PDF and document URLs directly in the contract metadata.</p>
              </div>
              <div className="rounded-3xl bg-[rgba(184,99,63,0.08)] p-5">
                <p className="text-sm font-semibold" style={{ color: '#b8633f' }}>Adaptive protocol fees</p>
                <p className="text-sm mt-2" style={{ color: '#6b6360' }}>Admin-configurable fees align on-chain incentives without hardcoding values.</p>
              </div>
              <div className="rounded-3xl bg-[rgba(107,142,122,0.08)] p-5">
                <p className="text-sm font-semibold" style={{ color: '#6b8e7a' }}>Consensus-ready scores</p>
                <p className="text-sm mt-2" style={{ color: '#6b6360' }}>Scores are produced by intelligent contracts and locked evidence, not manual curation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
