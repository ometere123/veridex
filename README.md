# Veridex

Decentralized crypto project verification platform powered by [GenLayer](https://genlayer.com) intelligent contracts. Veridex performs autonomous, web-verified assessments of blockchain projects - fetching live data, cross-referencing claims, and producing tamper-proof reputation scores anchored on-chain through validator consensus.

---

## Features

- **Web-verified claim validation** - intelligent contracts fetch live data from project websites, GitHub repos, and documentation to cross-reference submitted assertions
- **Multi-dimensional assessment** - seven evaluation dimensions scored independently with weighted aggregation and on-chain consensus
- **Admin-settable protocol fees** - contract owner can adjust registration, assessment, and reassessment fees in real-time on-chain
- **Validator consensus** - leader/validator architecture ensures score consistency within tolerance bounds
- **On-chain permanence** - finalized scores, reputation tiers, fact-check reports, and verification metadata are stored immutably in contract state
- **Injected wallet support** - direct contract interaction via GenLayer-compatible wallets through genlayer-js

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4
- **Blockchain:** GenLayer Intelligent Contracts (Python)
- **Database:** Supabase
- **Wallet:** genlayer-js + wagmi (injected provider)
- **Chain:** GenLayer Studionet (chain ID 61999)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_VERIDEX_CONTRACT_ADDRESS=0xd0aC5201aB874954933B09f497cAaFC618B596C6
NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET=veridex-evidence
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Intelligent Contract

The Veridex contract (`contracts/Veridex.py`) uses GenLayer's web access and LLM execution capabilities:

- `gl.nondet.web.get(url)` - fetches live web data for source verification
- `gl.nondet.exec_prompt(prompt)` - runs LLM-based assessment and fact-check analysis
- `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)` - ensures consensus between leader and validator nodes

### Admin Functions

**Set Protocol Fees** (admin only)
- `set_protocol_fees(create_project_fee, evaluation_fee, reevaluation_fee, fees_enabled)` - configure all protocol fees in wei and toggle fee collection

**Withdraw Protocol Fees** (admin only)
- `withdraw_protocol_fees()` - withdraw accumulated GEN from collected protocol fees

### Admin Dashboard

Access `/admin` (requires admin wallet: `0xb29Ead15B1E8A2420faE84de974088f67a15ccC2`) to:
- View current protocol fee configuration
- Update registration, assessment, and reassessment fees
- Toggle fee collection on/off in real-time
- Monitor treasury state

## Fee Structure

When fees are enabled by admin, users pay:
- **Registration Fee** - charged when creating a new project submission
- **Assessment Fee** - charged when submitting a project for initial evaluation
- **Reassessment Fee** - charged when requesting a reevaluation cycle

All fees are denominated in GEN (wei) and must be sent with the transaction. The contract validates exact fee amounts at submission time.

## Application Routes

**Public Routes**
- `/` - landing page
- `/leaderboard` (reputation index) - sortable project leaderboard
- `/rankings` (reputation tiers) - projects grouped by assessment tier
- `/compare` - side-by-side project comparison
- `/analytics` - historical trends and analytics
- `/profile/[wallet]` - public reputation profile

**Authenticated Routes** (require wallet connection)
- `/dashboard` (reputation hub) - user's submissions and assessment history
- `/submit` (register) - create new project
- `/history` - assessment timeline and past evaluations
- `/treasury` - protocol fee information

**Admin Routes** (admin wallet only)
- `/admin` - fee management interface
