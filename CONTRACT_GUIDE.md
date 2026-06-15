# Veridex - Contract Interaction Guide

Contract: `contracts/Veridex.py`
Network: GenLayer Testnet

---

## Write Methods

### `create_project()`

Creates a new project. Status starts as `draft`.

**Args:**
- `name: str` - Project name
- `category: str` - One of: DeFi, AI, Gaming, Infrastructure, RWA, DePIN, Consumer, Other
- `website: str`
- `description: str`
- `whitepaper_url: str`
- `docs_url: str`
- `github_repos: str` - JSON array string
- `roadmap: str`
- `tokenomics: str` - JSON object string `{utility, emissions, supply}`
- `audits: str` - JSON array string `[{auditor, url, date}]`
- `team: str` - JSON array string `[{name, role, linkedin}]`
- `investors: str` - JSON array string
- `partnerships: str` - JSON array string
- `bug_bounty_url: str`
- `ecosystem_integrations: str` - JSON array string

**Returns:** `project_id: str`

---

### `update_project_before_lock()`

Updates project data. Only callable when `status == "draft"`.

**Args:** Same as `create_project()` plus `project_id: str`

---

### `lock_project_data(project_id: str)`

Locks all evidence. Generates `evidence_hash`. Status -> `evaluation_locked`.

**Returns:** `evidence_hash: str`

**Forbidden after:** No edits allowed. Evidence is immutable.

---

### `submit_evaluation(project_id: str)`

Signals evaluation start. Status -> `evaluating`.

**Requires:** `status == "evaluation_locked"`

---

### `run_evaluation(project_id: str)`

Runs all 5 AI evaluation agents via `gl.eq_principle.prompt_non_comparative()`.
Validators reach consensus. Stores evaluation on-chain.

**Agents:**
1. `_evaluate_technical_quality()` - 25% weight
2. `_evaluate_team_quality()` - 20% weight
3. `_evaluate_market_fit()` - 20% weight
4. `_evaluate_security()` - 15% weight
5. `_evaluate_token_utility()` - 10% weight
6. `_evaluate_execution()` - 10% weight

**Returns:** `evaluation_id: str`

---

### `finalize_score(project_id: str)`

Finalizes evaluation, assigns tier, updates leaderboard. Status -> `ranked`.

**Tier Assignment:**
- S+ = 95-100
- S = 90-94
- A = 80-89
- B = 70-79
- C = 60-69
- D = 50-59
- F = 0-49

---

### `request_reevaluation(project_id: str)`

Requests a new evaluation cycle. Status -> `reevaluation_pending`.

**Requires:** `status == "ranked"`

---

### `update_leaderboard(category: str)`

Updates category leaderboard from current on-chain state.

---

### `archive_project(project_id: str)`

Archives a project. Status -> `archived`.

**Forbidden:** Cannot evaluate archived projects.

---

### `withdraw_protocol_fees()`

Withdraws collected protocol fees. Only callable by contract owner.

---

## Read Methods

### `get_project(project_id: str) → str`

Returns full project JSON.

**Sample response:**
```json
{
  "project_id": "abc123",
  "owner": "0x...",
  "name": "Protocol Name",
  "category": "DeFi",
  "status": "ranked",
  "evidence_hash": "0x...",
  "locked_at": "1234567890"
}
```

---

### `get_evaluation(project_id: str) → str`

Returns latest evaluation JSON.

**Sample response:**
```json
{
  "evaluation_id": "eval123",
  "project_id": "abc123",
  "technical_score": 85,
  "team_score": 78,
  "market_fit_score": 82,
  "security_score": 90,
  "execution_score": 75,
  "token_utility_score": 70,
  "overall_score": 81.5,
  "tier": "A",
  "confidence": 85,
  "strengths": ["..."],
```
  "recommendations": ["..."]
}
```

---

### `get_ranking(project_id: str) → str`

Returns current ranking position.

---

### `get_leaderboard(category: str) → str`

Returns ranked list for a category.

**Categories:** `overall`, `defi`, `ai`, `gaming`, `infrastructure`, `rwa`, `depin`, `consumer`

---

### `get_profile(wallet: str) → str`

Returns wallet's reputation profile.

---

### `get_historical_scores(project_id: str) → str`

Returns append-only list of all evaluations.

**Never overwrites. Append-only.**

---

### `get_total_projects() → u256`
### `get_total_evaluations() → u256`
### `get_treasury_state() → str`

---

## State Machine

```
draft
  ↓ lock_project_data()
evaluation_locked
  ↓ submit_evaluation()
evaluating
  ↓ run_evaluation() + finalize_score()
ranked
  ↓ request_reevaluation()
reevaluation_pending → (back to evaluating)
  ↓ archive_project()
archived
```

**Forbidden transitions:**
- `evaluation_locked` → edit evidence
- `ranked` → modify evidence
- `archived` → evaluate

---

## GenLayer Evaluation Pattern

All 5 evaluation agents use `gl.eq_principle.prompt_non_comparative()`:

```python
result = gl.eq_principle.prompt_non_comparative(
    prompt,
    lambda output: self._validate_score_output(output)
)
```

The validator function ensures the output is valid JSON with a `score` field in [0, 100].

This guarantees:
- AI evaluation happens on-chain via GenLayer validators
- Multiple validators reach consensus using the Equivalence Principle
- No backend route can fake or substitute evaluation results
- Scores are immutable once finalized

---

## Evidence Locking

Evidence hash is computed as:
```python
hashlib.sha256(json.dumps(project_data, sort_keys=True).encode()).hexdigest()
```

Once locked:
- `status` = `evaluation_locked`
- `evidence_hash` is stored permanently
- `locked_at` timestamp is recorded
- All whitepaper, docs, GitHub, roadmap, tokenomics, audit data is frozen
