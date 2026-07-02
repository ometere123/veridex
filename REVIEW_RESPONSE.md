# Response to Review Feedback

## Summary

All six issues raised have been resolved. The fixes are live on the deployed app and committed to the repository. In addition, the verification engine itself was rebuilt during this cycle: the final verdict is now produced by GenLayer validators fetching the submitted sources live and an LLM evaluating the claims against the fetched content, instead of the earlier deterministic field-completeness scoring. Below is a precise account of each issue.

---

## 1. "Uploading of document gives fetch failed error" - Fixed

Root cause: the upload proxied file bytes through a Vercel serverless function, which enforces a ~4.5 MB request body limit. Larger PDFs failed with a generic `fetch failed`.

The upload now uses a signed-URL flow:

1. The browser sends only the filename to `/api/upload`
2. The server (service role) issues a Supabase signed upload URL and token
3. The browser uploads the file directly to Supabase storage via `uploadToSignedUrl` - the file never passes through Vercel

A 20 MB client-side size check was added. Proof this works end-to-end: the uploaded evidence PDF's public URL is stored in the on-chain evidence manifest, and during verification the GenLayer validators fetched and read that PDF as one of the sources.

Commit: `e1ad2b9`

---

## 2. "The dropdown menu background hides the texts" - Fixed

Native `<select>`/`<option>` elements render with the OS default (white) background, making light text invisible on the dark theme. Fixed in global CSS:

```css
:root { color-scheme: dark; }
select, select option { background-color: #0b1712; color: var(--foreground); }
```

Commit: `e1ad2b9`

---

## 3. "The dapp creates a dossier and doesn't evaluate it or put a section where it can be evaluated" - Fixed

The dossier detail page (`/dossier/[dossierId]`) now contains the full evaluation flow:

- **Evidence Lock panel** - the issuer locks the evidence manifest (`lock_evidence`), producing an immutable on-chain evidence hash
- **GenLayer Verification panel** - the issuer submits (`submit_verification`) and runs (`run_verification`) the verification cycle, with stage indicators (signing → submitted → validating → finalising → completed), on-chain polling, and resume-after-refresh support for the multi-minute consensus window
- A **Request Verification Refresh** action for completed dossiers

The full cycle create → lock → submit → run has been executed on the live app and the resulting report (AI verdict, confidence, dimensions, material findings, risk band) renders on the dossier page.

Commits: `e1ad2b9`, `b73571e`

---

## 4. "The registry doesn't show created dossiers" - Fixed

Root cause was issue 3: the contract only writes registry entries inside `run_verification`, and verification could not be triggered from the UI, so the registry stayed empty forever. With the verification flow in place, completed dossiers now appear in `/registry` with verification level, evidence confidence, risk band, and source count. Confirmed live: the test dossier appears in the registry after its verification cycle completed.

Commits: `e1ad2b9`, `b73571e`

---

## 5. "Registry and dossiers have the same function in the page" - Fixed

`/dossiers` was a bare redirect to `/registry`, so both nav items opened the identical page. They are now two distinct surfaces:

- **`/registry`** - only dossiers that completed a GenLayer verification cycle, ranked by risk band and evidence confidence
- **`/dossiers`** - every dossier in any lifecycle stage (DRAFT, EVIDENCE_LOCKED, VERIFYING, VERIFIED, PARTIAL, ...), with live on-chain status per card, search by name or dossier ID, and status/category filters

Each page states its scope and cross-links to the other.

Commit: `161ea1c`

---

## 6. "Proof ledger requires dossier ID which the dapp doesn't display after creating a dossier" - Fixed

- A copyable **Dossier ID banner** sits at the top of every dossier page
- After creation, the app routes directly to the new dossier's page where the ID is visible
- The dossier page embeds its own **Proof Ledger Timeline**, so the ledger is visible without re-entering the ID anywhere
- A persistent **Transaction History** panel lists every write transaction (create, lock, submit, run, refresh) with GenLayer explorer links

Commits: `e1ad2b9`, `b73571e`, `63cff7a`

---

## 7. Verification Engine Rebuilt During This Cycle

Beyond the review items, the scoring model itself was replaced. The earlier contract scored field completeness deterministically - filled URLs counted toward the score without being fetched. That logic is now demoted to a transparency-only readiness pre-check, and the verdict is produced as follows:

**Step 1 - Live source fetching under strict equivalence**

Every validator independently fetches up to 6 submitted source URLs inside a non-deterministic block:

- `gl.nondet.web.render(url, mode="text")` for readable rendered page text (handles JS-rendered sites)
- Fallback to `gl.nondet.web.get()` with HTML stripped for PDFs and plain files
- `gl.eq_principle.strict_eq` requires all validators to agree on the fetched content
- Unreachable URLs are recorded as `reachable: false` - they are flagged, never silently scored as valid

**Step 2 - LLM claim evaluation under non-comparative equivalence**

`gl.eq_principle.prompt_non_comparative` runs an LLM over the fetched content versus the submitted claims, with explicit acceptance criteria. The model must return strict canonical JSON:

```json
{
  "schema": "veridex_verification_v1",
  "verdict": "VERIFIED | PARTIALLY_VERIFIED | UNVERIFIABLE | CONFLICTING_EVIDENCE | REJECTED",
  "confidence": 0,
  "protocol_architecture": 0, "team_governance": 0, "market_traction": 0,
  "security_risk": 0, "delivery_proof": 0, "token_design": 0, "evidence_integrity": 0,
  "sources_checked": 0, "sources_failed": 0,
  "material_findings": [
    { "claim": "", "status": "SUPPORTED | PARTIAL | CONTRADICTED | UNVERIFIABLE", "source_url": "", "reason": "" }
  ],
  "risk_flags": [],
  "short_reason": ""
}
```

The prompt forbids inventing information: claims not present in the fetched content must be UNVERIFIABLE, and CONTRADICTED is reserved for explicit contradictions. Fake or nonsense URLs can no longer produce a VERIFIED verdict just because form fields were filled.

**Step 3 - Consensus verdict stored on-chain**

The parsed verdict is clamped, enum-validated, and stored as the verification report. A malformed AI response degrades to an `UNVERIFIABLE` verdict with an `AI_PARSE_ERROR` flag rather than reverting. Risk bands weight soft flags (`*_NOT_CONFIRMED`, `*_PARTIAL`) at half the weight of hard flags (contradictions, unreachable sources, unverifiable identity).

Verified live: the run_verification transaction's equivalence outputs on the explorer show the fetched page text per source and the AI's JSON verdict, and the resulting report correctly declined to confirm claims (team, investors, partnerships) that do not appear in the submitted sources.

Commits: `b73571e`, `3d3e079`, `616f671`, `1000e0a`, `555b586`

---

## Live Contract

- Network: GenLayer Studionet (chainId 61999)
- Contract: `0xA937bAcEf400a85F24AF0f048545412B49Fdf1dF`
- Explorer: https://explorer-studio.genlayer.com
- App: https://the-veridex.vercel.app
