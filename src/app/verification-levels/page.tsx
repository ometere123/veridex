const LEVELS = [
  ['Verified+', '95-100', 'Extensive evidence, strong source integrity, low risk signals.'],
  ['Verified', '85-94', 'Strong evidence coverage with manageable or disclosed gaps.'],
  ['Substantiated', '75-84', 'Most important claims are supported, but more proof would improve confidence.'],
  ['Developing', '65-74', 'Useful evidence exists, but source depth or maturity is still developing.'],
  ['Limited Evidence', '50-64', 'Meaningful gaps remain across source coverage or proof completeness.'],
  ['High Risk', '30-49', 'Major evidence gaps, weak source integrity, or notable risk flags.'],
  ['Unverifiable', '0-29', 'Claims cannot be verified from the supplied public evidence.'],
];

const RISKS = [
  ['LOW', 'Few visible evidence gaps and stronger source consistency.'],
  ['MODERATE', 'Some evidence gaps or risk signals remain visible.'],
  ['ELEVATED', 'Multiple source, governance, security, or delivery concerns exist.'],
  ['HIGH', 'Serious missing evidence or weak public support for key claims.'],
  ['CRITICAL', 'Severe gaps, contradictions, or unverifiable claims.'],
  ['UNKNOWN', 'The dossier does not yet have enough verification output.'],
];

const DIMENSIONS = [
  'Protocol Architecture',
  'Team & Governance',
  'Market Traction',
  'Security & Risk',
  'Delivery Proof',
  'Token Design',
  'Evidence Integrity',
];

export default function VerificationLevelsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-8 rounded-[40px] border border-[#8effc333] bg-[#0b1712cc] p-7 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[#8effc3]">Verification model</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight text-[#f5fff7]">
          Verification levels explain evidence strength, not guaranteed safety.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#dfffee]">
          A high verification level does not mean a project is risk-free. It means the submitted evidence was stronger, more complete, and more consistent.
        </p>
      </section>

      <div className="grid gap-4">
        {LEVELS.map(([level, range, meaning], index) => (
          <div key={level} className="grid gap-4 rounded-[30px] border border-[#8effc326] bg-[#0b1712cc] p-5 backdrop-blur-xl sm:grid-cols-[180px_120px_1fr]">
            <div className="text-lg font-semibold" style={{ color: index < 2 ? '#8effc3' : index < 4 ? '#d4ad63' : '#b8633f' }}>{level}</div>
            <div className="font-mono text-sm text-[#6fae8e]">{range}</div>
            <div className="text-sm leading-7 text-[#9bb4a6]">{meaning}</div>
          </div>
        ))}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[36px] border border-[#8effc326] bg-[#0b1712cc] p-6 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-[#f5fff7]">Risk bands</h2>
          <div className="mt-5 space-y-3">
            {RISKS.map(([risk, meaning]) => (
              <div key={risk} className="rounded-3xl border border-[#8effc31f] bg-[#ffffff08] p-4">
                <p className="font-mono text-sm text-[#8effc3]">{risk}</p>
                <p className="mt-2 text-sm leading-6 text-[#9bb4a6]">{meaning}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[36px] border border-[#8effc326] bg-[#0b1712cc] p-6 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-[#f5fff7]">Seven verification dimensions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {DIMENSIONS.map((dimension) => (
              <div key={dimension} className="rounded-3xl border border-[#8effc31f] bg-[#ffffff08] p-4">
                <p className="text-sm font-semibold text-[#f5fff7]">{dimension}</p>
                <p className="mt-2 text-xs leading-6 text-[#9bb4a6]">Scored from source evidence, missing proof, public consistency, and risk context.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
