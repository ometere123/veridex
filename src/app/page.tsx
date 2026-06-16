import Link from 'next/link';

const PIPELINE = ['Evidence Submitted', 'Evidence Locked', 'Fact Check', 'Verification Report', 'Registry Entry'];

const TRUST_OUTPUTS = [
  ['Evidence Manifest', 'Structured public sources, documents, audits, GitHub, tokenomics, and issuer claims.'],
  ['GenLayer Verification', 'The contract records source-grounded verification output as the public source of truth.'],
  ['Risk Band', 'Missing evidence, weak source coverage, and security gaps become visible risk signals.'],
  ['Proof Ledger', 'Every major dossier action appends a verifiable proof event and hash trail.'],
  ['Verification Level', 'A concise level summarizes evidence strength without pretending risk disappears.'],
];

const EVIDENCE_TYPES = ['Docs', 'Whitepaper', 'GitHub', 'Audits', 'Roadmap', 'Tokenomics', 'Team', 'Bug bounty', 'Evidence files'];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative px-4 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-[#8effc333] bg-[#8effc314] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8effc3]">
              Evidence-first registry on GenLayer
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-[#f5fff7] sm:text-7xl">
              Verify crypto projects by evidence, not hype.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#9bb4a6]">
              Veridex turns public project evidence into GenLayer-verified dossiers, fact-check reports, risk signals, and proof history.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/submit" className="rounded-full bg-[#8effc3] px-7 py-4 text-sm font-semibold text-[#07110d] shadow-[0_20px_60px_rgba(142,255,195,0.18)]">
                Submit Evidence
              </Link>
              <Link href="/registry" className="rounded-full border border-[#8effc333] bg-[#ffffff08] px-7 py-4 text-sm font-semibold text-[#dfffee]">
                Browse Registry
              </Link>
            </div>
          </div>

          <div className="scan-surface rounded-[40px] border border-[#8effc333] bg-[#0b1712cc] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">Evidence pipeline</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#f5fff7]">From claim to public proof</h2>
              </div>
              <span className="rounded-full border border-[#8effc333] px-3 py-1 text-xs font-mono text-[#8effc3]">Live dossier flow</span>
            </div>
            <div className="space-y-3">
              {PIPELINE.map((step, index) => (
                <div key={step} className="grid grid-cols-[42px_1fr] items-center gap-3 rounded-3xl border border-[#8effc31f] bg-[#ffffff08] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8effc314] font-mono text-sm font-semibold text-[#8effc3]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-semibold text-[#f5fff7]">{step}</p>
                    <p className="mt-1 text-xs text-[#789685]">{pipelineDescription(index)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">Trust output</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#f5fff7]">A dossier is more than a score.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#9bb4a6]">
              Every output is designed to show what was proven, what is missing, what changed, and where the public hash trail points.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {TRUST_OUTPUTS.map(([title, body]) => (
              <div key={title} className="rounded-[30px] border border-[#8effc326] bg-[#0b1712cc] p-5 backdrop-blur-xl">
                <span className="mb-5 inline-flex rounded-full bg-[#8effc314] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8effc3]">Seal</span>
                <h3 className="text-lg font-semibold text-[#f5fff7]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#9bb4a6]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[40px] border border-[#8effc326] bg-[#06100ccc] p-6 backdrop-blur-xl lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">Evidence categories</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#f5fff7]">Build a case file, not a marketing profile.</h2>
            <p className="mt-4 text-sm leading-7 text-[#9bb4a6]">
              Once locked, this evidence set becomes the basis for the current GenLayer verification cycle.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EVIDENCE_TYPES.map((type) => (
              <span key={type} className="rounded-full border border-[#8effc326] bg-[#8effc30f] px-4 py-2 text-sm text-[#dfffee]">
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function pipelineDescription(index: number) {
  return [
    'Issuer supplies public sources and uploaded evidence URLs.',
    'The manifest is frozen into a hash-backed evidence basis.',
    'Submitted claims are checked against available public proof.',
    'Evidence confidence, dimensions, warnings, and hashes are stored.',
    'The dossier becomes discoverable in the verification registry.',
  ][index];
}
