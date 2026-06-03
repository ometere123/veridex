# v0.2.17
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import hashlib


class AlphaRank(gl.Contract):
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

    treasury: u256

    def __init__(self) -> None:
        self.owner = str(gl.message.sender_address)
        self.project_count = u256(0)
        self.evaluation_count = u256(0)
        self.treasury = u256(0)

    # ──────────────────────────────────────────
    # Write Functions
    # ──────────────────────────────────────────

    @gl.public.write
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
    ) -> str:
        sender = str(gl.message.sender_address)
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

    @gl.public.write
    def submit_evaluation(self, project_id: str) -> None:
        sender = str(gl.message.sender_address)
        project = self._load_project(project_id)

        assert project["owner"] == sender, "Not project owner"
        assert project["status"] in ["evaluation_locked", "reevaluation_pending"], "Project must be locked first"

        project["status"] = "evaluating"
        project["updated_at"] = str(self._now())

        self.projects[project_id] = json.dumps(project)

    @gl.public.write
    def run_evaluation(self, project_id: str) -> str:
        project = self._load_project(project_id)

        assert project["status"] == "evaluating", "Project not in evaluating state"

        technical_score = self._evaluate_technical_quality(project)
        team_score = self._evaluate_team_quality(project)
        market_fit_score = self._evaluate_market_fit(project)
        security_score = self._evaluate_security(project)
        execution_score = self._evaluate_execution(project)
        token_utility_score = self._evaluate_token_utility(project)

        overall_score = self._calculate_final_score(
            technical_score,
            team_score,
            market_fit_score,
            security_score,
            execution_score,
            token_utility_score,
        )

        tier = self._assign_rank_tier(overall_score)
        now = str(self._now())
        evaluation_id = self._generate_evaluation_id(project_id, now)

        evaluation = {
            "evaluation_id": evaluation_id,
            "project_id": project_id,
            "technical_score": technical_score,
            "team_score": team_score,
            "market_fit_score": market_fit_score,
            "security_score": security_score,
            "execution_score": execution_score,
            "token_utility_score": token_utility_score,
            "overall_score": overall_score,
            "tier": tier,
            "confidence": 85,
            "strengths": self._extract_strengths(
                project,
                technical_score,
                team_score,
                market_fit_score,
                security_score,
            ),
            "weaknesses": self._extract_weaknesses(
                project,
                technical_score,
                team_score,
                market_fit_score,
                security_score,
            ),
            "recommendations": self._generate_recommendations(project, overall_score),
            "evaluation_hash": self._generate_evidence_hash({
                "project_id": project_id,
                "overall_score": overall_score,
                "tier": tier,
                "timestamp": now,
            }),
            "evaluated_at": now,
        }

        self.evaluations[project_id] = json.dumps(evaluation)
        self.evaluation_count = u256(int(self.evaluation_count) + 1)

        self._append_evaluation_history(project_id, evaluation)
        self._update_historical_scores(project_id, overall_score, tier, evaluation_id)
        self._update_project_reputation(
            project["owner"],
            overall_score,
            security_score,
            execution_score,
        )

        project["status"] = "ranked"
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
    def withdraw_protocol_fees(self) -> None:
        sender = str(gl.message.sender_address)

        assert sender == self.owner, "Only owner can withdraw"

        self.treasury = u256(0)

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
            "owner": self.owner,
        })

    # ──────────────────────────────────────────
    # Internal AI Evaluation Functions
    # ──────────────────────────────────────────

    def _evaluate_technical_quality(self, project: dict) -> int:
        github_repos = project.get("github_repos", [])
        whitepaper_url = project.get("whitepaper_url", "")
        docs_url = project.get("docs_url", "")
        description = project.get("description", "")

        prompt = f"""
You are a senior blockchain protocol engineer conducting a technical evaluation of a crypto project.

Project Name: {project.get('name', '')}
Description: {description}
Whitepaper: {whitepaper_url}
Documentation: {docs_url}
GitHub Repositories: {', '.join(github_repos) if github_repos else 'None provided'}
Category: {project.get('category', '')}

Evaluate the TECHNICAL QUALITY score from 0 to 100 based on:
1. Protocol architecture clarity
2. Technical innovation
3. Documentation completeness
4. Repository transparency, if provided
5. Feasibility relative to the stated category

Return ONLY JSON:
{{"score": <integer 0-100>, "reasoning": "<short explanation>"}}
"""
        result = gl.eq_principle.prompt_non_comparative(prompt)
        parsed = self._safe_json_loads(result, {"score": 50})
        return self._bounded_score(parsed.get("score", 50))

    def _evaluate_team_quality(self, project: dict) -> int:
        team = project.get("team", [])
        investors = project.get("investors", [])

        prompt = f"""
You are evaluating the team quality of a crypto project for AlphaRank.

Project Name: {project.get('name', '')}
Category: {project.get('category', '')}
Team Members: {json.dumps(team)}
Investors/Backers: {', '.join(investors) if investors else 'Not disclosed'}

Evaluate the TEAM QUALITY score from 0 to 100 based on:
1. Team completeness
2. Verifiable credentials
3. Relevant experience
4. Transparency
5. Investor or backer credibility

Return ONLY JSON:
{{"score": <integer 0-100>, "reasoning": "<short explanation>"}}
"""
        result = gl.eq_principle.prompt_non_comparative(prompt)
        parsed = self._safe_json_loads(result, {"score": 50})
        return self._bounded_score(parsed.get("score", 50))

    def _evaluate_market_fit(self, project: dict) -> int:
        prompt = f"""
You are a crypto market analyst evaluating market fit for AlphaRank.

Project Name: {project.get('name', '')}
Category: {project.get('category', '')}
Description: {project.get('description', '')}
Website: {project.get('website', '')}
Partnerships: {', '.join(project.get('partnerships', [])) if project.get('partnerships') else 'None disclosed'}
Ecosystem Integrations: {', '.join(project.get('ecosystem_integrations', [])) if project.get('ecosystem_integrations') else 'None'}
Roadmap: {project.get('roadmap', '')[:600]}

Evaluate MARKET FIT score from 0 to 100 based on:
1. Problem clarity
2. Market need
3. Competitive differentiation
4. Traction signals
5. Go-to-market credibility

Return ONLY JSON:
{{"score": <integer 0-100>, "reasoning": "<short explanation>"}}
"""
        result = gl.eq_principle.prompt_non_comparative(prompt)
        parsed = self._safe_json_loads(result, {"score": 50})
        return self._bounded_score(parsed.get("score", 50))

    def _evaluate_security(self, project: dict) -> int:
        audits = project.get("audits", [])
        bug_bounty = project.get("bug_bounty_url", "")

        prompt = f"""
You are a blockchain security expert evaluating security posture for AlphaRank.

Project Name: {project.get('name', '')}
Audit Reports: {json.dumps(audits)}
Bug Bounty Program: {bug_bounty if bug_bounty else 'None'}
GitHub Repos: {', '.join(project.get('github_repos', [])) if project.get('github_repos') else 'None'}

Evaluate SECURITY score from 0 to 100 based on:
1. Audit coverage
2. Audit firm credibility
3. Bug bounty presence
4. Open-source transparency
5. Disclosed vulnerability handling

Return ONLY JSON:
{{"score": <integer 0-100>, "reasoning": "<short explanation>"}}
"""
        result = gl.eq_principle.prompt_non_comparative(prompt)
        parsed = self._safe_json_loads(result, {"score": 50})
        return self._bounded_score(parsed.get("score", 50))

    def _evaluate_token_utility(self, project: dict) -> int:
        tokenomics = project.get("tokenomics", {})

        prompt = f"""
You are a tokenomics expert evaluating token utility for AlphaRank.

Project Name: {project.get('name', '')}
Category: {project.get('category', '')}
Tokenomics: {json.dumps(tokenomics)}

Evaluate TOKEN UTILITY score from 0 to 100 based on:
1. Token utility clarity
2. Whether a token is necessary
3. Supply and emission logic
4. Value capture
5. Alignment with protocol usage

Return ONLY JSON:
{{"score": <integer 0-100>, "reasoning": "<short explanation>"}}
"""
        result = gl.eq_principle.prompt_non_comparative(prompt)
        parsed = self._safe_json_loads(result, {"score": 50})
        return self._bounded_score(parsed.get("score", 50))

    def _evaluate_execution(self, project: dict) -> int:
        prompt = f"""
You are evaluating execution progress and delivery capability for AlphaRank.

Project Name: {project.get('name', '')}
Roadmap: {project.get('roadmap', '')[:600]}
Website: {project.get('website', '')}
GitHub Repos: {', '.join(project.get('github_repos', [])) if project.get('github_repos') else 'None'}
Description: {project.get('description', '')[:500]}

Evaluate EXECUTION PROGRESS score from 0 to 100 based on:
1. Roadmap specificity
2. Evidence of shipped product
3. Repository activity, if available
4. Website or app completeness
5. Delivery credibility

Return ONLY JSON:
{{"score": <integer 0-100>, "reasoning": "<short explanation>"}}
"""
        result = gl.eq_principle.prompt_non_comparative(prompt)
        parsed = self._safe_json_loads(result, {"score": 50})
        return self._bounded_score(parsed.get("score", 50))

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
    ) -> float:
        return round(
            technical * 0.25
            + team * 0.20
            + market * 0.20
            + security * 0.15
            + execution * 0.10
            + token * 0.10,
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
        security_score: int,
        execution_score: int,
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
        profile["security_rating"] = security_score
        profile["execution_rating"] = execution_score

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
            "technical_score": evaluation.get("technical_score", 0),
            "team_score": evaluation.get("team_score", 0),
            "market_fit_score": evaluation.get("market_fit_score", 0),
            "security_score": evaluation.get("security_score", 0),
            "execution_score": evaluation.get("execution_score", 0),
            "token_utility_score": evaluation.get("token_utility_score", 0),
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
    ) -> list:
        strengths = []

        if tech >= 75:
            strengths.append("Strong technical architecture and innovation")
        if team >= 75:
            strengths.append("Experienced or credible team signals")
        if market >= 75:
            strengths.append("Clear market differentiation and fit")
        if security >= 75:
            strengths.append("Robust security posture")
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
    ) -> list:
        weaknesses = []

        if tech < 50:
            weaknesses.append("Technical documentation needs improvement")
        if team < 50:
            weaknesses.append("Team credentials are not fully verifiable")
        if market < 50:
            weaknesses.append("Market differentiation is unclear")
        if security < 50:
            weaknesses.append("Limited security audit coverage")
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
            "created_at": str(self._now()),
        }

    def _now(self) -> int:
        try:
            return int(gl.block.timestamp)
        except Exception:
            return 0