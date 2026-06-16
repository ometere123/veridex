# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import hashlib


@gl.evm.contract_interface
class _FeeRecipient:
    class View:
        pass

    class Write:
        pass


class Veridex(gl.Contract):
    owner: str
    project_count: u256
    evaluation_count: u256

    projects: TreeMap[str, str]
    evaluations: TreeMap[str, str]
    evaluation_history: TreeMap[str, str]
    rankings: TreeMap[str, str]
    historical_scores: TreeMap[str, str]
    leaderboard: TreeMap[str, str]
    profiles: TreeMap[str, str]
    fact_checks: TreeMap[str, str]

    treasury: u256
    create_project_fee: u256
    evaluation_fee: u256
    reevaluation_fee: u256
    fees_enabled: bool

    def __init__(self) -> None:
        self.owner = str(gl.message.sender_address)
        self.project_count = u256(0)
        self.evaluation_count = u256(0)
        self.treasury = u256(0)
        self.create_project_fee = u256(0)
        self.evaluation_fee = u256(0)
        self.reevaluation_fee = u256(0)
        self.fees_enabled = False

    # ──────────────────────────────────────────
    # Write Functions
   

    @gl.public.write.payable
    def create_project(
        self,
        name: str,
        category: str,
        website: str,
        description: str,
        whitepaper_url: str,
        docs_url: str,
        github_repos: str,
        roadmap: str,
        tokenomics: str,
        audits: str,
        team: str,
        investors: str,
        partnerships: str,
        bug_bounty_url: str,
        ecosystem_integrations: str,
        verification_document_url: str = "",
    ) -> str:
        sender = str(gl.message.sender_address)
        self._collect_exact_fee(self.create_project_fee, "project_creation")
        project_id = self._generate_project_id(sender, name)
        now = str(self._now())

        project = {
            "project_id": project_id,
            "owner": sender,
            "name": self._clean_text(name, 120),
            "category": self._clean_text(category, 80),
            "website": self._clean_text(website, 300),
            "description": self._clean_text(description, 1500),
            "whitepaper_url": self._clean_text(whitepaper_url, 300),
            "docs_url": self._clean_text(docs_url, 300),
            "verification_document_url": self._clean_text(verification_document_url, 500),
            "github_repos": self._safe_json_array(github_repos),
            "roadmap": self._clean_text(roadmap, 2000),
            "tokenomics": self._safe_json_object(tokenomics),
            "audits": self._safe_json_array(audits),
            "team": self._safe_json_array(team),
            "investors": self._safe_json_array(investors),
            "partnerships": self._safe_json_array(partnerships),
            "bug_bounty_url": self._clean_text(bug_bounty_url, 300),
            "ecosystem_integrations": self._safe_json_array(ecosystem_integrations),
            "evidence_hash": "",
            "fact_check_hash": "",
            "fact_checked_at": "",
            "verification_score": 0,
            "verification_status": "unverified",
            "verified_source_count": 0,
            "evidence_integrity_score": 0,
            "score_model_version": "VERIDEX_7_FACTOR_V1",
            "locked_at": "",
            "status": "draft",
            "created_at": now,
            "updated_at": now,
        }

        self.projects[project_id] = json.dumps(project)
        self.project_count = u256(int(self.project_count) + 1)

        self._init_profile(sender)
        self._increment_profile_project_count(sender)

        return project_id

    @gl.public.write
    def update_project_before_lock(
        self,
        project_id: str,
        name: str,
        category: str,
        website: str,
        description: str,
        whitepaper_url: str,
        docs_url: str,
        github_repos: str,
        roadmap: str,
        tokenomics: str,
        audits: str,
        team: str,
        investors: str,
        partnerships: str,
        bug_bounty_url: str,
        ecosystem_integrations: str,
    ) -> None:
        sender = str(gl.message.sender_address)
        project = self._load_project(project_id)

        assert project["owner"] == sender, "Not project owner"
        assert project["status"] == "draft", "Project is locked"

        project["name"] = self._clean_text(name, 120)
        project["category"] = self._clean_text(category, 80)
        project["website"] = self._clean_text(website, 300)
        project["description"] = self._clean_text(description, 1500)
        project["whitepaper_url"] = self._clean_text(whitepaper_url, 300)
        project["docs_url"] = self._clean_text(docs_url, 300)
        project["github_repos"] = self._safe_json_array(github_repos)
        project["roadmap"] = self._clean_text(roadmap, 2000)
        project["tokenomics"] = self._safe_json_object(tokenomics)
        project["audits"] = self._safe_json_array(audits)
        project["team"] = self._safe_json_array(team)
        project["investors"] = self._safe_json_array(investors)
        project["partnerships"] = self._safe_json_array(partnerships)
        project["bug_bounty_url"] = self._clean_text(bug_bounty_url, 300)
        project["ecosystem_integrations"] = self._safe_json_array(ecosystem_integrations)
        project["fact_check_hash"] = ""
        project["fact_checked_at"] = ""
        project["verification_score"] = 0
        project["verification_status"] = "unverified"
        project["verified_source_count"] = 0
        project["evidence_integrity_score"] = 0
        project["score_model_version"] = "VERIDEX_7_FACTOR_V1"
        project["updated_at"] = str(self._now())

        self.projects[project_id] = json.dumps(project)

    @gl.public.write
    def lock_project_data(self, project_id: str) -> str:
        sender = str(gl.message.sender_address)
        project = self._load_project(project_id)

        assert project["owner"] == sender, "Not project owner"
        assert project["status"] == "draft", "Project already locked"

        evidence_hash = self._generate_evidence_hash(project)
        now = str(self._now())

        project["evidence_hash"] = evidence_hash
        project["locked_at"] = now
        project["status"] = "evaluation_locked"
        project["updated_at"] = now

        self.projects[project_id] = json.dumps(project)

        return evidence_hash

    @gl.public.write.payable
    def submit_evaluation(self, project_id: str) -> None:
        sender = str(gl.message.sender_address)
        project = self._load_project(project_id)

        assert project["owner"] == sender, "Not project owner"
        assert project["status"] in ["evaluation_locked", "reevaluation_pending"], "Project must be locked first"

        if project["status"] == "reevaluation_pending":
            self._collect_exact_fee(self.reevaluation_fee, "reevaluation")
        else:
            self._collect_exact_fee(self.evaluation_fee, "evaluation")

        project["status"] = "evaluating"
        project["updated_at"] = str(self._now())

        self.projects[project_id] = json.dumps(project)

    @gl.public.write
    def run_evaluation(self, project_id: str) -> str:
        project = self._load_project(project_id)

        assert project["status"] == "evaluating", "Project not in evaluating state"

        fact_check = self._run_fact_check(project)
        fact_check_hash = self._generate_evidence_hash(fact_check)
        fact_check["fact_check_hash"] = fact_check_hash
        fact_check["project_id"] = project_id
        fact_check["checked_at"] = str(self._now())

        scores = self._evaluate_all_scores(project, fact_check)

        protocol_architecture_score = self._bounded_score(scores.get("protocol_architecture_score", 50))
        team_governance_score = self._bounded_score(scores.get("team_governance_score", 50))
        market_traction_score = self._bounded_score(scores.get("market_traction_score", 50))
        security_risk_score = self._bounded_score(scores.get("security_risk_score", 50))
        delivery_proof_score = self._bounded_score(scores.get("delivery_proof_score", 50))
        token_design_score = self._bounded_score(scores.get("token_design_score", 50))
        evidence_integrity_score = self._bounded_score(scores.get(
            "evidence_integrity_score",
            fact_check.get("verification_score", 50),
        ))

        overall_score = self._calculate_final_score(
            protocol_architecture_score,
            team_governance_score,
            market_traction_score,
            security_risk_score,
            delivery_proof_score,
            token_design_score,
            evidence_integrity_score,
        )

        tier = self._assign_rank_tier(overall_score)
        now = str(self._now())
        evaluation_id = self._generate_evaluation_id(project_id, now)

        evaluation = {
            "evaluation_id": evaluation_id,
            "project_id": project_id,
            "protocol_architecture_score": protocol_architecture_score,
            "team_governance_score": team_governance_score,
            "market_traction_score": market_traction_score,
            "security_risk_score": security_risk_score,
            "delivery_proof_score": delivery_proof_score,
            "token_design_score": token_design_score,
            "evidence_integrity_score": evidence_integrity_score,
            "overall_score": overall_score,
            "score_model_version": "VERIDEX_7_FACTOR_V1",
            "tier": tier,
            "verification_score": self._bounded_score(fact_check.get("verification_score", 0)),
            "verification_status": self._clean_text(str(fact_check.get("verification_status", "unverified")), 40),
            "verified_source_count": int(fact_check.get("verified_source_count", 0)),
            "fact_check_hash": fact_check_hash,
            "fact_check_summary": self._clean_text(str(fact_check.get("summary", "")), 500),
            "confidence": self._bounded_score(scores.get("confidence", 85)),
            "strengths": self._safe_list(scores.get("strengths", []), self._extract_strengths(
                project,
                protocol_architecture_score,
                team_governance_score,
                market_traction_score,
                security_risk_score,
                evidence_integrity_score,
            )),
            "weaknesses": self._safe_list(scores.get("weaknesses", []), self._extract_weaknesses(
                project,
                protocol_architecture_score,
                team_governance_score,
                market_traction_score,
                security_risk_score,
                evidence_integrity_score,
            )),
            "recommendations": self._safe_list(scores.get("recommendations", []), self._generate_recommendations(project, overall_score)),
            "evaluation_hash": self._generate_evidence_hash({
                "project_id": project_id,
                "overall_score": overall_score,
                "tier": tier,
                "fact_check_hash": fact_check_hash,
                "timestamp": now,
            }),
            "evaluated_at": now,
        }

        self.fact_checks[project_id] = json.dumps(fact_check)
        self.evaluations[project_id] = json.dumps(evaluation)
        self.evaluation_count = u256(int(self.evaluation_count) + 1)

        self._append_evaluation_history(project_id, evaluation)
        self._update_historical_scores(project_id, overall_score, tier, evaluation_id)
        self._update_project_reputation(
            project["owner"],
            overall_score,
            security_risk_score,
            delivery_proof_score,
            evidence_integrity_score,
        )

        project["status"] = "ranked"
        project["fact_check_hash"] = fact_check_hash
        project["fact_checked_at"] = fact_check.get("checked_at", now)
        project["verification_score"] = self._bounded_score(fact_check.get("verification_score", 0))
        project["verification_status"] = self._clean_text(str(fact_check.get("verification_status", "unverified")), 40)
        project["verified_source_count"] = int(fact_check.get("verified_source_count", 0))
        project["evidence_integrity_score"] = evidence_integrity_score
        project["score_model_version"] = "VERIDEX_7_FACTOR_V1"
        project["updated_at"] = now
        self.projects[project_id] = json.dumps(project)

        self._update_leaderboard_internal(project, evaluation)

        return evaluation_id

    @gl.public.write
    def finalize_score(self, project_id: str) -> None:
        project = self._load_project(project_id)

        evaluation_raw = self.evaluations.get(project_id)
        assert evaluation_raw is not None, "No evaluation found"

        evaluation = json.loads(evaluation_raw)

        project["status"] = "ranked"
        project["updated_at"] = str(self._now())

        self.projects[project_id] = json.dumps(project)

        self._update_leaderboard_internal(project, evaluation)

    @gl.public.write
    def request_reevaluation(self, project_id: str) -> None:
        sender = str(gl.message.sender_address)
        project = self._load_project(project_id)

        assert project["owner"] == sender, "Not project owner"
        assert project["status"] == "ranked", "Project must be ranked first"

        project["status"] = "reevaluation_pending"
        project["updated_at"] = str(self._now())

        self.projects[project_id] = json.dumps(project)

    @gl.public.write
    def update_leaderboard(self, category: str) -> None:
        board_key = category.lower()
        board_raw = self.leaderboard.get(board_key)

        if board_raw is None:
            self.leaderboard[board_key] = "[]"
            return

        board = json.loads(board_raw)
        board.sort(key=lambda x: x.get("overall_score", 0), reverse=True)

        for i, entry in enumerate(board):
            entry["rank"] = i + 1

        self.leaderboard[board_key] = json.dumps(board)

    @gl.public.write
    def archive_project(self, project_id: str) -> None:
        sender = str(gl.message.sender_address)
        project = self._load_project(project_id)

        assert project["owner"] == sender or sender == self.owner, "Not authorized"
        assert project["status"] != "evaluating", "Cannot archive during evaluation"

        project["status"] = "archived"
        project["updated_at"] = str(self._now())

        self.projects[project_id] = json.dumps(project)

    @gl.public.write
    def set_protocol_fees(
        self,
        create_project_fee: u256,
        evaluation_fee: u256,
        reevaluation_fee: u256,
        fees_enabled: bool,
    ) -> None:
        sender = str(gl.message.sender_address)

        assert sender == self.owner, "Only owner can set fees"

        self.create_project_fee = create_project_fee
        self.evaluation_fee = evaluation_fee
        self.reevaluation_fee = reevaluation_fee
        self.fees_enabled = fees_enabled

    @gl.public.write
    def withdraw_protocol_fees(self) -> None:
        sender = str(gl.message.sender_address)

        assert sender == self.owner, "Only owner can withdraw"
        assert int(self.treasury) > 0, "No fees to withdraw"

        amount = self.treasury
        self.treasury = u256(0)

        _FeeRecipient(Address(self.owner)).emit_transfer(value=amount)

    # ──────────────────────────────────────────
    # View Functions
    # ──────────────────────────────────────────

    @gl.public.view
    def get_project(self, project_id: str) -> str:
        data = self.projects.get(project_id)
        if data is None:
            return "{}"
        return data

    @gl.public.view
    def get_evaluation(self, project_id: str) -> str:
        data = self.evaluations.get(project_id)
        if data is None:
            return "{}"
        return data

    @gl.public.view
    def get_fact_check(self, project_id: str) -> str:
        data = self.fact_checks.get(project_id)
        if data is None:
            return "{}"
        return data

    @gl.public.view
    def get_evaluation_history(self, project_id: str) -> str:
        data = self.evaluation_history.get(project_id)
        if data is None:
            return "[]"
        return data

    @gl.public.view
    def get_ranking(self, project_id: str) -> str:
        data = self.rankings.get(project_id)
        if data is None:
            return "{}"
        return data

    @gl.public.view
    def get_leaderboard(self, category: str) -> str:
        key = category.lower()
        data = self.leaderboard.get(key)
        if data is None:
            return "[]"
        return data

    @gl.public.view
    def get_profile(self, wallet: str) -> str:
        data = self.profiles.get(wallet)
        if data is None:
            return "{}"
        return data

    @gl.public.view
    def get_historical_scores(self, project_id: str) -> str:
        data = self.historical_scores.get(project_id)
        if data is None:
            return "[]"
        return data

    @gl.public.view
    def get_total_projects(self) -> u256:
        return self.project_count

    @gl.public.view
    def get_total_evaluations(self) -> u256:
        return self.evaluation_count

    @gl.public.view
    def get_treasury_state(self) -> str:
        return json.dumps({
            "total_fees_collected": int(self.treasury),
            "contract_balance": int(self.balance),
            "owner": self.owner,
            "fees_enabled": self.fees_enabled,
            "create_project_fee": int(self.create_project_fee),
            "evaluation_fee": int(self.evaluation_fee),
            "reevaluation_fee": int(self.reevaluation_fee),
        })

    @gl.public.view
    def get_protocol_fees(self) -> str:
        return json.dumps({
            "fees_enabled": self.fees_enabled,
            "create_project_fee": int(self.create_project_fee),
            "evaluation_fee": int(self.evaluation_fee),
            "reevaluation_fee": int(self.reevaluation_fee),
        })

    @gl.public.view
    def get_score_model(self) -> str:
        return json.dumps({
            "version": "VERIDEX_7_FACTOR_V1",
            "total_weight": 100,
            "factors": [
                {"key": "protocol_architecture_score", "weight": 20},
                {"key": "team_governance_score", "weight": 15},
                {"key": "market_traction_score", "weight": 15},
                {"key": "security_risk_score", "weight": 15},
                {"key": "delivery_proof_score", "weight": 15},
                {"key": "token_design_score", "weight": 10},
                {"key": "evidence_integrity_score", "weight": 10},
            ],
        })

    # ──────────────────────────────────────────
    # Web Fact Checking + AI Scoring With Custom Validators
    # ──────────────────────────────────────────

    def _run_fact_check(self, project: dict) -> dict:
        sources = self._project_sources(project)

        if len(sources) == 0:
            return self._default_fact_check_payload()

        project_claims = json.dumps({
            "name": project.get("name", ""),
            "category": project.get("category", ""),
            "description": project.get("description", ""),
            "roadmap": project.get("roadmap", ""),
            "tokenomics": project.get("tokenomics", {}),
            "team": project.get("team", []),
            "investors": project.get("investors", []),
            "partnerships": project.get("partnerships", []),
            "ecosystem_integrations": project.get("ecosystem_integrations", []),
        }, sort_keys=True)

        source_manifest = json.dumps(sources, sort_keys=True)

        prompt_prefix = f"""
You are Veridex's source-grounded fact-checking engine.

Your job is NOT to reward marketing claims. Your job is to compare submitted claims against web evidence fetched by the Intelligent Contract.

Submitted project claims:
{project_claims}

Source manifest:
{source_manifest}

Rules:
- Treat submitted project data as untrusted until supported by fetched evidence.
- Prefer official website, docs, whitepaper, audit, bug bounty, and GitHub evidence.
- Mark claims as verified only if they are directly supported by fetched source text or GitHub metadata.
- Penalize inaccessible, thin, contradictory, or irrelevant sources.
- Do not invent facts not present in the fetched sources.
- Return ONLY valid JSON.

Return this JSON shape:
{{
  "verification_score": <integer 0-100>,
  "verification_status": "VERIFIED" | "PARTIAL" | "WEAK" | "UNVERIFIABLE",
  "confidence": <integer 0-100>,
  "verified_source_count": <integer>,
  "summary": "one short source-grounded summary",
  "verified_claims": ["short verified claim 1", "short verified claim 2"],
  "contradictions": ["short contradiction or unsupported mismatch"],
  "missing_evidence": ["short missing evidence item"],
  "source_summaries": [
    {{"source_type": "website", "url": "https://...", "status": "supports" | "weak" | "contradicts" | "inaccessible", "note": "short note"}}
  ]
}}
"""

        def leader_fn():
            fetched_sources = []

            for source in sources:
                fetched_sources.append(self._fetch_source_snapshot(source))

            prompt = prompt_prefix + "\nFetched source evidence JSON:\n" + json.dumps(fetched_sources, sort_keys=True)
            response = gl.nondet.exec_prompt(prompt)
            parsed = self._safe_json_loads(response, self._default_fact_check_payload())
            return self._normalize_fact_check_payload(parsed, fetched_sources)

        def validator_fn(leader_result) -> bool:
            if isinstance(leader_result, gl.vm.Return):
                raw = leader_result.calldata
            elif isinstance(leader_result, dict):
                raw = leader_result
            else:
                return False

            leader_data = self._normalize_fact_check_payload(raw, [])
            validator_data = leader_fn()

            return self._fact_checks_close_enough(leader_data, validator_data)

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        return self._normalize_fact_check_payload(result, [])

    def _evaluate_all_scores(self, project: dict, fact_check: dict) -> dict:
        project_context = json.dumps(project, sort_keys=True)
        fact_context = json.dumps(fact_check, sort_keys=True)

        prompt = f"""
You are Veridex, an AI crypto project evaluation engine.

Evaluate the project below and return ONLY valid JSON.

Important scoring rule:
The source-grounded fact check is the ground truth layer. Do not give high scores for claims that are not supported by the web evidence. Penalize contradictions, inaccessible evidence, missing audits, missing GitHub transparency, unverifiable team claims, and vague token utility.

Project JSON:
{project_context}

Source-grounded fact check JSON:
{fact_context}

Score each category from 0 to 100 using this 7-factor Veridex score model:

1. protocol_architecture_score (20%):
   - architecture clarity
   - technical innovation
   - documentation completeness
   - repository transparency
   - feasibility

2. team_governance_score (15%):
   - team completeness
   - verifiable credentials
   - relevant experience
   - transparency
   - governance and backer credibility

3. market_traction_score (15%):
   - problem clarity
   - market need
   - differentiation
   - traction signals
   - go-to-market credibility

4. security_risk_score (15%):
   - audit coverage
   - audit credibility
   - bug bounty
   - open-source transparency
   - vulnerability handling and protocol risk controls

5. delivery_proof_score (15%):
   - roadmap specificity
   - shipped product evidence
   - repository activity
   - website/app completeness
   - delivery credibility

6. token_design_score (10%):
   - token utility clarity
   - token necessity
   - supply/emission logic
   - value capture
   - alignment with protocol usage

7. evidence_integrity_score (10%):
   - accessible official sources
   - consistency between submitted claims and fetched web evidence
   - GitHub/docs/audit/bug-bounty verification strength
   - contradiction and missing-evidence risk

Return ONLY this JSON shape:
{{
  "protocol_architecture_score": <integer 0-100>,
  "team_governance_score": <integer 0-100>,
  "market_traction_score": <integer 0-100>,
  "security_risk_score": <integer 0-100>,
  "delivery_proof_score": <integer 0-100>,
  "token_design_score": <integer 0-100>,
  "evidence_integrity_score": <integer 0-100>,
  "confidence": <integer 0-100>,
  "strengths": ["short strength 1", "short strength 2"],
  "weaknesses": ["short weakness 1", "short weakness 2"],
  "recommendations": ["short recommendation 1", "short recommendation 2"]
}}
"""

        def leader_fn():
            response = gl.nondet.exec_prompt(prompt)
            parsed = self._safe_json_loads(response, self._default_score_payload())
            normalized = self._normalize_score_payload(parsed)
            return self._apply_fact_check_weighting(normalized, fact_check)

        def validator_fn(leader_result) -> bool:
            if isinstance(leader_result, gl.vm.Return):
                raw = leader_result.calldata
            elif isinstance(leader_result, dict):
                raw = leader_result
            else:
                return False

            leader_data = self._normalize_score_payload(raw)
            validator_data = leader_fn()

            return self._scores_close_enough(leader_data, validator_data)

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        return self._normalize_score_payload(result)

    def _default_score_payload(self) -> dict:
        return {
            "protocol_architecture_score": 50,
            "team_governance_score": 50,
            "market_traction_score": 50,
            "security_risk_score": 50,
            "delivery_proof_score": 50,
            "token_design_score": 50,
            "evidence_integrity_score": 50,
            "confidence": 70,
            "strengths": [],
            "weaknesses": [],
            "recommendations": [],
        }

    def _normalize_score_payload(self, data) -> dict:
        parsed = data if isinstance(data, dict) else self._default_score_payload()

        return {
            "protocol_architecture_score": self._bounded_score(parsed.get("protocol_architecture_score", 50)),
            "team_governance_score": self._bounded_score(parsed.get("team_governance_score", 50)),
            "market_traction_score": self._bounded_score(parsed.get("market_traction_score", 50)),
            "security_risk_score": self._bounded_score(parsed.get("security_risk_score", 50)),
            "delivery_proof_score": self._bounded_score(parsed.get("delivery_proof_score", 50)),
            "token_design_score": self._bounded_score(parsed.get("token_design_score", 50)),
            "evidence_integrity_score": self._bounded_score(parsed.get("evidence_integrity_score", 50)),
            "confidence": self._bounded_score(parsed.get("confidence", 70)),
            "strengths": self._safe_list(parsed.get("strengths", []), []),
            "weaknesses": self._safe_list(parsed.get("weaknesses", []), []),
            "recommendations": self._safe_list(parsed.get("recommendations", []), []),
        }

    def _scores_close_enough(self, leader_data: dict, validator_data: dict) -> bool:
        keys = [
            "protocol_architecture_score",
            "team_governance_score",
            "market_traction_score",
            "security_risk_score",
            "delivery_proof_score",
            "token_design_score",
            "evidence_integrity_score",
        ]

        tolerance = 15

        for key in keys:
            leader_score = self._bounded_score(leader_data.get(key, 50))
            validator_score = self._bounded_score(validator_data.get(key, 50))

            if leader_score <= 10 or validator_score <= 10:
                if abs(leader_score - validator_score) > 5:
                    return False
            else:
                if abs(leader_score - validator_score) > tolerance:
                    return False

        return True

    def _fetch_source_snapshot(self, source: dict) -> dict:
        source_type = str(source.get("source_type", "unknown"))
        url = str(source.get("url", ""))

        if not self._is_safe_https_url(url):
            return {
                "source_type": source_type,
                "url": self._clean_text(url, 300),
                "accessible": False,
                "status_code": 0,
                "kind": "invalid_url",
                "excerpt": "",
            }

        try:
            if source_type == "github":
                api_url = self._github_api_url(url)
                if api_url != "":
                    response = gl.nondet.web.request(api_url, method="GET")
                    status_code = int(getattr(response, "status_code", 200))

                    if status_code >= 400:
                        return {
                            "source_type": source_type,
                            "url": url,
                            "accessible": False,
                            "status_code": status_code,
                            "kind": "github_api",
                            "excerpt": "",
                        }

                    data = json.loads(response.body.decode("utf-8"))
                    stable = {
                        "id": data.get("id", 0),
                        "full_name": data.get("full_name", ""),
                        "description": data.get("description", ""),
                        "homepage": data.get("homepage", ""),
                        "archived": data.get("archived", False),
                        "disabled": data.get("disabled", False),
                        "default_branch": data.get("default_branch", ""),
                        "license": data.get("license", {}).get("spdx_id", "") if isinstance(data.get("license", {}), dict) else "",
                    }
                    return {
                        "source_type": source_type,
                        "url": url,
                        "accessible": True,
                        "status_code": status_code,
                        "kind": "github_api",
                        "stable_fields": stable,
                        "excerpt": self._clean_text(json.dumps(stable, sort_keys=True), 1600),
                    }

            response = gl.nondet.web.request(url, method="GET")
            status_code = int(getattr(response, "status_code", 200))

            if status_code >= 400:
                return {
                    "source_type": source_type,
                    "url": url,
                    "accessible": False,
                    "status_code": status_code,
                    "kind": "http",
                    "excerpt": "",
                }

            body = response.body.decode("utf-8")
            excerpt = self._clip_for_prompt(self._normalize_whitespace(body), 2600)

            return {
                "source_type": source_type,
                "url": url,
                "accessible": True,
                "status_code": status_code,
                "kind": "http",
                "excerpt": excerpt,
            }
        except Exception:
            return {
                "source_type": source_type,
                "url": self._clean_text(url, 300),
                "accessible": False,
                "status_code": 0,
                "kind": "fetch_failed",
                "excerpt": "",
            }

    def _project_sources(self, project: dict) -> list:
        sources = []

        self._add_source(sources, "website", project.get("website", ""))
        self._add_source(sources, "whitepaper", project.get("whitepaper_url", ""))
        self._add_source(sources, "docs", project.get("docs_url", ""))
        self._add_source(sources, "verification_document", project.get("verification_document_url", ""))
        self._add_source(sources, "bug_bounty", project.get("bug_bounty_url", ""))

        github_repos = project.get("github_repos", [])
        if isinstance(github_repos, list):
            for repo in github_repos:
                self._add_source(sources, "github", self._extract_url(repo))

        audits = project.get("audits", [])
        if isinstance(audits, list):
            for audit in audits:
                self._add_source(sources, "audit", self._extract_url(audit))

        return sources[:8]

    def _add_source(self, sources: list, source_type: str, url: str) -> None:
        cleaned_url = self._clean_text(str(url), 300)

        if not self._is_safe_https_url(cleaned_url):
            return

        for source in sources:
            if source.get("url", "") == cleaned_url:
                return

        sources.append({
            "source_type": source_type,
            "url": cleaned_url,
        })

    def _extract_url(self, value) -> str:
        if isinstance(value, str):
            return value

        if isinstance(value, dict):
            for key in ["url", "link", "repo", "repository", "website"]:
                raw = value.get(key, "")
                if isinstance(raw, str) and raw != "":
                    return raw

        return ""

    def _is_safe_https_url(self, url: str) -> bool:
        text = str(url).strip()

        if len(text) < 12 or len(text) > 300:
            return False
        if not text.startswith("https://"):
            return False
        if " " in text or "\n" in text or "\t" in text:
            return False

        lowered = text.lower()
        blocked_hosts = [
            "https://localhost",
            "https://127.",
            "https://10.",
            "https://172.16.",
            "https://172.17.",
            "https://172.18.",
            "https://172.19.",
            "https://172.20.",
            "https://172.21.",
            "https://172.22.",
            "https://172.23.",
            "https://172.24.",
            "https://172.25.",
            "https://172.26.",
            "https://172.27.",
            "https://172.28.",
            "https://172.29.",
            "https://172.30.",
            "https://172.31.",
            "https://192.168.",
        ]

        for blocked in blocked_hosts:
            if lowered.startswith(blocked):
                return False

        return True

    def _github_api_url(self, url: str) -> str:
        marker = "https://github.com/"

        if not url.startswith(marker):
            return ""

        path = url[len(marker):]
        parts = path.split("/")

        if len(parts) < 2:
            return ""

        owner = parts[0]
        repo = parts[1]

        if owner == "" or repo == "":
            return ""

        repo = repo.replace(".git", "")
        return "https://api.github.com/repos/" + owner + "/" + repo

    def _normalize_whitespace(self, text: str) -> str:
        output = ""
        last_space = False

        for char in str(text):
            if char in [" ", "\n", "\r", "\t"]:
                if not last_space:
                    output += " "
                    last_space = True
            else:
                output += char
                last_space = False

        return output.strip()

    def _clip_for_prompt(self, text: str, max_len: int) -> str:
        cleaned = self._clean_text(text, max_len)
        return cleaned

    def _default_fact_check_payload(self) -> dict:
        return {
            "verification_score": 0,
            "verification_status": "UNVERIFIABLE",
            "confidence": 50,
            "verified_source_count": 0,
            "summary": "No verifiable web evidence was available.",
            "verified_claims": [],
            "contradictions": [],
            "missing_evidence": ["No accessible official sources were verified"],
            "source_summaries": [],
        }

    def _normalize_fact_check_payload(self, data, fetched_sources: list) -> dict:
        parsed = data if isinstance(data, dict) else self._default_fact_check_payload()

        status = str(parsed.get("verification_status", "UNVERIFIABLE")).upper()
        allowed_statuses = ["VERIFIED", "PARTIAL", "WEAK", "UNVERIFIABLE"]

        if status not in allowed_statuses:
            status = self._verification_status_from_score(self._bounded_score(parsed.get("verification_score", 0)))

        accessible_count = 0
        for source in fetched_sources:
            if isinstance(source, dict) and source.get("accessible", False):
                accessible_count += 1

        verified_source_count = int(parsed.get("verified_source_count", accessible_count))
        if verified_source_count < 0:
            verified_source_count = 0
        if verified_source_count > 8:
            verified_source_count = 8

        source_summaries = parsed.get("source_summaries", [])
        if not isinstance(source_summaries, list):
            source_summaries = []

        cleaned_summaries = []
        for item in source_summaries[:8]:
            if isinstance(item, dict):
                cleaned_summaries.append({
                    "source_type": self._clean_text(str(item.get("source_type", "unknown")), 40),
                    "url": self._clean_text(str(item.get("url", "")), 300),
                    "status": self._clean_text(str(item.get("status", "weak")), 40),
                    "note": self._clean_text(str(item.get("note", "")), 180),
                })

        return {
            "verification_score": self._bounded_score(parsed.get("verification_score", 0)),
            "verification_status": status,
            "confidence": self._bounded_score(parsed.get("confidence", 50)),
            "verified_source_count": verified_source_count,
            "summary": self._clean_text(str(parsed.get("summary", "")), 500),
            "verified_claims": self._safe_list(parsed.get("verified_claims", []), []),
            "contradictions": self._safe_list(parsed.get("contradictions", []), []),
            "missing_evidence": self._safe_list(parsed.get("missing_evidence", []), []),
            "source_summaries": cleaned_summaries,
        }

    def _verification_status_from_score(self, score: int) -> str:
        bounded = self._bounded_score(score)

        if bounded >= 80:
            return "VERIFIED"
        if bounded >= 55:
            return "PARTIAL"
        if bounded >= 30:
            return "WEAK"
        return "UNVERIFIABLE"

    def _verification_bucket(self, score: int) -> int:
        bounded = self._bounded_score(score)

        if bounded >= 80:
            return 3
        if bounded >= 55:
            return 2
        if bounded >= 30:
            return 1
        return 0

    def _fact_checks_close_enough(self, leader_data: dict, validator_data: dict) -> bool:
        leader_score = self._bounded_score(leader_data.get("verification_score", 0))
        validator_score = self._bounded_score(validator_data.get("verification_score", 0))

        if abs(leader_score - validator_score) > 15:
            return False

        if self._verification_bucket(leader_score) != self._verification_bucket(validator_score):
            return False

        leader_sources = int(leader_data.get("verified_source_count", 0))
        validator_sources = int(validator_data.get("verified_source_count", 0))

        if abs(leader_sources - validator_sources) > 2:
            return False

        leader_contradictions = len(leader_data.get("contradictions", []))
        validator_contradictions = len(validator_data.get("contradictions", []))

        if leader_contradictions == 0 and validator_contradictions > 1:
            return False
        if validator_contradictions == 0 and leader_contradictions > 1:
            return False

        return True

    def _apply_fact_check_weighting(self, scores: dict, fact_check: dict) -> dict:
        adjusted = self._normalize_score_payload(scores)
        verification_score = self._bounded_score(fact_check.get("verification_score", 0))
        status = str(fact_check.get("verification_status", "UNVERIFIABLE")).upper()
        contradiction_count = len(fact_check.get("contradictions", [])) if isinstance(fact_check.get("contradictions", []), list) else 0
        verified_source_count = int(fact_check.get("verified_source_count", 0))

        # Evidence Integrity should be tied directly to the fact-check layer.
        # The AI can explain it, but it should not inflate it above the verified evidence score.
        adjusted["evidence_integrity_score"] = min(
            self._bounded_score(adjusted.get("evidence_integrity_score", verification_score)),
            verification_score,
        )

        penalty = 0

        if status == "PARTIAL":
            penalty += 5
        elif status == "WEAK":
            penalty += 12
        elif status == "UNVERIFIABLE":
            penalty += 20

        if verification_score < 50:
            penalty += int((50 - verification_score) / 2)

        if verified_source_count == 0:
            penalty += 10

        if contradiction_count > 0:
            penalty += min(20, contradiction_count * 8)

        sensitive_keys = [
            "team_governance_score",
            "security_risk_score",
            "delivery_proof_score",
            "token_design_score",
        ]

        all_keys = [
            "protocol_architecture_score",
            "team_governance_score",
            "market_traction_score",
            "security_risk_score",
            "delivery_proof_score",
            "token_design_score",
        ]

        for key in all_keys:
            extra = 5 if key in sensitive_keys and penalty > 0 else 0
            adjusted[key] = self._bounded_score(adjusted.get(key, 50) - penalty - extra)

        if verification_score < 30:
            for key in all_keys:
                if adjusted[key] > 60:
                    adjusted[key] = 60

            if adjusted["evidence_integrity_score"] > 30:
                adjusted["evidence_integrity_score"] = 30

        adjusted["confidence"] = min(
            self._bounded_score(adjusted.get("confidence", 70)),
            max(35, verification_score + 20),
        )

        return adjusted

    # ──────────────────────────────────────────
    # Score / Ranking Helpers
    # ──────────────────────────────────────────

    def _calculate_final_score(
        self,
        technical: int,
        team: int,
        market: int,
        security: int,
        execution: int,
        token: int,
        source_integrity: int,
    ) -> float:
        return round(
            technical * 0.20
            + team * 0.15
            + market * 0.15
            + security * 0.15
            + execution * 0.15
            + token * 0.10
            + source_integrity * 0.10,
            1,
        )

    def _assign_rank_tier(self, score: float) -> str:
        if score >= 95:
            return "S+"
        if score >= 90:
            return "S"
        if score >= 80:
            return "A"
        if score >= 70:
            return "B"
        if score >= 60:
            return "C"
        if score >= 50:
            return "D"
        return "F"

    def _append_evaluation_history(self, project_id: str, evaluation: dict) -> None:
        history_raw = self.evaluation_history.get(project_id)
        history = json.loads(history_raw) if history_raw else []
        history.append(evaluation)
        self.evaluation_history[project_id] = json.dumps(history)

    def _update_historical_scores(
        self,
        project_id: str,
        new_score: float,
        new_tier: str,
        evaluation_id: str,
    ) -> None:
        history_raw = self.historical_scores.get(project_id)
        history = json.loads(history_raw) if history_raw else []

        old_score = history[-1]["new_score"] if history else 0
        old_tier = history[-1]["new_tier"] if history else "F"

        entry = {
            "project_id": project_id,
            "old_score": old_score,
            "new_score": new_score,
            "delta": round(new_score - old_score, 1),
            "old_tier": old_tier,
            "new_tier": new_tier,
            "timestamp": str(self._now()),
            "evaluation_id": evaluation_id,
        }

        history.append(entry)
        self.historical_scores[project_id] = json.dumps(history)

    def _update_project_reputation(
        self,
        wallet: str,
        score: float,
        security_risk_score: int,
        delivery_proof_score: int,
        evidence_integrity_score: int,
    ) -> None:
        profile_raw = self.profiles.get(wallet)
        profile = json.loads(profile_raw) if profile_raw else self._default_profile(wallet)

        total = int(profile.get("total_evaluations", 0))
        avg = float(profile.get("average_score", 0))
        best = float(profile.get("best_score", 0))

        new_avg = round((avg * total + score) / (total + 1), 1)
        new_best = max(best, score)

        profile["total_evaluations"] = total + 1
        profile["average_score"] = new_avg
        profile["best_score"] = new_best
        profile["credibility_score"] = min(100, round(new_avg * 0.7 + (total + 1) * 2, 1))
        profile["consistency_score"] = self._compute_consistency(profile, score)
        profile["security_rating"] = security_risk_score
        profile["execution_rating"] = delivery_proof_score
        profile["evidence_rating"] = evidence_integrity_score

        self.profiles[wallet] = json.dumps(profile)

    def _update_leaderboard_internal(self, project: dict, evaluation: dict) -> None:
        category = project.get("category", "Other")
        category_key = category.lower()
        project_id = project["project_id"]

        base_entry = {
            "rank": 0,
            "project_id": project_id,
            "project_name": project.get("name", ""),
            "category": category,
            "website": project.get("website", ""),
            "overall_score": evaluation.get("overall_score", 0),
            "tier": evaluation.get("tier", "F"),
            "protocol_architecture_score": evaluation.get("protocol_architecture_score", 0),
            "team_governance_score": evaluation.get("team_governance_score", 0),
            "market_traction_score": evaluation.get("market_traction_score", 0),
            "security_risk_score": evaluation.get("security_risk_score", 0),
            "delivery_proof_score": evaluation.get("delivery_proof_score", 0),
            "token_design_score": evaluation.get("token_design_score", 0),
            "evidence_integrity_score": evaluation.get("evidence_integrity_score", 0),
            "score_model_version": evaluation.get("score_model_version", "VERIDEX_7_FACTOR_V1"),
            "last_evaluated": str(self._now()),
        }

        overall_rank = self._upsert_board_entry("overall", base_entry)
        category_rank = self._upsert_board_entry(category_key, base_entry)

        ranking = {
            "project_id": project_id,
            "project_name": project.get("name", ""),
            "category": category,
            "overall_score": evaluation.get("overall_score", 0),
            "tier": evaluation.get("tier", "F"),
            "overall_rank": overall_rank,
            "category_rank": category_rank,
            "updated_at": str(self._now()),
        }

        self.rankings[project_id] = json.dumps(ranking)

    def _upsert_board_entry(self, board_key: str, entry: dict) -> int:
        board_raw = self.leaderboard.get(board_key)
        board = json.loads(board_raw) if board_raw else []

        project_id = entry.get("project_id", "")

        board = [e for e in board if e.get("project_id") != project_id]
        board.append(entry)
        board.sort(key=lambda x: x.get("overall_score", 0), reverse=True)

        rank = 0

        for i, item in enumerate(board):
            item["rank"] = i + 1
            if item.get("project_id") == project_id:
                rank = i + 1

        self.leaderboard[board_key] = json.dumps(board)

        return rank

    # ──────────────────────────────────────────
    # Output Helpers
    # ──────────────────────────────────────────

    def _extract_strengths(
        self,
        project: dict,
        tech: int,
        team: int,
        market: int,
        security: int,
        source_integrity: int,
    ) -> list:
        strengths = []

        if tech >= 75:
            strengths.append("Strong protocol architecture and innovation")
        if team >= 75:
            strengths.append("Credible team and governance signals")
        if market >= 75:
            strengths.append("Clear traction and market positioning")
        if security >= 75:
            strengths.append("Robust security and risk posture")
        if source_integrity >= 75:
            strengths.append("Strong source-backed evidence integrity")
        if project.get("github_repos"):
            strengths.append("Open-source development transparency")
        if project.get("audits"):
            strengths.append("Security audit evidence provided")

        return strengths[:5]

    def _extract_weaknesses(
        self,
        project: dict,
        tech: int,
        team: int,
        market: int,
        security: int,
        source_integrity: int,
    ) -> list:
        weaknesses = []

        if tech < 50:
            weaknesses.append("Protocol architecture or documentation needs improvement")
        if team < 50:
            weaknesses.append("Team or governance credentials are not fully verifiable")
        if market < 50:
            weaknesses.append("Traction or market differentiation is unclear")
        if security < 50:
            weaknesses.append("Limited security and risk evidence")
        if source_integrity < 50:
            weaknesses.append("Submitted claims need stronger source-backed verification")
        if not project.get("audits"):
            weaknesses.append("No security audits provided")
        if not project.get("bug_bounty_url"):
            weaknesses.append("No bug bounty program provided")

        return weaknesses[:5]

    def _generate_recommendations(self, project: dict, score: float) -> list:
        recs = []

        if score < 80:
            recs.append("Publish a stronger technical whitepaper")
        if not project.get("audits"):
            recs.append("Commission a security audit from a reputable firm")
        if not project.get("bug_bounty_url"):
            recs.append("Launch a bug bounty program")
        if not project.get("github_repos"):
            recs.append("Open-source relevant protocol components")
        if score < 70:
            recs.append("Provide a clearer roadmap with verifiable milestones")

        return recs[:5]

    def _compute_consistency(self, profile: dict, new_score: float) -> float:
        avg = float(profile.get("average_score", new_score))
        deviation = abs(new_score - avg)
        consistency = max(0, 100 - deviation * 2)

        return round(consistency, 1)

    # ──────────────────────────────────────────
    # Fee Helpers
    # ──────────────────────────────────────────

    def _collect_exact_fee(self, configured_fee: u256, fee_type: str) -> None:
        required = configured_fee if self.fees_enabled else u256(0)
        paid = gl.message.value

        assert int(paid) == int(required), "Incorrect protocol fee sent"

        if int(paid) > 0:
            self.treasury = u256(int(self.treasury) + int(paid))

    # ──────────────────────────────────────────
    # Data Helpers
    # ──────────────────────────────────────────

    def _load_project(self, project_id: str) -> dict:
        data = self.projects.get(project_id)
        assert data is not None, "Project not found"
        return json.loads(data)

    def _generate_project_id(self, owner: str, name: str) -> str:
        raw = f"{owner}:{name}:{int(self.project_count)}:{self._now()}"
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    def _generate_evaluation_id(self, project_id: str, timestamp: str) -> str:
        raw = f"{project_id}:{timestamp}:{int(self.evaluation_count)}"
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    def _generate_evidence_hash(self, data: dict) -> str:
        serialized = json.dumps(data, sort_keys=True)
        return "0x" + hashlib.sha256(serialized.encode()).hexdigest()

    def _bounded_score(self, value) -> int:
        try:
            score = int(value)
        except Exception:
            score = 50

        if score < 0:
            return 0
        if score > 100:
            return 100

        return score

    def _safe_json_loads(self, raw, fallback):
        try:
            if isinstance(raw, dict):
                return raw

            text = str(raw).strip()

            try:
                return json.loads(text)
            except Exception:
                pass

            start = text.find("{")
            end = text.rfind("}")

            if start != -1 and end != -1 and end > start:
                possible_json = text[start:end + 1]
                return json.loads(possible_json)

            return fallback
        except Exception:
            return fallback

    def _safe_json_array(self, raw: str) -> list:
        if raw is None or raw == "":
            return []

        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
            return []
        except Exception:
            return []

    def _safe_json_object(self, raw: str) -> dict:
        if raw is None or raw == "":
            return {}

        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                return parsed
            return {}
        except Exception:
            return {}

    def _safe_list(self, value, fallback: list) -> list:
        if isinstance(value, list):
            cleaned = []
            for item in value:
                cleaned.append(self._clean_text(str(item), 180))
            return cleaned[:5]
        return fallback[:5]

    def _clean_text(self, value: str, max_len: int) -> str:
        if value is None:
            return ""

        cleaned = str(value)

        if len(cleaned) > max_len:
            return cleaned[:max_len]

        return cleaned

    def _init_profile(self, wallet: str) -> None:
        if self.profiles.get(wallet) is None:
            profile = self._default_profile(wallet)
            self.profiles[wallet] = json.dumps(profile)

    def _increment_profile_project_count(self, wallet: str) -> None:
        profile_raw = self.profiles.get(wallet)
        profile = json.loads(profile_raw) if profile_raw else self._default_profile(wallet)

        profile["total_projects"] = int(profile.get("total_projects", 0)) + 1

        self.profiles[wallet] = json.dumps(profile)

    def _default_profile(self, wallet: str) -> dict:
        return {
            "wallet_address": wallet,
            "total_projects": 0,
            "total_evaluations": 0,
            "average_score": 0,
            "best_score": 0,
            "credibility_score": 0,
            "consistency_score": 100,
            "security_rating": 0,
            "execution_rating": 0,
            "evidence_rating": 0,
            "created_at": str(self._now()),
        }

    def _now(self) -> int:
        try:
            return int(gl.block.timestamp)
        except Exception:
            return 0