'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { WalletGate } from '@/components/WalletGate';
import {
  contractCreateProject,
  contractLockProject,
  contractSubmitEvaluation,
  contractRunEvaluation,
} from '@/lib/genlayer-write';

// ── Real project data with live, fetchable URLs ─────────────────────────────
// Every URL here is HTTPS and publicly accessible so gl.nondet.web.get() succeeds.

const SEED_PROJECTS = [
  {
    name: 'Uniswap V3',
    category: 'DeFi',
    website: 'https://uniswap.org',
    description:
      'Uniswap V3 is the leading decentralised exchange protocol on Ethereum, ' +
      'introducing concentrated liquidity positions that allow LPs to provide liquidity ' +
      'within custom price ranges, dramatically improving capital efficiency over V2. ' +
      'It processes billions in daily volume across thousands of trading pairs with full on-chain settlement.',
    whitepaper_url: 'https://uniswap.org/whitepaper-v3.pdf',
    docs_url: 'https://docs.uniswap.org',
    github_repos: [
      { url: 'https://github.com/Uniswap/v3-core' },
      { url: 'https://github.com/Uniswap/v3-periphery' },
    ],
    roadmap:
      'Q1 2024: V4 hooks architecture launch enabling custom pool logic. ' +
      'Q2 2024: Singleton contract with transient storage gas optimizations. ' +
      'Q3 2024: Cross-chain native liquidity routing via Uniswap X. ' +
      'Q4 2024: Native token integrations across 10+ EVM chains.',
    tokenomics: {
      symbol: 'UNI',
      total_supply: '1,000,000,000',
      utility: 'Governance token for Uniswap DAO. UNI holders vote on protocol parameters, fee switches, treasury allocation, and Uniswap Foundation grants.',
      emission_schedule: '60% community treasury, 21.51% team/future employees (4-yr vest), 17.8% investors (4-yr vest), 0.069% advisors.',
    },
    audits: [
      { firm: 'Trail of Bits', url: 'https://uniswap.org/whitepaper-v3.pdf', audit_date: '2021-03-23' },
    ],
    team: [
      { name: 'Hayden Adams', role: 'Founder & CEO', x: 'haydenzadams' },
      { name: 'Mary-Catherine Lader', role: 'COO', x: 'mclader' },
    ],
    investors: ['Paradigm', 'a16z', 'USV', 'Variant'],
    partnerships: ['Coinbase', 'Optimism', 'Arbitrum', 'Base', 'Polygon'],
    bug_bounty_url: 'https://uniswap.org/bug-bounty',
    ecosystem_integrations: ['MetaMask Swaps', '1inch', 'Matcha', 'Paraswap', 'Zapper'],
    verification_document_url: '',
  },
  {
    name: 'Aave V3',
    category: 'DeFi',
    website: 'https://aave.com',
    description:
      'Aave V3 is a decentralised, non-custodial liquidity protocol where users ' +
      'can deposit assets to earn passive income or borrow against collateral. ' +
      'V3 introduces cross-chain portals, high-efficiency E-mode, and isolation mode ' +
      'for new asset listings. The GHO stablecoin extends protocol revenue and utility.',
    whitepaper_url: 'https://docs.aave.com/hub/',
    docs_url: 'https://docs.aave.com/hub/',
    github_repos: [
      { url: 'https://github.com/aave/aave-v3-core' },
    ],
    roadmap:
      'Q1 2024: Aave V3.1 with Umbrella safety module upgrade. ' +
      'Q2 2024: GHO stablecoin expansion across Arbitrum, Optimism, Base. ' +
      'Q3 2024: Native USDC integration via Circle CCTP for gas-efficient bridging. ' +
      'Q4 2024: Aave V3.2 with gasless transaction meta-transactions.',
    tokenomics: {
      symbol: 'AAVE',
      total_supply: '16,000,000',
      utility: 'AAVE is the Aave DAO governance token. Staked in Safety Module for insurance backstop and staking rewards. Holders vote on protocol upgrades, asset listings, and treasury grants.',
      emission_schedule: '13M from LEND migration. 3M in ecosystem reserve for grants, incentives, and Safety Module bootstrapping via DAO governance.',
    },
    audits: [
      { firm: 'OpenZeppelin', url: 'https://docs.aave.com/hub/', audit_date: '2022-01-27' },
      { firm: 'Trail of Bits', url: 'https://docs.aave.com/developers/core-contracts/pool', audit_date: '2022-01-07' },
    ],
    team: [
      { name: 'Stani Kulechov', role: 'Founder & CEO', x: 'StaniKulechov' },
      { name: 'Jordan Lazaro Gustave', role: 'COO', x: 'LazaroJordanG' },
    ],
    investors: ['Framework Ventures', 'Blockchain Capital', 'Blockchain.com Ventures'],
    partnerships: ['Polygon', 'Avalanche', 'Optimism', 'Arbitrum', 'Metis'],
    bug_bounty_url: 'https://immunefi.com/bug-bounty/aave',
    ecosystem_integrations: ['Yearn Finance', 'Instadapp', 'DeFi Saver', 'Paraswap'],
    verification_document_url: '',
  },
  {
    name: 'Arbitrum One',
    category: 'Infrastructure',
    website: 'https://arbitrum.io',
    description:
      'Arbitrum One is the leading Ethereum Layer 2 scaling solution built by Offchain Labs ' +
      'using Optimistic Rollup technology. It achieves Ethereum-grade security while dramatically ' +
      'reducing gas costs and increasing throughput. Full EVM equivalence means all Ethereum ' +
      'dApps deploy without modification. The network hosts over 600 live protocols.',
    whitepaper_url: 'https://docs.arbitrum.io/intro/',
    docs_url: 'https://docs.arbitrum.io',
    github_repos: [
      { url: 'https://github.com/OffchainLabs/nitro' },
    ],
    roadmap:
      'Q1 2024: Stylus launch enabling WASM smart contracts in Rust, C, and C++. ' +
      'Q2 2024: BOLD (Bounded Liquidity Delay) fraud-proof upgrade for permissionless validation. ' +
      'Q3 2024: Orbit chains permissionless customisable L3 framework live. ' +
      'Q4 2024: Timeboost transaction ordering for MEV reduction.',
    tokenomics: {
      symbol: 'ARB',
      total_supply: '10,000,000,000',
      utility: 'ARB is the Arbitrum DAO governance token. Holders vote on protocol upgrades, treasury allocation, Security Council elections, and Arbitrum Improvement Proposals (AIPs).',
      emission_schedule: '42.78% DAO treasury, 26.94% investors (4-yr vest), 11.62% airdrop, 7.53% ecosystem DAOs, 11.13% team/advisors (4-yr vest).',
    },
    audits: [
      { firm: 'Trail of Bits', url: 'https://docs.arbitrum.io/intro/', audit_date: '2022-12-01' },
    ],
    team: [
      { name: 'Steven Goldfeder', role: 'Co-founder & CEO', x: 'sgoldfed' },
      { name: 'Ed Felten', role: 'Co-founder & Chief Scientist', x: 'EdFelten' },
      { name: 'Harry Kalodner', role: 'Co-founder & CTO' },
    ],
    investors: ['Lightspeed', 'Pantera Capital', 'Polychain Capital', 'Ribbit Capital'],
    partnerships: ['Coinbase', 'Google Cloud', 'Uniswap', 'Aave', 'Curve', 'GMX'],
    bug_bounty_url: 'https://immunefi.com/bug-bounty/arbitrum',
    ecosystem_integrations: ['Uniswap V3', 'Aave V3', 'Curve Finance', 'GMX', 'Pendle Finance'],
    verification_document_url: '',
  },
];

type Step = 'idle' | 'creating' | 'locking' | 'submitting' | 'evaluating' | 'done' | 'error';

interface ProjectState {
  step: Step;
  projectId: string;
  error: string;
  log: string[];
}

const STEP_LABELS: Record<Step, string> = {
  idle: 'Ready',
  creating: 'create_project...',
  locking: 'lock_project_data...',
  submitting: 'submit_evaluation...',
  evaluating: 'run_evaluation (non-det: 2-5 min)...',
  done: 'Complete',
  error: 'Error',
};

const STEP_ORDER: Step[] = ['idle', 'creating', 'locking', 'submitting', 'evaluating', 'done'];

export default function AdminSeedPage() {
  const { address, isConnected } = useAccount();
  const [states, setStates] = useState<ProjectState[]>(
    SEED_PROJECTS.map(() => ({ step: 'idle', projectId: '', error: '', log: [] }))
  );
  const [running, setRunning] = useState(false);

  if (!isConnected) return <WalletGate message="Connect owner wallet to run seed." />;

  function update(i: number, patch: Partial<ProjectState>) {
    setStates((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addLog(i: number, msg: string) {
    setStates((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, log: [...s.log, msg] } : s))
    );
  }

  async function runProject(i: number) {
    if (!address) return;
    const project = SEED_PROJECTS[i];

    try {
      // ── create_project ──────────────────────────────────────────
      update(i, { step: 'creating', error: '', log: [] });
      addLog(i, `Starting ${project.name}...`);
      addLog(i, 'Calling create_project, approve in wallet...');

      const projectId = await contractCreateProject(address, project);
      update(i, { projectId });
      addLog(i, `✓ Project ID: ${projectId}`);

      // ── lock_project_data ───────────────────────────────────────
      update(i, { step: 'locking' });
      addLog(i, 'Calling lock_project_data, approve in wallet...');
      await contractLockProject(address, projectId);
      addLog(i, '✓ Project locked');

      // ── submit_evaluation ───────────────────────────────────────
      update(i, { step: 'submitting' });
      addLog(i, 'Calling submit_evaluation, approve in wallet...');
      await contractSubmitEvaluation(address, projectId);
      addLog(i, '✓ Evaluation submitted');

      // ── run_evaluation (NON-DET) ────────────────────────────────
      update(i, { step: 'evaluating' });
      addLog(i, 'Calling run_evaluation, this triggers:');
      addLog(i, '  • gl.nondet.web.get(): fetching live URLs');
      addLog(i, '  • gl.nondet.exec_prompt(): AI 7-factor scoring');
      addLog(i, '  • gl.vm.run_nondet_unsafe(): validator agreement');
      addLog(i, 'Approve in wallet, then wait 2-5 min for consensus...');
      const evalTx = await contractRunEvaluation(address, projectId);
      addLog(i, `✓ run_evaluation tx: ${evalTx}`);
      addLog(i, 'Validators are processing. Monitor GenLayer Studio or check back in 5 min.');

      // ── Sync to Supabase after a short delay ───────────────────
      addLog(i, 'Syncing to Supabase cache...');
      try {
        await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, wallet: address }),
        });
        addLog(i, '✓ Supabase sync triggered');
      } catch {
        addLog(i, '⚠ Supabase sync deferred (evaluation may still be processing)');
      }

      update(i, { step: 'done' });
      addLog(i, `✓ ${project.name} seeding complete`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      update(i, { step: 'error', error: msg });
      addLog(i, `✗ Error: ${msg}`);
    }
  }

  async function seedAll() {
    setRunning(true);
    for (let i = 0; i < SEED_PROJECTS.length; i++) {
      await runProject(i);
    }
    setRunning(false);
  }

  const allDone = states.every((s) => s.step === 'done');
  const anyError = states.some((s) => s.step === 'error');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: '#9b938a' }}>Admin / Seed</p>
        <h1 className="text-3xl font-semibold" style={{ color: '#1a1612' }}>GenLayer Non-Det Test Seed</h1>
        <p className="mt-2 text-sm leading-7" style={{ color: '#6b6360' }}>
          Registers 3 real crypto projects and runs the full on-chain evaluation flow. <br />
          <strong>run_evaluation</strong> triggers <code>gl.nondet.web.get()</code>, <code>gl.nondet.exec_prompt()</code>,
          and <code>gl.vm.run_nondet_unsafe()</code>: the core GenLayer non-det capabilities.
        </p>
      </div>

      {/* Info banner */}
      <div
        className="mb-8 rounded-2xl p-4 text-sm leading-relaxed"
        style={{ background: 'rgba(107,142,122,0.07)', border: '1px solid rgba(107,142,122,0.15)', color: '#4a6b5a' }}
      >
        <strong>Each project requires 4 wallet approvals:</strong> create → lock → submit_evaluation → run_evaluation.
        Evaluation (non-det) takes 2-5 min per project. Have MetaMask open and on GenLayer Studionet.
        Results appear in <a href="/registry" style={{ color: '#6b8e7a', textDecoration: 'underline' }}>/registry</a> and{' '}
        <a href="/signals" style={{ color: '#6b8e7a', textDecoration: 'underline' }}>/signals</a> once finalized.
      </div>

      {/* Seed all button */}
      <div className="mb-8 flex gap-3">
        <button
          onClick={seedAll}
          disabled={running || allDone}
          className="rounded-xl px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: '#6b8e7a', color: '#ffffff', boxShadow: '0 12px 24px rgba(107,142,122,0.20)' }}
        >
          {running ? 'Running...' : allDone ? 'All 3 seeded ✓' : 'Seed All 3 Projects'}
        </button>
        {anyError && (
          <button
            onClick={() => setStates(SEED_PROJECTS.map(() => ({ step: 'idle', projectId: '', error: '', log: [] })))}
            className="rounded-xl px-5 py-3 text-sm font-medium"
            style={{ color: '#9b938a', border: '1px solid rgba(107,142,122,0.15)', background: '#ffffff' }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Per-project cards */}
      <div className="flex flex-col gap-4">
        {SEED_PROJECTS.map((p, i) => {
          const s = states[i];
          const stepIdx = STEP_ORDER.indexOf(s.step);
          return (
            <div
              key={p.name}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold"
                    style={{
                      background: s.step === 'done' ? '#6b8e7a' : s.step === 'error' ? '#b8633f' : 'rgba(107,142,122,0.10)',
                      color: s.step === 'done' || s.step === 'error' ? '#ffffff' : '#6b8e7a',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1a1612' }}>{p.name}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9b938a' }}>{p.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.projectId && (
                    <a
                      href={`/dossier/${s.projectId}`}
                      className="text-xs font-mono"
                      style={{ color: '#6b8e7a' }}
                      target="_blank"
                    >
                      {s.projectId.slice(0, 12)}… →
                    </a>
                  )}
                  <span
                    className="text-[10px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-lg"
                    style={{
                      background:
                        s.step === 'done' ? 'rgba(107,142,122,0.12)' :
                        s.step === 'error' ? 'rgba(184,99,63,0.12)' :
                        s.step === 'idle' ? 'rgba(107,142,122,0.06)' :
                        'rgba(107,142,122,0.10)',
                      color:
                        s.step === 'done' ? '#6b8e7a' :
                        s.step === 'error' ? '#b8633f' :
                        s.step === 'idle' ? '#9b938a' : '#6b8e7a',
                    }}
                  >
                    {STEP_LABELS[s.step]}
                  </span>
                  {s.step !== 'idle' && s.step !== 'done' && s.step !== 'error' && (
                    <span
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 inline-block"
                      style={{ borderColor: 'rgba(107,142,122,0.2)', borderTopColor: '#6b8e7a' }}
                    />
                  )}
                  {s.step === 'idle' && !running && (
                    <button
                      onClick={() => runProject(i)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{ background: '#6b8e7a', color: '#ffffff' }}
                    >
                      Run
                    </button>
                  )}
                </div>
              </div>

              {/* Progress steps */}
              <div className="px-5 py-3 flex items-center gap-0">
                {STEP_ORDER.filter((st) => st !== 'idle').map((st, si) => (
                  <div key={st} className="flex items-center">
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          si < stepIdx - 1 ? '#6b8e7a' :
                          si === stepIdx - 1 && s.step !== 'error' ? '#6b8e7a' :
                          s.step === 'error' ? '#b8633f' : 'rgba(107,142,122,0.20)',
                      }}
                    />
                    {si < STEP_ORDER.length - 2 && (
                      <div
                        className="h-px w-8"
                        style={{ background: si < stepIdx - 1 ? '#6b8e7a' : 'rgba(107,142,122,0.15)' }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Log */}
              {s.log.length > 0 && (
                <div className="mx-5 mb-4 rounded-xl p-3 font-mono text-[11px] space-y-0.5 overflow-auto max-h-36"
                  style={{ background: 'rgba(107,142,122,0.04)', color: '#6b6360' }}>
                  {s.log.map((line, li) => (
                    <div key={li}>{line}</div>
                  ))}
                </div>
              )}

              {s.error && (
                <p className="mx-5 mb-4 text-xs" style={{ color: '#b8633f' }}>{s.error}</p>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-8 rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.12)' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: '#6b8e7a' }}>✓ All 3 projects seeded</p>
          <p className="text-xs mb-4" style={{ color: '#6b6360' }}>
            GenLayer validators are finalizing scores. Results appear in 2-5 minutes.
          </p>
          <div className="flex gap-3">
            <a href="/registry" className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: '#6b8e7a', color: '#ffffff' }}>
              View Registry →
            </a>
            <a href="/signals" className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: 'rgba(107,142,122,0.08)', color: '#6b8e7a' }}>
              Signals →
            </a>
            <a href="/leaderboard" className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: 'rgba(107,142,122,0.08)', color: '#6b8e7a' }}>
              Index →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
