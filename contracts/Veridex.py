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
    dossier_count: u256
    verification_count: u256
    proof_event_count: u256

    dossiers: TreeMap[str, str]
    evidence_manifests: TreeMap[str, str]
    fact_checks: TreeMap[str, str]
    verification_reports: TreeMap[str, str]
    verification_history: TreeMap[str, str]
    proof_ledger: TreeMap[str, str]
    proof_events: TreeMap[str, str]
    registry: TreeMap[str, str]
    issuer_profiles: TreeMap[str, str]

    treasury: u256
    create_dossier_fee: u256
    verification_fee: u256
    refresh_fee: u256
    fees_enabled: bool
    verification_window_days: u256

    def __init__(self) -> None:
        self.owner = str(gl.message.sender_address)
        self.dossier_count = u256(0)
        self.verification_count = u256(0)
        self.proof_event_count = u256(0)
        self.treasury = u256(0)
        self.create_dossier_fee = u256(0)
        self.verification_fee = u256(0)
        self.refresh_fee = u256(0)
        self.fees_enabled = False
        self.verification_window_days = u256(90)

    @gl.public.write.payable
    def create_dossier(
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
        evidence_files: str = "[]",
    ) -> str:
        sender = str(gl.message.sender_address)
        self._collect_exact_fee(self.create_dossier_fee, "create_dossier")

        dossier_id = self._generate_dossier_id(sender, name)
        now = str(self._now())
        category_clean = self._clean_text(category, 80)

        manifest = {
            "dossier_id": dossier_id,
            "website": self._clean_text(website, 300),
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
            "verification_document_url": self._clean_text(verification_document_url, 500),
            "evidence_files": self._safe_json_array(evidence_files),
            "submitted_at": now,
            "locked_at": "",
            "evidence_hash": "",
        }

        dossier = {
            "dossier_id": dossier_id,
            "issuer": sender,
            "name": self._clean_text(name, 120),
            "category": category_clean,
            "website": self._clean_text(website, 300),
            "description": self._clean_text(description, 1500),
            "status": "DRAFT",
            "evidence_hash": "",
            "current_verification_hash": "",
            "current_verification_level": "UNVERIFIED",
            "evidence_confidence": 0,
            "risk_band": "UNKNOWN",
            "verified_source_count": 0,
            "proof_event_count": 0,
            "verification_count": 0,
            "created_at": now,
            "updated_at": now,
            "locked_at": "",
            "last_verified_at": "",
            "expires_at": "",
        }

        self.dossiers[dossier_id] = json.dumps(dossier)
        self.evidence_manifests[dossier_id] = json.dumps(manifest)
        self.dossier_count = u256(int(self.dossier_count) + 1)

        self._init_issuer_profile(sender)
        self._bump_issuer_profile(sender, "submitted_dossiers", 1)
        self._append_proof_event(
            dossier_id,
            sender,
            "DOSSIER_CREATED",
            "",
            "Public verification dossier created.",
        )

        return dossier_id

    @gl.public.write
    def update_dossier_before_lock(
        self,
        dossier_id: str,
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
        evidence_files: str = "[]",
    ) -> None:
        sender = str(gl.message.sender_address)
        dossier = self._load_dossier(dossier_id)
        manifest = self._load_manifest(dossier_id)

        assert dossier["issuer"] == sender, "Not dossier issuer"
        assert dossier["status"] == "DRAFT", "Evidence already locked"

        now = str(self._now())
        dossier["name"] = self._clean_text(name, 120)
        dossier["category"] = self._clean_text(category, 80)
        dossier["website"] = self._clean_text(website, 300)
        dossier["description"] = self._clean_text(description, 1500)
        dossier["updated_at"] = now

        manifest["website"] = self._clean_text(website, 300)
        manifest["whitepaper_url"] = self._clean_text(whitepaper_url, 300)
        manifest["docs_url"] = self._clean_text(docs_url, 300)
        manifest["github_repos"] = self._safe_json_array(github_repos)
        manifest["roadmap"] = self._clean_text(roadmap, 2000)
        manifest["tokenomics"] = self._safe_json_object(tokenomics)
        manifest["audits"] = self._safe_json_array(audits)
        manifest["team"] = self._safe_json_array(team)
        manifest["investors"] = self._safe_json_array(investors)
        manifest["partnerships"] = self._safe_json_array(partnerships)
        manifest["bug_bounty_url"] = self._clean_text(bug_bounty_url, 300)
        manifest["ecosystem_integrations"] = self._safe_json_array(ecosystem_integrations)
        manifest["verification_document_url"] = self._clean_text(verification_document_url, 500)
        manifest["evidence_files"] = self._safe_json_array(evidence_files)

        self.dossiers[dossier_id] = json.dumps(dossier)
        self.evidence_manifests[dossier_id] = json.dumps(manifest)
        self._append_proof_event(dossier_id, sender, "DOSSIER_UPDATED", "", "Draft evidence manifest updated.")

    @gl.public.write
    def lock_evidence(self, dossier_id: str) -> str:
        sender = str(gl.message.sender_address)
        dossier = self._load_dossier(dossier_id)
        manifest = self._load_manifest(dossier_id)

        assert dossier["issuer"] == sender, "Not dossier issuer"
        assert dossier["status"] == "DRAFT", "Evidence already locked"

        now = str(self._now())
        evidence_hash = self._hash({
            "dossier_id": dossier_id,
            "manifest": manifest,
            "locked_at": now,
        })

        manifest["locked_at"] = now
        manifest["evidence_hash"] = evidence_hash
        dossier["status"] = "EVIDENCE_LOCKED"
        dossier["evidence_hash"] = evidence_hash
        dossier["locked_at"] = now
        dossier["updated_at"] = now

        self.evidence_manifests[dossier_id] = json.dumps(manifest)
        self.dossiers[dossier_id] = json.dumps(dossier)
        self._append_proof_event(dossier_id, sender, "EVIDENCE_LOCKED", evidence_hash, "Evidence manifest locked.")

        return evidence_hash

    @gl.public.write.payable
    def submit_verification(self, dossier_id: str) -> None:
        sender = str(gl.message.sender_address)
        dossier = self._load_dossier(dossier_id)

        assert dossier["issuer"] == sender, "Not dossier issuer"
        assert dossier["status"] in ["EVIDENCE_LOCKED", "REFRESH_PENDING", "STALE"], "Lock evidence first"

        fee = self.refresh_fee if dossier["status"] in ["REFRESH_PENDING", "STALE"] else self.verification_fee
        self._collect_exact_fee(fee, "submit_verification")

        dossier["status"] = "VERIFYING"
        dossier["updated_at"] = str(self._now())
        self.dossiers[dossier_id] = json.dumps(dossier)
        self._append_proof_event(dossier_id, sender, "VERIFICATION_SUBMITTED", dossier.get("evidence_hash", ""), "Verification cycle submitted.")

    @gl.public.write
    def run_verification(self, dossier_id: str) -> str:
        dossier = self._load_dossier(dossier_id)
        manifest = self._load_manifest(dossier_id)

        assert dossier["status"] == "VERIFYING", "Dossier not ready for verification"

        fact_check = self._run_fact_check(dossier, manifest)
        fact_check_hash = self._hash(fact_check)
        fact_check["dossier_id"] = dossier_id
        fact_check["fact_check_hash"] = fact_check_hash
        fact_check["checked_at"] = str(self._now())
        self.fact_checks[dossier_id] = json.dumps(fact_check)
        self._append_proof_event(dossier_id, self.owner, "FACT_CHECK_COMPLETED", fact_check_hash, "Source-grounded fact check completed.")

        report = self._run_verification_report(dossier, manifest, fact_check)
        verification_hash = self._hash(report)
        now = str(self._now())
        verification_id = self._generate_verification_id(dossier_id, now)
        expires_at = str(self._now() + int(self.verification_window_days) * 86400)

        report["verification_id"] = verification_id
        report["dossier_id"] = dossier_id
        report["fact_check_hash"] = fact_check_hash
        report["verification_hash"] = verification_hash
        report["verified_at"] = now
        report["expires_at"] = expires_at

        self.verification_reports[dossier_id] = json.dumps(report)
        self.verification_count = u256(int(self.verification_count) + 1)
        self._append_verification_history(dossier_id, report)

        dossier["status"] = self._status_from_report(report)
        dossier["current_verification_hash"] = verification_hash
        dossier["current_verification_level"] = report.get("verification_level", "UNVERIFIABLE")
        dossier["evidence_confidence"] = self._bounded_score(report.get("evidence_confidence", 0))
        dossier["risk_band"] = self._clean_text(str(report.get("risk_band", "UNKNOWN")), 40)
        dossier["verified_source_count"] = int(report.get("verified_source_count", 0))
        dossier["verification_count"] = int(dossier.get("verification_count", 0)) + 1
        dossier["last_verified_at"] = now
        dossier["expires_at"] = expires_at
        dossier["updated_at"] = now
        self.dossiers[dossier_id] = json.dumps(dossier)

        self._update_registry_entry(dossier, report)
        self._update_issuer_after_verification(dossier["issuer"], dossier, report)
        self._append_proof_event(dossier_id, self.owner, "VERIFICATION_COMPLETED", verification_hash, "Verification report stored on-chain.")

        return verification_id

    @gl.public.write.payable
    def request_verification_refresh(self, dossier_id: str) -> None:
        sender = str(gl.message.sender_address)
        dossier = self._load_dossier(dossier_id)

        assert dossier["issuer"] == sender, "Not dossier issuer"
        assert dossier["status"] not in ["DRAFT", "VERIFYING", "ARCHIVED"], "Cannot refresh now"

        self._collect_exact_fee(self.refresh_fee, "refresh_verification")
        dossier["status"] = "REFRESH_PENDING"
        dossier["updated_at"] = str(self._now())
        self.dossiers[dossier_id] = json.dumps(dossier)
        self._append_proof_event(dossier_id, sender, "VERIFICATION_REFRESH_REQUESTED", dossier.get("current_verification_hash", ""), "Verification refresh requested.")

    @gl.public.write
    def archive_dossier(self, dossier_id: str) -> None:
        sender = str(gl.message.sender_address)
        dossier = self._load_dossier(dossier_id)

        assert dossier["issuer"] == sender or sender == self.owner, "Not authorized"
        assert dossier["status"] != "VERIFYING", "Cannot archive while verifying"

        dossier["status"] = "ARCHIVED"
        dossier["updated_at"] = str(self._now())
        self.dossiers[dossier_id] = json.dumps(dossier)
        self._append_proof_event(dossier_id, sender, "DOSSIER_ARCHIVED", dossier.get("current_verification_hash", ""), "Dossier archived.")

    @gl.public.write
    def update_registry(self, category: str) -> None:
        key = self._registry_key(category)
        raw = self.registry.get(key)
        entries = json.loads(raw) if raw else []
        entries.sort(key=lambda x: (
            self._risk_sort_value(str(x.get("risk_band", "UNKNOWN"))),
            -self._bounded_score(x.get("evidence_confidence", 0)),
        ))
        for i, entry in enumerate(entries):
            entry["registry_position"] = i + 1
        self.registry[key] = json.dumps(entries)

    @gl.public.write
    def set_protocol_fees(
        self,
        create_dossier_fee: u256,
        verification_fee: u256,
        refresh_fee: u256,
        fees_enabled: bool,
    ) -> None:
        sender = str(gl.message.sender_address)
        assert sender == self.owner, "Only owner can set fees"

        self.create_dossier_fee = create_dossier_fee
        self.verification_fee = verification_fee
        self.refresh_fee = refresh_fee
        self.fees_enabled = fees_enabled

    @gl.public.write
    def withdraw_protocol_fees(self) -> None:
        sender = str(gl.message.sender_address)
        assert sender == self.owner, "Only owner can withdraw"
        assert int(self.treasury) > 0, "No fees to withdraw"

        amount = self.treasury
        self.treasury = u256(0)
        self._append_proof_event("treasury", sender, "FEE_WITHDRAWN", str(amount), "Protocol fees withdrawn.")
        _FeeRecipient(Address(self.owner)).emit_transfer(value=amount)

    @gl.public.view
    def get_dossier(self, dossier_id: str) -> str:
        data = self.dossiers.get(dossier_id)
        return data if data is not None else "{}"

    @gl.public.view
    def get_evidence_manifest(self, dossier_id: str) -> str:
        data = self.evidence_manifests.get(dossier_id)
        return data if data is not None else "{}"

    @gl.public.view
    def get_fact_check(self, dossier_id: str) -> str:
        data = self.fact_checks.get(dossier_id)
        return data if data is not None else "{}"

    @gl.public.view
    def get_verification_report(self, dossier_id: str) -> str:
        data = self.verification_reports.get(dossier_id)
        return data if data is not None else "{}"

    @gl.public.view
    def get_verification_history(self, dossier_id: str) -> str:
        data = self.verification_history.get(dossier_id)
        return data if data is not None else "[]"

    @gl.public.view
    def get_proof_ledger(self, dossier_id: str) -> str:
        data = self.proof_ledger.get(dossier_id)
        return data if data is not None else "[]"

    @gl.public.view
    def get_proof_event(self, event_id: str) -> str:
        data = self.proof_events.get(event_id)
        return data if data is not None else "{}"

    @gl.public.view
    def get_registry(self, category: str = "overall") -> str:
        data = self.registry.get(self._registry_key(category))
        return data if data is not None else "[]"

    @gl.public.view
    def get_issuer_profile(self, issuer: str) -> str:
        data = self.issuer_profiles.get(issuer)
        return data if data is not None else "{}"

    @gl.public.view
    def get_treasury_state(self) -> str:
        return json.dumps({
            "total_fees_collected": str(int(self.treasury)),
            "contract_balance": str(int(self.balance)),
            "owner": self.owner,
            "fees_enabled": self.fees_enabled,
            "create_dossier_fee": str(int(self.create_dossier_fee)),
            "verification_fee": str(int(self.verification_fee)),
            "refresh_fee": str(int(self.refresh_fee)),
            "create_project_fee": str(int(self.create_dossier_fee)),
            "evaluation_fee": str(int(self.verification_fee)),
            "reevaluation_fee": str(int(self.refresh_fee)),
        })

    @gl.public.view
    def get_protocol_fees(self) -> str:
        return json.dumps({
            "fees_enabled": self.fees_enabled,
            "create_dossier_fee": str(int(self.create_dossier_fee)),
            "verification_fee": str(int(self.verification_fee)),
            "refresh_fee": str(int(self.refresh_fee)),
            "create_project_fee": str(int(self.create_dossier_fee)),
            "evaluation_fee": str(int(self.verification_fee)),
            "reevaluation_fee": str(int(self.refresh_fee)),
        })

    @gl.public.view
    def get_verification_model(self) -> str:
        return json.dumps({
            "version": "VERIDEX_DOSSIER_V1",
            "verification_levels": [
                "VERIFIED_PLUS",
                "VERIFIED",
                "SUBSTANTIATED",
                "DEVELOPING",
                "LIMITED_EVIDENCE",
                "HIGH_RISK",
                "UNVERIFIABLE",
            ],
            "risk_bands": ["LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL", "UNKNOWN"],
            "dimensions": {
                "protocol_architecture": 20,
                "team_governance": 15,
                "market_traction": 15,
                "security_risk": 15,
                "delivery_proof": 15,
                "token_design": 10,
                "evidence_integrity": 10,
            },
            "verification_window_days": int(self.verification_window_days),
        })

    @gl.public.view
    def get_total_dossiers(self) -> u256:
        return self.dossier_count

    @gl.public.view
    def get_total_verifications(self) -> u256:
        return self.verification_count

    @gl.public.view
    def is_verification_stale(self, dossier_id: str) -> bool:
        dossier = self._load_dossier(dossier_id)
        expires_at = self._safe_int(dossier.get("expires_at", "0"))
        if expires_at == 0:
            return False
        return self._now() > expires_at

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
        return self.create_dossier(
            name,
            category,
            website,
            description,
            whitepaper_url,
            docs_url,
            github_repos,
            roadmap,
            tokenomics,
            audits,
            team,
            investors,
            partnerships,
            bug_bounty_url,
            ecosystem_integrations,
            verification_document_url,
            "[]",
        )

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
        self.update_dossier_before_lock(
            project_id,
            name,
            category,
            website,
            description,
            whitepaper_url,
            docs_url,
            github_repos,
            roadmap,
            tokenomics,
            audits,
            team,
            investors,
            partnerships,
            bug_bounty_url,
            ecosystem_integrations,
            "",
            "[]",
        )

    @gl.public.write
    def lock_project_data(self, project_id: str) -> str:
        return self.lock_evidence(project_id)

    @gl.public.write.payable
    def submit_evaluation(self, project_id: str) -> None:
        self.submit_verification(project_id)

    @gl.public.write
    def run_evaluation(self, project_id: str) -> str:
        return self.run_verification(project_id)

    @gl.public.write.payable
    def request_reevaluation(self, project_id: str) -> None:
        self.request_verification_refresh(project_id)

    @gl.public.write
    def archive_project(self, project_id: str) -> None:
        self.archive_dossier(project_id)

    @gl.public.write
    def update_leaderboard(self, category: str) -> None:
        self.update_registry(category)

    @gl.public.view
    def get_project(self, project_id: str) -> str:
        return self.get_dossier(project_id)

    @gl.public.view
    def get_evaluation(self, project_id: str) -> str:
        return self.get_verification_report(project_id)

    @gl.public.view
    def get_evaluation_history(self, project_id: str) -> str:
        return self.get_verification_history(project_id)

    @gl.public.view
    def get_historical_scores(self, project_id: str) -> str:
        return self.get_verification_history(project_id)

    @gl.public.view
    def get_ranking(self, project_id: str) -> str:
        dossier = self._load_dossier(project_id)
        return json.dumps({
            "project_id": project_id,
            "project_name": dossier.get("name", ""),
            "category": dossier.get("category", "Other"),
            "overall_score": dossier.get("evidence_confidence", 0),
            "tier": self._legacy_tier(str(dossier.get("current_verification_level", "UNVERIFIABLE"))),
            "overall_rank": 0,
            "category_rank": 0,
            "updated_at": dossier.get("updated_at", ""),
        })

    @gl.public.view
    def get_leaderboard(self, category: str = "overall") -> str:
        return self.get_registry(category)

    @gl.public.view
    def get_profile(self, wallet: str) -> str:
        return self.get_issuer_profile(wallet)

    @gl.public.view
    def get_score_model(self) -> str:
        return self.get_verification_model()

    @gl.public.view
    def get_total_projects(self) -> u256:
        return self.get_total_dossiers()

    @gl.public.view
    def get_total_evaluations(self) -> u256:
        return self.get_total_verifications()

    def _run_fact_check(self, dossier: dict, manifest: dict) -> dict:
        sources = self._manifest_sources(manifest)
        verified_source_count = len(sources)
        missing = self._missing_evidence(manifest)
        contradictions = []
        score = max(0, min(100, 20 + verified_source_count * 10 - len(missing) * 6))

        if verified_source_count == 0:
            status = "UNVERIFIABLE"
        elif score >= 80:
            status = "VERIFIED"
        elif score >= 55:
            status = "PARTIAL"
        elif score >= 30:
            status = "WEAK"
        else:
            status = "UNVERIFIABLE"

        return {
            "dossier_id": dossier.get("dossier_id", ""),
            "fact_check_hash": "",
            "verification_score": score,
            "verification_status": status,
            "confidence": min(95, max(20, score + 5)),
            "verified_source_count": verified_source_count,
            "summary": self._fact_summary(status, verified_source_count, missing),
            "verified_claims": self._verified_claims(dossier, manifest, verified_source_count),
            "contradictions": contradictions,
            "missing_evidence": missing,
            "source_summaries": sources,
            "checked_at": "",
        }

    def _run_verification_report(self, dossier: dict, manifest: dict, fact_check: dict) -> dict:
        source_count = int(fact_check.get("verified_source_count", 0))
        fact_score = self._bounded_score(fact_check.get("verification_score", 0))
        missing = fact_check.get("missing_evidence", []) if isinstance(fact_check.get("missing_evidence", []), list) else []
        risk_flags = self._risk_flags(manifest, source_count, missing)

        protocol = self._bounded_score(50 + self._has_text(manifest.get("docs_url", "")) * 15 + self._has_text(manifest.get("whitepaper_url", "")) * 15 + min(20, len(manifest.get("github_repos", [])) * 8))
        team = self._bounded_score(45 + min(35, len(manifest.get("team", [])) * 18) + min(20, len(manifest.get("investors", [])) * 5))
        traction = self._bounded_score(45 + min(25, len(manifest.get("partnerships", [])) * 6) + min(20, len(manifest.get("ecosystem_integrations", [])) * 5) + self._has_text(manifest.get("roadmap", "")) * 10)
        security = self._bounded_score(40 + min(35, len(manifest.get("audits", [])) * 22) + self._has_text(manifest.get("bug_bounty_url", "")) * 20)
        delivery = self._bounded_score(45 + self._has_text(manifest.get("roadmap", "")) * 20 + min(25, len(manifest.get("github_repos", [])) * 8))
        token = self._bounded_score(45 + min(35, len(manifest.get("tokenomics", {}).keys()) * 9))
        integrity = min(fact_score, self._bounded_score(35 + source_count * 9 - len(missing) * 5))

        weighted = round(
            protocol * 0.20
            + team * 0.15
            + traction * 0.15
            + security * 0.15
            + delivery * 0.15
            + token * 0.10
            + integrity * 0.10,
            1,
        )
        if source_count < 3:
            weighted = min(weighted, 64)
        if "MISSING_AUDIT" in risk_flags:
            weighted = min(weighted, 84)
        if "LOW_SOURCE_COUNT" in risk_flags:
            weighted = min(weighted, 74)

        confidence = self._bounded_score(min(weighted, fact_score + 15))
        level = self._verification_level(confidence, risk_flags)
        risk_band = self._risk_band(confidence, risk_flags)

        return {
            "verification_id": "",
            "dossier_id": dossier.get("dossier_id", ""),
            "verification_level": level,
            "evidence_confidence": confidence,
            "risk_band": risk_band,
            "proof_completeness": self._bounded_score(weighted),
            "source_integrity": integrity,
            "verified_source_count": source_count,
            "critical_warnings": risk_flags,
            "verification_dimensions": {
                "protocol_architecture": protocol,
                "team_governance": team,
                "market_traction": traction,
                "security_risk": security,
                "delivery_proof": delivery,
                "token_design": token,
                "evidence_integrity": integrity,
            },
            "fact_check_hash": "",
            "verification_hash": "",
            "verified_at": "",
            "expires_at": "",
            "summary": self._report_summary(level, risk_band, confidence),
            "strengths": self._strengths(manifest, protocol, security, integrity),
            "risks": risk_flags,
            "recommended_evidence": self._recommendations(risk_flags),
            "confidence": confidence,
        }

    def _append_verification_history(self, dossier_id: str, report: dict) -> None:
        raw = self.verification_history.get(dossier_id)
        history = json.loads(raw) if raw else []
        history.append(report)
        self.verification_history[dossier_id] = json.dumps(history)

    def _append_proof_event(self, dossier_id: str, actor: str, event_type: str, related_hash: str, summary: str) -> None:
        now = str(self._now())
        event_id = self._hash({
            "dossier_id": dossier_id,
            "actor": actor,
            "event_type": event_type,
            "related_hash": related_hash,
            "timestamp": now,
            "index": int(self.proof_event_count),
        })[:34]
        event_hash = self._hash({
            "event_id": event_id,
            "dossier_id": dossier_id,
            "actor": actor,
            "event_type": event_type,
            "related_hash": related_hash,
            "summary": summary,
            "timestamp": now,
        })
        event = {
            "event_id": event_id,
            "dossier_id": dossier_id,
            "actor": actor,
            "event_type": event_type,
            "event_hash": event_hash,
            "related_hash": related_hash,
            "summary": summary,
            "timestamp": now,
        }

        raw = self.proof_ledger.get(dossier_id)
        ledger = json.loads(raw) if raw else []
        ledger.append(event)
        self.proof_ledger[dossier_id] = json.dumps(ledger)
        self.proof_events[event_id] = json.dumps(event)
        self.proof_event_count = u256(int(self.proof_event_count) + 1)

        dossier_raw = self.dossiers.get(dossier_id)
        if dossier_raw:
            dossier = json.loads(dossier_raw)
            dossier["proof_event_count"] = len(ledger)
            self.dossiers[dossier_id] = json.dumps(dossier)

    def _update_registry_entry(self, dossier: dict, report: dict) -> None:
        entry = {
            "dossier_id": dossier.get("dossier_id", ""),
            "project_id": dossier.get("dossier_id", ""),
            "name": dossier.get("name", ""),
            "project_name": dossier.get("name", ""),
            "category": dossier.get("category", "Other"),
            "website": dossier.get("website", ""),
            "verification_level": report.get("verification_level", "UNVERIFIABLE"),
            "evidence_confidence": report.get("evidence_confidence", 0),
            "risk_band": report.get("risk_band", "UNKNOWN"),
            "proof_completeness": report.get("proof_completeness", 0),
            "verified_source_count": report.get("verified_source_count", 0),
            "last_verified_at": report.get("verified_at", ""),
            "expires_at": report.get("expires_at", ""),
            "registry_position": 0,
            "overall_score": report.get("evidence_confidence", 0),
            "tier": self._legacy_tier(str(report.get("verification_level", "UNVERIFIABLE"))),
            "last_evaluated": report.get("verified_at", ""),
        }
        self._upsert_registry("overall", entry)
        self._upsert_registry(str(dossier.get("category", "Other")), entry)

    def _upsert_registry(self, category: str, entry: dict) -> None:
        key = self._registry_key(category)
        raw = self.registry.get(key)
        entries = json.loads(raw) if raw else []
        dossier_id = entry.get("dossier_id", "")
        entries = [item for item in entries if item.get("dossier_id", item.get("project_id", "")) != dossier_id]
        entries.append(entry)
        entries.sort(key=lambda x: (
            self._risk_sort_value(str(x.get("risk_band", "UNKNOWN"))),
            -self._bounded_score(x.get("evidence_confidence", x.get("overall_score", 0))),
        ))
        for i, item in enumerate(entries):
            item["registry_position"] = i + 1
            item["rank"] = i + 1
        self.registry[key] = json.dumps(entries)

    def _update_issuer_after_verification(self, issuer: str, dossier: dict, report: dict) -> None:
        profile = self._get_profile_dict(issuer)
        total_verified = int(profile.get("verified_dossiers", 0))
        avg = self._safe_int(profile.get("average_evidence_confidence", 0))
        confidence = self._bounded_score(report.get("evidence_confidence", 0))

        profile["verified_dossiers"] = total_verified + 1
        profile["average_evidence_confidence"] = round((avg * total_verified + confidence) / (total_verified + 1), 1)
        if str(report.get("risk_band", "UNKNOWN")) in ["HIGH", "CRITICAL"]:
            profile["high_risk_dossiers"] = int(profile.get("high_risk_dossiers", 0)) + 1
        profile["latest_activity_at"] = str(self._now())
        self.issuer_profiles[issuer] = json.dumps(profile)

    def _init_issuer_profile(self, issuer: str) -> None:
        if self.issuer_profiles.get(issuer) is None:
            self.issuer_profiles[issuer] = json.dumps(self._default_issuer_profile(issuer))

    def _bump_issuer_profile(self, issuer: str, key: str, amount: int) -> None:
        profile = self._get_profile_dict(issuer)
        profile[key] = int(profile.get(key, 0)) + amount
        profile["latest_activity_at"] = str(self._now())
        self.issuer_profiles[issuer] = json.dumps(profile)

    def _get_profile_dict(self, issuer: str) -> dict:
        raw = self.issuer_profiles.get(issuer)
        return json.loads(raw) if raw else self._default_issuer_profile(issuer)

    def _default_issuer_profile(self, issuer: str) -> dict:
        return {
            "issuer": issuer,
            "wallet_address": issuer,
            "submitted_dossiers": 0,
            "verified_dossiers": 0,
            "average_evidence_confidence": 0,
            "high_risk_dossiers": 0,
            "stale_dossiers": 0,
            "latest_activity_at": str(self._now()),
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

    def _load_dossier(self, dossier_id: str) -> dict:
        data = self.dossiers.get(dossier_id)
        assert data is not None, "Dossier not found"
        return json.loads(data)

    def _load_manifest(self, dossier_id: str) -> dict:
        data = self.evidence_manifests.get(dossier_id)
        assert data is not None, "Evidence manifest not found"
        return json.loads(data)

    def _manifest_sources(self, manifest: dict) -> list:
        sources = []
        self._maybe_source(sources, "website", manifest.get("website", ""))
        self._maybe_source(sources, "whitepaper", manifest.get("whitepaper_url", ""))
        self._maybe_source(sources, "docs", manifest.get("docs_url", ""))
        self._maybe_source(sources, "bug_bounty", manifest.get("bug_bounty_url", ""))
        self._maybe_source(sources, "verification_document", manifest.get("verification_document_url", ""))
        for repo in manifest.get("github_repos", []):
            if isinstance(repo, dict):
                self._maybe_source(sources, "github", repo.get("url", ""))
            else:
                self._maybe_source(sources, "github", repo)
        for audit in manifest.get("audits", []):
            if isinstance(audit, dict):
                self._maybe_source(sources, "audit", audit.get("report_url", audit.get("url", "")))
        for file_item in manifest.get("evidence_files", []):
            if isinstance(file_item, dict):
                self._maybe_source(sources, "evidence_file", file_item.get("url", ""))
            else:
                self._maybe_source(sources, "evidence_file", file_item)
        return sources[:20]

    def _maybe_source(self, sources: list, source_type: str, url: str) -> None:
        text = self._clean_text(str(url), 500)
        if len(text) > 0:
            sources.append({
                "source_type": source_type,
                "url": text,
                "status": "submitted",
                "note": "Public source supplied for verification.",
            })

    def _missing_evidence(self, manifest: dict) -> list:
        missing = []
        if len(str(manifest.get("docs_url", ""))) == 0:
            missing.append("Documentation URL missing")
        if len(str(manifest.get("whitepaper_url", ""))) == 0:
            missing.append("Whitepaper URL missing")
        if len(manifest.get("github_repos", [])) == 0:
            missing.append("GitHub repository evidence missing")
        if len(manifest.get("audits", [])) == 0:
            missing.append("Security audit evidence missing")
        if len(manifest.get("team", [])) == 0:
            missing.append("Team or governance evidence missing")
        if len(str(manifest.get("bug_bounty_url", ""))) == 0:
            missing.append("Bug bounty evidence missing")
        if len(manifest.get("tokenomics", {}).keys()) == 0:
            missing.append("Tokenomics evidence missing")
        return missing

    def _risk_flags(self, manifest: dict, source_count: int, missing: list) -> list:
        flags = []
        if len(manifest.get("audits", [])) == 0:
            flags.append("MISSING_AUDIT")
        if len(manifest.get("team", [])) == 0:
            flags.append("UNVERIFIABLE_TEAM")
        if len(str(manifest.get("docs_url", ""))) == 0:
            flags.append("INACCESSIBLE_DOCS")
        if len(manifest.get("github_repos", [])) == 0:
            flags.append("THIN_GITHUB")
        if len(manifest.get("tokenomics", {}).keys()) == 0:
            flags.append("TOKENOMICS_UNCLEAR")
        if len(str(manifest.get("roadmap", ""))) == 0:
            flags.append("ROADMAP_UNVERIFIABLE")
        if source_count < 3:
            flags.append("LOW_SOURCE_COUNT")
        if len(str(manifest.get("bug_bounty_url", ""))) == 0:
            flags.append("SECURITY_EVIDENCE_WEAK")
        return flags[:8]

    def _fact_summary(self, status: str, source_count: int, missing: list) -> str:
        if status == "VERIFIED":
            return "Submitted claims have broad public source coverage."
        if status == "PARTIAL":
            return "Several claims are supported, but the dossier still has evidence gaps."
        if status == "WEAK":
            return "Public evidence is thin and important claims remain weakly supported."
        return "The dossier cannot be verified from the supplied public evidence."

    def _verified_claims(self, dossier: dict, manifest: dict, source_count: int) -> list:
        claims = []
        if source_count > 0:
            claims.append("Issuer supplied public evidence URLs for verification.")
        if len(str(manifest.get("website", ""))) > 0:
            claims.append("Official website was supplied.")
        if len(manifest.get("audits", [])) > 0:
            claims.append("Security audit evidence was supplied.")
        if len(manifest.get("github_repos", [])) > 0:
            claims.append("GitHub repository evidence was supplied.")
        return claims[:6]

    def _strengths(self, manifest: dict, protocol: int, security: int, integrity: int) -> list:
        strengths = []
        if protocol >= 75:
            strengths.append("Strong protocol documentation and architecture evidence.")
        if security >= 75:
            strengths.append("Security evidence includes audits or bug bounty coverage.")
        if integrity >= 75:
            strengths.append("Evidence manifest contains multiple public sources.")
        if len(manifest.get("github_repos", [])) > 0:
            strengths.append("Open repository evidence improves transparency.")
        return strengths[:5]

    def _recommendations(self, flags: list) -> list:
        recommendations = []
        if "MISSING_AUDIT" in flags:
            recommendations.append("Add a public security audit report.")
        if "THIN_GITHUB" in flags:
            recommendations.append("Add relevant GitHub repositories or development evidence.")
        if "UNVERIFIABLE_TEAM" in flags:
            recommendations.append("Add verifiable team or governance documentation.")
        if "TOKENOMICS_UNCLEAR" in flags:
            recommendations.append("Add tokenomics documentation with supply and utility details.")
        if "LOW_SOURCE_COUNT" in flags:
            recommendations.append("Add more public evidence sources before refreshing verification.")
        return recommendations[:6]

    def _report_summary(self, level: str, risk_band: str, confidence: int) -> str:
        return "Verification level " + level + " with " + str(confidence) + "% evidence confidence and " + risk_band + " risk."

    def _status_from_report(self, report: dict) -> str:
        level = str(report.get("verification_level", "UNVERIFIABLE"))
        if level in ["VERIFIED_PLUS", "VERIFIED"]:
            return "VERIFIED"
        if level in ["SUBSTANTIATED", "DEVELOPING"]:
            return "PARTIAL"
        if level in ["LIMITED_EVIDENCE", "HIGH_RISK"]:
            return "WEAK"
        return "UNVERIFIABLE"

    def _verification_level(self, score: int, flags: list) -> str:
        bounded = self._bounded_score(score)
        if "LOW_SOURCE_COUNT" in flags and bounded > 74:
            bounded = 74
        if "MISSING_AUDIT" in flags and bounded > 84:
            bounded = 84
        if bounded >= 95:
            return "VERIFIED_PLUS"
        if bounded >= 85:
            return "VERIFIED"
        if bounded >= 75:
            return "SUBSTANTIATED"
        if bounded >= 65:
            return "DEVELOPING"
        if bounded >= 50:
            return "LIMITED_EVIDENCE"
        if bounded >= 30:
            return "HIGH_RISK"
        return "UNVERIFIABLE"

    def _risk_band(self, score: int, flags: list) -> str:
        if len(flags) >= 7:
            return "CRITICAL"
        if score < 30:
            return "CRITICAL"
        if score < 50 or len(flags) >= 5:
            return "HIGH"
        if score < 65 or len(flags) >= 3:
            return "ELEVATED"
        if score < 80 or len(flags) >= 1:
            return "MODERATE"
        return "LOW"

    def _legacy_tier(self, level: str) -> str:
        if level == "VERIFIED_PLUS":
            return "S+"
        if level == "VERIFIED":
            return "S"
        if level == "SUBSTANTIATED":
            return "A"
        if level == "DEVELOPING":
            return "B"
        if level == "LIMITED_EVIDENCE":
            return "C"
        if level == "HIGH_RISK":
            return "D"
        return "F"

    def _risk_sort_value(self, risk: str) -> int:
        if risk == "LOW":
            return 0
        if risk == "MODERATE":
            return 1
        if risk == "ELEVATED":
            return 2
        if risk == "HIGH":
            return 3
        if risk == "CRITICAL":
            return 4
        return 5

    def _has_text(self, value: str) -> int:
        return 1 if len(str(value)) > 0 else 0

    def _registry_key(self, category: str) -> str:
        key = str(category).lower()
        if key == "":
            return "overall"
        return key

    def _generate_dossier_id(self, issuer: str, name: str) -> str:
        raw = issuer + ":" + name + ":" + str(int(self.dossier_count)) + ":" + str(self._now())
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    def _generate_verification_id(self, dossier_id: str, timestamp: str) -> str:
        raw = dossier_id + ":" + timestamp + ":" + str(int(self.verification_count))
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    def _hash(self, data: dict) -> str:
        serialized = json.dumps(data, sort_keys=True)
        return "0x" + hashlib.sha256(serialized.encode()).hexdigest()

    def _collect_exact_fee(self, configured_fee: u256, fee_type: str) -> None:
        required = configured_fee if self.fees_enabled else u256(0)
        paid = gl.message.value
        assert int(paid) == int(required), "Incorrect protocol fee sent"
        if int(paid) > 0:
            self.treasury = u256(int(self.treasury) + int(paid))
            self._append_proof_event("treasury", str(gl.message.sender_address), "FEE_PAID", str(int(paid)), fee_type)

    def _bounded_score(self, value) -> int:
        try:
            score = int(value)
        except Exception:
            score = 0
        if score < 0:
            return 0
        if score > 100:
            return 100
        return score

    def _safe_int(self, value) -> int:
        try:
            return int(value)
        except Exception:
            return 0

    def _safe_json_array(self, raw: str) -> list:
        if raw is None or raw == "":
            return []
        if isinstance(raw, list):
            return raw
        try:
            parsed = json.loads(raw)
            return parsed if isinstance(parsed, list) else []
        except Exception:
            return []

    def _safe_json_object(self, raw: str) -> dict:
        if raw is None or raw == "":
            return {}
        if isinstance(raw, dict):
            return raw
        try:
            parsed = json.loads(raw)
            return parsed if isinstance(parsed, dict) else {}
        except Exception:
            return {}

    def _clean_text(self, value: str, max_len: int) -> str:
        if value is None:
            return ""
        text = str(value)
        if len(text) > max_len:
            return text[:max_len]
        return text

    def _now(self) -> int:
        try:
            return int(gl.block.timestamp)
        except Exception:
            return 0
