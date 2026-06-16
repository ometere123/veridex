#!/usr/bin/env node
/**
 * Veridex Seed Script — Real Projects, GenLayer Non-Det Test
 *
 * Registers 3 well-known DeFi/Infra projects and runs the full on-chain
 * evaluation flow so the team can verify GenLayer non-det capabilities:
 *   create_project → lock_project_data → submit_evaluation → run_evaluation
 *
 * run_evaluation triggers:
 *   gl.nondet.web.get()    — fetches live URLs (website, docs, GitHub, audits)
 *   gl.nondet.exec_prompt() — AI scores each factor
 *   gl.vm.run_nondet_unsafe() — validators confirm leader within tolerance
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-projects.mjs
 *   node --env-file=.env.local scripts/seed-projects.mjs --wallet 0xYOUR_FUNDED_ADDRESS
 *
 * The wallet must have GEN on Studionet. Get some at:
 *   https://studio.genlayer.com (use the built-in faucet)
 */

import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { createClient as supabase } from '@supabase/supabase-js';

// ── Config ────────────────────────────────────────────────────────

const RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';
const CONTRACT = process.env.NEXT_PUBLIC_VERIDEX_CONTRACT_ADDRESS;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const walletArg = process.argv.find((a) => a.startsWith('--wallet='))?.split('=')[1]
  || process.argv[process.argv.indexOf('--wallet') + 1];

// Default: GenLayer Studionet funded test account (replace with your own)
const WALLET = walletArg || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

// ── Real project definitions ──────────────────────────────────────
// These URLs are live and publicly accessible so GenLayer web.get() can verify.

const PROJECTS = [
  {
    name: 'Uniswap V3',
    category: 'DeFi',
    website: 'https://uniswap.org',
    description:
      'Uniswap V3 is the leading decentralized exchange protocol on Ethereum, ' +
      'introducing concentrated liquidity positions that allow LPs to provide liquidity ' +
      'within custom price ranges, dramatically improving capital efficiency over V2. ' +
      'It processes billions in daily volume across thousands of trading pairs.',
    whitepaper_url: 'https://uniswap.org/whitepaper-v3.pdf',
    docs_url: 'https://docs.uniswap.org',
    github_repos: [
      { url: 'https://github.com/Uniswap/v3-core' },
      { url: 'https://github.com/Uniswap/v3-periphery' },
    ],
    roadmap:
      'Q1 2024: V4 hooks architecture launch. ' +
      'Q2 2024: Custom pools with singleton contract. ' +
      'Q3 2024: Cross-chain liquidity routing. ' +
      'Q4 2024: Native gas optimizations via transient storage.',
    tokenomics: {
      symbol: 'UNI',
      total_supply: '1,000,000,000',
      utility: 'Governance token. UNI holders vote on protocol parameters, fee switches, treasury allocation, and grant funding via Uniswap DAO.',
      emission_schedule: '60% to community treasury. 21.51% to team/future employees (4-year vest). 17.8% to investors (4-year vest). 0.069% to advisors.',
    },
    audits: [
      { firm: 'Trail of Bits', url: 'https://github.com/Uniswap/v3-core/blob/main/audits/tob/audit.pdf', audit_date: '2021-03-23' },
      { firm: 'ABDK Consulting', url: 'https://github.com/Uniswap/v3-core/blob/main/audits/abdk/audit.pdf', audit_date: '2021-03-23' },
    ],
    team: [
      { name: 'Hayden Adams', role: 'Founder & CEO', x: 'haydenzadams' },
      { name: 'Mary-Catherine Lader', role: 'COO', x: 'mclader' },
      { name: 'Dan Robinson', role: 'Research Partner (Paradigm)', linkedin: '' },
    ],
    investors: ['Paradigm', 'a16z', 'USV', 'Variant', 'Andreessen Horowitz'],
    partnerships: ['Coinbase', 'Polygon', 'Optimism', 'Arbitrum', 'Base'],
    bug_bounty_url: 'https://uniswap.org/bug-bounty',
    ecosystem_integrations: ['Metamask Swaps', '1inch', 'Matcha', 'Paraswap', 'Zapper', 'DeFi Saver'],
    verification_document_url: 'https://uniswap.org/whitepaper-v3.pdf',
  },
  {
    name: 'Aave V3',
    category: 'DeFi',
    website: 'https://aave.com',
    description:
      'Aave V3 is a decentralized, non-custodial liquidity protocol where users ' +
      'can participate as depositors or borrowers. Depositors provide liquidity to earn ' +
      'passive income, while borrowers can borrow in an overcollateralized (perpetually) ' +
      'or undercollateralized (one-block liquidity) fashion. V3 introduces portals for ' +
      'cross-chain liquidity and high efficiency mode (E-mode).',
    whitepaper_url: 'https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf',
    docs_url: 'https://docs.aave.com/hub/',
    github_repos: [
      { url: 'https://github.com/aave/aave-v3-core' },
      { url: 'https://github.com/aave/aave-v3-periphery' },
    ],
    roadmap:
      'Q1 2024: Aave V3.1 with Umbrella safety module. ' +
      'Q2 2024: GHO stablecoin expansion across L2s. ' +
      'Q3 2024: Native USDC integration via Circle CCTP. ' +
      'Q4 2024: Aave V3.2 with gasless transactions.',
    tokenomics: {
      symbol: 'AAVE',
      total_supply: '16,000,000',
      utility: 'AAVE is the governance token of the Aave DAO. It can be staked in the Safety Module to earn staking rewards while providing protocol backstop insurance. Stakers earn a portion of protocol fees.',
      emission_schedule: '13M circulating from migration. 3M in ecosystem reserve controlled by DAO governance for grants, incentives, and safety module bootstrapping.',
    },
    audits: [
      { firm: 'OpenZeppelin', url: 'https://github.com/aave/aave-v3-core/blob/master/audits/27-01-2022_OpenZeppelin_AaveV3.pdf', audit_date: '2022-01-27' },
      { firm: 'Trail of Bits', url: 'https://github.com/aave/aave-v3-core/blob/master/audits/07-01-2022_TrailOfBits_AaveV3.pdf', audit_date: '2022-01-07' },
      { firm: 'ABDK', url: 'https://github.com/aave/aave-v3-core/blob/master/audits/27-01-2022_ABDK_AaveV3.pdf', audit_date: '2022-01-27' },
    ],
    team: [
      { name: 'Stani Kulechov', role: 'Founder & CEO', x: 'StaniKulechov' },
      { name: 'Jordan Lazaro Gustave', role: 'COO', x: 'LazaroJordanG' },
      { name: 'Ernesto Boado', role: 'CTO', x: 'ernestbfj' },
    ],
    investors: ['Framework Ventures', 'Blockchain Capital', 'Three Arrows Capital', 'Blockchain.com Ventures'],
    partnerships: ['Polygon', 'Avalanche', 'Optimism', 'Arbitrum', 'Metis'],
    bug_bounty_url: 'https://immunefi.com/bug-bounty/aave',
    ecosystem_integrations: ['Yearn Finance', 'Idle Finance', 'DeFi Saver', 'Instadapp', 'Paraswap'],
    verification_document_url: '',
  },
  {
    name: 'Arbitrum One',
    category: 'Infrastructure',
    website: 'https://arbitrum.io',
    description:
      'Arbitrum One is a leading Layer 2 scaling solution for Ethereum using ' +
      'Optimistic Rollup technology developed by Offchain Labs. It achieves Ethereum-grade ' +
      'security while dramatically reducing gas fees and increasing throughput. ' +
      'The network processes millions of transactions with full EVM compatibility, ' +
      'making it the most widely adopted Ethereum L2 by TVL and developer activity.',
    whitepaper_url: 'https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf',
    docs_url: 'https://docs.arbitrum.io',
    github_repos: [
      { url: 'https://github.com/OffchainLabs/nitro' },
      { url: 'https://github.com/OffchainLabs/arbitrum-sdk' },
    ],
    roadmap:
      'Q1 2024: Stylus WASM smart contracts launch. ' +
      'Q2 2024: Bold (Bounded Liquidity Delay) fraud proof upgrade. ' +
      'Q3 2024: Orbit chains permissionless launch. ' +
      'Q4 2024: Timeboost transaction ordering mechanism.',
    tokenomics: {
      symbol: 'ARB',
      total_supply: '10,000,000,000',
      utility: 'ARB is the governance token of the Arbitrum DAO. Holders vote on protocol upgrades, treasury allocation, Security Council elections, and AIP (Arbitrum Improvement Proposals).',
      emission_schedule: '42.78% to DAO treasury. 26.94% to investors (4-year vest). 11.62% to individual wallets airdrop. 7.53% to DAOs in Arbitrum ecosystem. 11.13% to team/advisors (4-year vest).',
    },
    audits: [
      { firm: 'Trail of Bits', url: 'https://github.com/OffchainLabs/nitro/blob/master/audits/Trail_of_Bits.pdf', audit_date: '2022-12-01' },
      { firm: 'Sigma Prime', url: 'https://github.com/OffchainLabs/nitro/blob/master/audits/Sigma_Prime.pdf', audit_date: '2022-12-01' },
    ],
    team: [
      { name: 'Steven Goldfeder', role: 'Co-founder & CEO', x: 'sgoldfed' },
      { name: 'Ed Felten', role: 'Co-founder & Chief Scientist', x: 'EdFelten' },
      { name: 'Harry Kalodner', role: 'Co-founder & CTO', linkedin: '' },
    ],
    investors: ['Lightspeed Venture Partners', 'Pantera Capital', 'Polychain Capital', 'Ribbit Capital', 'Redpoint Ventures'],
    partnerships: ['Coinbase', 'Google Cloud', 'Uniswap', 'Aave', 'Curve', 'GMX', 'Radiant'],
    bug_bounty_url: 'https://immunefi.com/bug-bounty/arbitrum',
    ecosystem_integrations: ['Uniswap V3', 'Aave V3', 'Curve Finance', 'GMX', 'Radiant Capital', 'Pendle Finance'],
    verification_document_url: '',
  },
];

// ── GenLayer helpers ──────────────────────────────────────────────

function getClient() {
  return createClient({ chain: studionet, endpoint: RPC });
}

function getWriteClient() {
  if (!WALLET) throw new Error('No wallet address. Pass --wallet 0xYOUR_ADDRESS');
  return createClient({ chain: studionet, endpoint: RPC, account: WALLET });
}

async function readContract(method, args = []) {
  const client = getClient();
  return client.readContract({ address: CONTRACT, functionName: method, args });
}

async function writeContract(method, args, value = BigInt(0)) {
  const client = getWriteClient();
  const txHash = await client.writeContract({ address: CONTRACT, functionName: method, args, value });
  console.log(`  ↳ tx: ${txHash}`);
  return txHash;
}

async function waitForTx(txHash, label, timeoutMs = 240_000) {
  const client = getWriteClient();
  const start = Date.now();
  process.stdout.write(`  ⏳ Waiting for ${label}...`);
  while (Date.now() - start < timeoutMs) {
    try {
      const tx = await client.getTransaction({ hash: txHash });
      const status = tx?.status || tx?.transaction_status;
      if (status === 'FINALIZED' || status === 'finalized' || status === 5) {
        console.log(' ✓');
        return tx;
      }
      if (status === 'CANCELED' || status === 'canceled' || status === 'FAILED') {
        console.log(` ✗ (${status})`);
        return null;
      }
    } catch {}
    await sleep(4000);
    process.stdout.write('.');
  }
  console.log(' (timeout - tx still in flight)');
  return null;
}

async function decodeProjectId(txHash) {
  try {
    const res = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionByHash', params: [txHash] }),
    });
    const data = await res.json();
    const b64 = data?.result?.consensus_data?.leader_receipt?.[0]?.result;
    if (!b64) return null;
    const binary = Buffer.from(b64, 'base64');
    // Try various decode strategies
    const attempts = [
      () => binary.slice(1).toString('utf8'),
      () => binary.toString('utf8').replace(/[^\x20-\x7e]/g, '').trim(),
      () => binary.slice(3).toString('utf8'),
    ];
    for (const fn of attempts) {
      try {
        const s = fn();
        if (/^[0-9a-f]{16,64}$/.test(s)) return s;
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Supabase helpers ──────────────────────────────────────────────

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('  ⚠ Supabase env not set - skipping cache sync');
    return null;
  }
  return supabase(SUPABASE_URL, SUPABASE_KEY);
}

async function cacheProject(db, projectId, project) {
  if (!db) return;
  const { error } = await db.from('projects').upsert({
    project_id: projectId,
    owner: WALLET.toLowerCase(),
    name: project.name,
    category: project.category,
    website: project.website,
    description: project.description,
    status: 'ranked',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('  ⚠ Supabase project upsert:', error.message);
  else console.log('  ✓ Cached project in Supabase');
}

async function cacheEvaluation(db, projectId, evaluation) {
  if (!db || !evaluation) return;
  const { error } = await db.from('evaluations').upsert({
    evaluation_id: evaluation.evaluation_id,
    project_id: projectId,
    overall_score: evaluation.overall_score,
    tier: evaluation.tier,
    protocol_architecture_score: evaluation.protocol_architecture_score,
    team_governance_score: evaluation.team_governance_score,
    market_traction_score: evaluation.market_traction_score,
    security_risk_score: evaluation.security_risk_score,
    delivery_proof_score: evaluation.delivery_proof_score,
    token_design_score: evaluation.token_design_score,
    evidence_integrity_score: evaluation.evidence_integrity_score,
    confidence: evaluation.confidence ?? 85,
    evaluated_at: new Date().toISOString(),
  });
  if (error) console.warn('  ⚠ Supabase eval upsert:', error.message);
  else console.log(`  ✓ Cached evaluation: score=${evaluation.overall_score} tier=${evaluation.tier}`);
}

// ── Per-project flow ──────────────────────────────────────────────

async function seedProject(db, project, index) {
  const label = `[${index + 1}/3] ${project.name}`;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${label}`);
  console.log('─'.repeat(60));

  // ── Step 1: create_project ──────────────────────────────────────
  console.log('\n📝 Step 1: create_project');
  const args = [
    project.name,
    project.category,
    project.website,
    project.description,
    project.whitepaper_url || '',
    project.docs_url || '',
    JSON.stringify(project.github_repos),
    project.roadmap,
    JSON.stringify(project.tokenomics),
    JSON.stringify(project.audits.map(a => ({ url: a.url, firm: a.firm, audit_date: a.audit_date }))),
    JSON.stringify(project.team),
    JSON.stringify(project.investors),
    JSON.stringify(project.partnerships),
    project.bug_bounty_url || '',
    JSON.stringify(project.ecosystem_integrations),
    project.verification_document_url || '',
  ];

  let createTx;
  try {
    createTx = await writeContract('create_project', args);
  } catch (e) {
    console.error(`  ✗ create_project failed: ${e.message}`);
    return null;
  }

  const createResult = await waitForTx(createTx, 'project creation');
  let projectId = await decodeProjectId(createTx);

  if (!projectId) {
    console.log('  ⚠ Could not decode project ID from tx. Reading from contract...');
    await sleep(3000);
    // Try reading total count to confirm creation
    try {
      const count = await readContract('get_total_projects', []);
      console.log(`  ℹ Total projects on contract: ${count}`);
    } catch {}
    console.log('  ⚠ Skipping remaining steps for this project - check Studio for project ID');
    return null;
  }

  console.log(`  ✓ Project ID: ${projectId}`);

  // ── Step 2: lock_project_data ───────────────────────────────────
  await sleep(2000);
  console.log('\n🔒 Step 2: lock_project_data');
  let lockTx;
  try {
    lockTx = await writeContract('lock_project_data', [projectId]);
  } catch (e) {
    console.error(`  ✗ lock_project_data failed: ${e.message}`);
    return projectId;
  }
  await waitForTx(lockTx, 'lock');

  // ── Step 3: submit_evaluation ───────────────────────────────────
  await sleep(2000);
  console.log('\n📤 Step 3: submit_evaluation');
  let submitTx;
  try {
    submitTx = await writeContract('submit_evaluation', [projectId]);
  } catch (e) {
    console.error(`  ✗ submit_evaluation failed: ${e.message}`);
    return projectId;
  }
  await waitForTx(submitTx, 'submit');

  // ── Step 4: run_evaluation (NON-DET) ───────────────────────────
  await sleep(2000);
  console.log('\n🤖 Step 4: run_evaluation  ← GenLayer non-det');
  console.log('   This triggers:');
  console.log(`   • gl.nondet.web.get() on ${project.github_repos.length + 3} sources`);
  console.log('   • gl.nondet.exec_prompt() — AI 7-factor scoring');
  console.log('   • gl.vm.run_nondet_unsafe() — validator agreement check');

  let evalTx;
  try {
    evalTx = await writeContract('run_evaluation', [projectId]);
  } catch (e) {
    console.error(`  ✗ run_evaluation failed: ${e.message}`);
    return projectId;
  }

  console.log('  ⏳ run_evaluation runs validators in parallel — this takes 2-5 min...');
  const evalResult = await waitForTx(evalTx, 'evaluation', 360_000);

  // ── Step 5: Read result from contract ──────────────────────────
  await sleep(3000);
  console.log('\n📊 Step 5: Reading evaluation result from contract');
  let evaluation = null;
  try {
    const raw = await readContract('get_evaluation', [projectId]);
    if (raw && raw !== '{}') {
      evaluation = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw));
      console.log(`  ✓ Score: ${evaluation.overall_score}  Tier: ${evaluation.tier}`);
      console.log(`  ✓ Evidence integrity: ${evaluation.evidence_integrity_score}`);
      console.log(`  ✓ Verified sources: ${evaluation.verified_source_count ?? 'n/a'}`);
    } else {
      console.log('  ⚠ Evaluation not yet finalized on-chain (tx may still be processing)');
    }
  } catch (e) {
    console.warn('  ⚠ Could not read evaluation:', e.message);
  }

  // ── Step 6: Sync to Supabase ────────────────────────────────────
  console.log('\n💾 Step 6: Syncing to Supabase cache');
  await cacheProject(db, projectId, project);
  await cacheEvaluation(db, projectId, evaluation);

  return projectId;
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  Veridex Seed — GenLayer Non-Det Evaluation Test         ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  if (!CONTRACT) {
    console.error('\n✗ NEXT_PUBLIC_VERIDEX_CONTRACT_ADDRESS is not set.');
    console.error('  Run: node --env-file=.env.local scripts/seed-projects.mjs\n');
    process.exit(1);
  }

  console.log(`\nContract : ${CONTRACT}`);
  console.log(`RPC      : ${RPC}`);
  console.log(`Wallet   : ${WALLET}`);
  console.log(`Projects : ${PROJECTS.length}`);

  // Verify contract is reachable
  try {
    const total = await readContract('get_total_projects', []);
    console.log(`\n✓ Contract reachable — ${total} projects currently on-chain`);
  } catch (e) {
    console.error(`\n✗ Cannot reach contract: ${e.message}`);
    console.error('  Check NEXT_PUBLIC_VERIDEX_CONTRACT_ADDRESS and RPC URL');
    process.exit(1);
  }

  const db = getSupabase();
  const results = [];

  for (let i = 0; i < PROJECTS.length; i++) {
    const projectId = await seedProject(db, PROJECTS[i], i);
    results.push({ name: PROJECTS[i].name, projectId });
    if (i < PROJECTS.length - 1) await sleep(3000);
  }

  // ── Summary ────────────────────────────────────────────────────
  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  Seeding Complete                                         ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  for (const r of results) {
    const id = r.projectId ?? '(decode failed - check GenLayer Studio)';
    console.log(`  ${r.name.padEnd(22)} → ${id}`);
  }

  console.log('\nNext steps:');
  console.log('  1. Open https://the-veridex.vercel.app/tiers   — should show ranked projects');
  console.log('  2. Open https://the-veridex.vercel.app/analytics — scores and tier distribution');
  console.log('  3. If evaluations are still processing, wait 2-5 min then check again');
  console.log('  4. Check fact_check_summary on each project page for non-det evidence results\n');
}

main().catch((e) => {
  console.error('\n✗ Fatal:', e.message);
  process.exit(1);
});
