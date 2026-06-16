# Veridex

Veridex is an evidence-first verification registry for crypto projects. Projects submit public evidence, lock their evidence set on GenLayer, and receive a source-grounded verification dossier with fact-check results, verification levels, risk signals, and proof history.

Short version:

Evidence first. Verified on GenLayer. Rankings only after proof.

## Features

- **Verification dossiers** - each project creates a public dossier with issuer, evidence hash, verification level, evidence confidence, risk band, and status.
- **Evidence manifests** - websites, docs, whitepapers, GitHub repos, audits, team/governance data, tokenomics, bug bounty links, and uploaded evidence files are captured as the verification basis.
- **Source-grounded fact checks** - submitted claims are treated as untrusted until public sources support them.
- **Verification reports** - GenLayer stores verification dimensions, source integrity, proof completeness, missing evidence, recommendations, and critical warnings.
- **Proof ledger** - dossier creation, updates, evidence locks, verification submissions, fact checks, reports, fee events, and archives append auditable proof events.
- **Registry, not leaderboard-first** - users browse dossiers by verification level, evidence confidence, risk band, source count, and registry position.
- **Protocol fee transparency** - create-dossier, verification, and refresh fees are managed on-chain by the contract owner.

## Tech Stack

- **Frontend:** Next.js 15.5.19, React 19, TypeScript, Tailwind CSS v4
- **Contract:** GenLayer Intelligent Contract in Python
- **Wallet:** genlayer-js + wagmi
- **Storage helper:** Supabase for public evidence upload/cache only
- **Source of truth:** GenLayer contract state

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_VERIDEX_CONTRACT_ADDRESS=
NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET=veridex-evidence
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not add a hardcoded fallback contract address. The frontend reads `NEXT_PUBLIC_VERIDEX_CONTRACT_ADDRESS`.

## Contract

The active contract source is [contracts/Veridex.py](contracts/Veridex.py). Primary methods are dossier-first:

- Writes: `create_dossier`, `update_dossier_before_lock`, `lock_evidence`, `submit_verification`, `run_verification`, `request_verification_refresh`, `archive_dossier`, `update_registry`, `set_protocol_fees`, `withdraw_protocol_fees`
- Reads: `get_dossier`, `get_evidence_manifest`, `get_fact_check`, `get_verification_report`, `get_verification_history`, `get_proof_ledger`, `get_registry`, `get_issuer_profile`, `get_treasury_state`, `get_protocol_fees`, `get_verification_model`

Compatibility wrappers such as `create_project`, `get_project`, `get_evaluation`, and `get_leaderboard` remain in the contract for older clients, but the frontend uses the new dossier/registry naming.

## Routes

- `/` - evidence-first landing page
- `/submit` - create an evidence manifest and dossier
- `/registry` - public verification registry
- `/dossier/[dossierId]` - public dossier, report, manifest, and proof ledger
- `/issuer-hub` - issuer dashboard and dossier lookup
- `/verification-levels` - verification model explanation
- `/proof-ledger` - proof event lookup
- `/signals` - evidence, risk, category, and level signals
- `/compare` - compare verification dossiers
- `/treasury` - protocol fee transparency
- `/admin` - owner controls

Legacy routes redirect to the new surfaces.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```
