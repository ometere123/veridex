#!/usr/bin/env node
/**
 * Veridex Fast Seed — Supabase Only (no GenLayer tx required)
 *
 * Seeds mock-but-realistic evaluation data directly into Supabase
 * for 3 well-known projects using the provided project IDs.
 * Use this to show the UI immediately; run seed-projects.mjs for the
 * real on-chain GenLayer non-det flow.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('  Run: node --env-file=.env.local scripts/seed-supabase.mjs');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Project IDs provided by user ─────────────────────────────────
// (These IDs were registered on an earlier contract version / Studio session)

const SEED_DATA = [
  {
    project_id: 'd94494a5e2fc489c843fff96e87c7035',   // truncated to 32-char format the current contract uses
    project_id_raw: '0xd94494a5e2fc489c843fff96e87c7035cf076294806ec8e3415f13eb36d16da9',
    owner: '0x0000000000000000000000000000000000000001',
    name: 'Uniswap V3',
    category: 'DeFi',
    website: 'https://uniswap.org',
    description:
      'Uniswap V3 is the leading decentralised exchange protocol on Ethereum, ' +
      'introducing concentrated liquidity that allows LPs to provide liquidity within ' +
      'custom price ranges, dramatically improving capital efficiency. ' +
      'Processes billions in daily volume across thousands of trading pairs.',
    status: 'ranked',
    overall_score: 91.5,
    tier: 'S',
    protocol_architecture_score: 95,
    team_governance_score: 90,
    market_traction_score: 96,
    security_risk_score: 89,
    delivery_proof_score: 92,
    token_design_score: 82,
    evidence_integrity_score: 88,
    confidence: 94,
    strengths: [
      'Concentrated liquidity is a major technical innovation adopted industry-wide',
      'Highest DEX volume globally — strong market traction signal',
      'Multiple Trail of Bits and ABDK audits with public reports',
      'Fully open-source — github.com/Uniswap/v3-core',
      'UNI governance DAO with billions in treasury',
    ],
    weaknesses: [
      'Complex liquidity management creates LP impermanent loss risk',
      'Protocol fee switch not yet activated — revenue model untested at scale',
    ],
    recommendations: [
      'Activate fee switch with DAO governance vote to demonstrate sustainable revenue',
      'Publish V4 security audit results before full launch',
    ],
    fact_check_summary:
      'uniswap.org is live and fully accessible. GitHub repos (Uniswap/v3-core, ' +
      'v3-periphery) are active with thousands of commits. Whitepaper PDF accessible ' +
      'at uniswap.org/whitepaper-v3.pdf. Trail of Bits audit confirmed in repository. ' +
      'Bug bounty program live at uniswap.org/bug-bounty. All major claims verified ' +
      'against live web evidence. Verification status: VERIFIED.',
    verification_score: 91,
    verified_source_count: 5,
  },
  {
    project_id: '33a7f7a9c13f613fd3a0fe36f3e381a2',
    project_id_raw: '0x33a7f7a9c13f613fd3a0fe36f3e381a234045df5c1f6d6d44027e5e79a02e7fe',
    owner: '0x0000000000000000000000000000000000000001',
    name: 'Aave V3',
    category: 'DeFi',
    website: 'https://aave.com',
    description:
      'Aave V3 is a decentralised, non-custodial liquidity protocol where users ' +
      'earn passive income as depositors and borrow against collateral. V3 introduces ' +
      'portals for cross-chain liquidity, high-efficiency E-mode, and isolation mode ' +
      'for new asset listings. The GHO stablecoin extends protocol revenue streams.',
    status: 'ranked',
    overall_score: 89.2,
    tier: 'A',
    protocol_architecture_score: 92,
    team_governance_score: 88,
    market_traction_score: 91,
    security_risk_score: 93,
    delivery_proof_score: 87,
    token_design_score: 78,
    evidence_integrity_score: 86,
    confidence: 92,
    strengths: [
      'Three independent audits from OpenZeppelin, Trail of Bits, and ABDK',
      'Largest lending protocol by TVL — verifiable market dominance',
      'Immunefi bug bounty program active with strong payout history',
      'GitHub fully public with active development cadence',
      'Cross-chain V3 deployment across 8+ networks proven live',
    ],
    weaknesses: [
      'GHO stablecoin peg stability untested in extreme market conditions',
      'Governance voter participation is below optimal for critical proposals',
    ],
    recommendations: [
      'Increase GHO collateral diversity to reduce peg concentration risk',
      'Implement governance incentives to raise participation above 10%',
    ],
    fact_check_summary:
      'aave.com accessible. docs.aave.com/hub/ fully reachable with comprehensive documentation. ' +
      'GitHub github.com/aave/aave-v3-core active — 500+ commits, MIT licensed. ' +
      'OpenZeppelin audit PDF confirmed in repository. Immunefi bug bounty live. ' +
      'Technical paper at github.com/aave/aave-v3-core/.../Aave_V3_Technical_Paper.pdf accessible. ' +
      'All major claims verified against live sources. Verification status: VERIFIED.',
    verification_score: 89,
    verified_source_count: 5,
  },
  {
    project_id: 'a5c739ef2596017762f55aa1d112047f',
    project_id_raw: '0xa5c739ef2596017762f55aa1d112047f51cc84a679b4ff53496be85f2d3f0576',
    owner: '0x0000000000000000000000000000000000000001',
    name: 'Arbitrum One',
    category: 'Infrastructure',
    website: 'https://arbitrum.io',
    description:
      'Arbitrum One is the leading Ethereum Layer 2 scaling solution using Optimistic ' +
      'Rollup technology by Offchain Labs. It achieves Ethereum-grade security while ' +
      'dramatically reducing gas costs and increasing throughput. Full EVM compatibility ' +
      'makes it the most widely deployed Ethereum L2 by TVL and developer ecosystem.',
    status: 'ranked',
    overall_score: 87.8,
    tier: 'A',
    protocol_architecture_score: 94,
    team_governance_score: 86,
    market_traction_score: 93,
    security_risk_score: 88,
    delivery_proof_score: 91,
    token_design_score: 72,
    evidence_integrity_score: 82,
    confidence: 90,
    strengths: [
      'Optimistic rollup architecture with proven fraud proof system (BOLD)',
      'Largest L2 by TVL — market traction extensively verifiable',
      'Nitro whitepaper accessible and technically substantive',
      'Full EVM equivalence — verified by thousands of deployed dApps',
      'Active GitHub with thousands of Nitro commits',
    ],
    weaknesses: [
      'ARB token utility limited primarily to governance — weak value capture',
      'Multi-sig Security Council retains upgrade keys — centralisation concern',
    ],
    recommendations: [
      'Progressive decentralisation of Security Council upgrade authority',
      'Expand ARB token utility beyond governance to capture protocol value',
    ],
    fact_check_summary:
      'arbitrum.io live and accessible. docs.arbitrum.io fully reachable with comprehensive Nitro docs. ' +
      'github.com/OffchainLabs/nitro active — thousands of commits, LGPL licensed. ' +
      'Trail of Bits and Sigma Prime audit PDFs confirmed in repository. ' +
      'Immunefi bug bounty live at immunefi.com/bug-bounty/arbitrum. ' +
      'All major L2 claims verified against live sources. Verification status: VERIFIED.',
    verification_score: 85,
    verified_source_count: 4,
  },
];

function makeEvalId(projectId) {
  return projectId.slice(0, 16) + 'eval' + Date.now().toString(36);
}

async function seed() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  Veridex Fast Seed — Supabase Direct                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  for (const p of SEED_DATA) {
    console.log(`\nSeeding: ${p.name}`);

    // Upsert project
    const { error: pErr } = await db.from('projects').upsert({
      project_id: p.project_id,
      owner: p.owner,
      name: p.name,
      category: p.category,
      website: p.website,
      description: p.description,
      status: p.status,
      created_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (pErr) console.error(`  ✗ project upsert: ${pErr.message}`);
    else console.log(`  ✓ project: ${p.project_id}`);

    // Upsert evaluation
    const evalId = makeEvalId(p.project_id);
    const { error: eErr } = await db.from('evaluations').upsert({
      evaluation_id: evalId,
      project_id: p.project_id,
      overall_score: p.overall_score,
      tier: p.tier,
      protocol_architecture_score: p.protocol_architecture_score,
      team_governance_score: p.team_governance_score,
      market_traction_score: p.market_traction_score,
      security_risk_score: p.security_risk_score,
      delivery_proof_score: p.delivery_proof_score,
      token_design_score: p.token_design_score,
      evidence_integrity_score: p.evidence_integrity_score,
      confidence: p.confidence,
      evaluated_at: new Date().toISOString(),
    });
    if (eErr) console.error(`  ✗ evaluation upsert: ${eErr.message}`);
    else console.log(`  ✓ evaluation: score=${p.overall_score} tier=${p.tier}`);

    // Upsert rankings
    const { error: rErr } = await db.from('rankings').upsert({
      project_id: p.project_id,
      project_name: p.name,
      category: p.category,
      overall_score: p.overall_score,
      tier: p.tier,
      overall_rank: SEED_DATA.indexOf(p) + 1,
      category_rank: 1,
      updated_at: new Date().toISOString(),
    });
    if (rErr) {
      // rankings table may not exist — non-fatal
      if (!rErr.message.includes('does not exist')) {
        console.warn(`  ⚠ rankings upsert: ${rErr.message}`);
      }
    } else {
      console.log(`  ✓ ranking: #${SEED_DATA.indexOf(p) + 1} overall`);
    }
  }

  console.log('\n✓ Fast seed complete!');
  console.log('\nNOTE: This seeded Supabase cache only. The IDs used are the 32-char');
  console.log('prefix of the provided hashes. If the actual on-chain IDs differ,');
  console.log('run seed-projects.mjs for the real GenLayer non-det flow.\n');

  console.log('Seeded project IDs (use in /project/<id> or hub lookup):');
  for (const p of SEED_DATA) {
    console.log(`  ${p.name.padEnd(16)} → ${p.project_id}`);
  }

  console.log('\nView at:');
  console.log('  https://the-veridex.vercel.app/tiers');
  console.log('  https://the-veridex.vercel.app/leaderboard');
  console.log('  https://the-veridex.vercel.app/analytics\n');
}

seed().catch((e) => {
  console.error('\n✗ Fatal:', e.message);
  process.exit(1);
});
