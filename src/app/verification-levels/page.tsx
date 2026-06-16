const LEVELS = [
  { level: 'Verified+', range: '95-100', meaning: 'Extensive evidence, strong source integrity, low risk signals.' },
  { level: 'Verified', range: '85-94', meaning: 'Strong evidence coverage with manageable or disclosed gaps.' },
  { level: 'Substantiated', range: '75-84', meaning: 'Most important claims are supported, but more proof would improve confidence.' },
  { level: 'Developing', range: '65-74', meaning: 'Useful evidence exists, but maturity or source depth is still developing.' },
  { level: 'Limited Evidence', range: '50-64', meaning: 'The dossier has meaningful gaps across source coverage or proof completeness.' },
  { level: 'High Risk', range: '30-49', meaning: 'Major evidence gaps, weak source integrity, or notable risk flags.' },
  { level: 'Unverifiable', range: '0-29', meaning: 'Claims cannot be verified from the supplied public evidence.' },
];

const DIMENSIONS = [
  ['Protocol Architecture', 'Architecture clarity, docs, repository transparency, and feasibility.'],
  ['Team & Governance', 'Verifiable contributors, governance process, and issuer transparency.'],
  ['Market Traction', 'Public traction, ecosystem proof, partnerships, and category fit.'],
  ['Security & Risk', 'Audits, bug bounty, security process, and disclosed protocol risks.'],
  ['Delivery Proof', 'Roadmap specificity, shipped product evidence, and development footprint.'],
  ['Token Design', 'Token utility, supply, emissions, and alignment with protocol usage.'],
  ['Evidence Integrity', 'Whether submitted claims are supported by public sources and hashes.'],
];

export default function VerificationLevelsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="mb-3 text-[11px] uppercase tracking-[0.26em]" style={{ color: '#8a8178' }}>Verification Model</p>
        <h1 className="max-w-3xl text-4xl font-semibold" style={{ color: '#1a1612' }}>Levels replace leaderboard tiers.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: '#5f5a52' }}>
          Veridex summarizes a dossier with a verification level, evidence confidence, risk band, and proof completeness. Scores are not a hype race; they explain how well public evidence supports project claims.
        </p>
      </div>

      <div className="grid gap-4">
        {LEVELS.map((item, index) => (
          <div key={item.level} className="grid gap-4 rounded-[28px] bg-white p-5 sm:grid-cols-[160px_100px_1fr]" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
            <div className="text-lg font-semibold" style={{ color: index < 2 ? '#4f8f68' : index < 4 ? '#8b8a55' : '#b8633f' }}>{item.level}</div>
            <div className="font-mono text-sm" style={{ color: '#8a8178' }}>{item.range}</div>
            <div className="text-sm leading-7" style={{ color: '#5f5a52' }}>{item.meaning}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[32px] bg-white p-6" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
        <h2 className="mb-5 text-xl font-semibold" style={{ color: '#1a1612' }}>Seven verification dimensions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DIMENSIONS.map(([name, desc]) => (
            <div key={name} className="rounded-3xl p-5" style={{ background: 'rgba(107,142,122,0.06)' }}>
              <h3 className="text-sm font-semibold" style={{ color: '#1a1612' }}>{name}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: '#5f5a52' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
