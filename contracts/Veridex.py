# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import hashlib
import datetime


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

        # ---- Stage 1: Deterministic submission-completeness check ----
        # Checks which evidence fields are filled and counts sources.
        # This is NOT the final verdict - it is stored for transparency only.
        readiness = self._run_readiness_check(dossier, manifest)
        readiness_hash = self._hash(readiness)
        now_str = str(self._now())
        readiness["dossier_id"] = dossier_id
        readiness["readiness_hash"] = readiness_hash
        readiness["checked_at"] = now_str
        self.fact_checks[dossier_id] = json.dumps(readiness)
        self._append_proof_event(
            dossier_id, self.owner, "READINESS_CHECK_COMPLETED", readiness_hash,
            "Submission completeness pre-check stored."
        )

        # ---- Stage 2: Non-deterministic GenLayer AI verification ----
        # Validators each fetch source URLs live and run LLM-based claim evaluation.
        # Consensus is reached via the GenLayer Equivalence Principle.
        sources = self._manifest_sources(manifest)
        source_pairs = [(s.get("source_type", ""), s.get("url", "")) for s in sources[:6]]

        # Snapshot scalar values for closure capture (GenLayer contract safety)
        proj_name = self._clean_text(str(dossier.get("name", "")), 100)
        proj_category = self._clean_text(str(dossier.get("category", "")), 80)
        proj_description = self._clean_text(str(dossier.get("description", "")), 400)
        team_count = str(len(manifest.get("team", [])))
        audit_count = str(len(manifest.get("audits", [])))
        partner_count = str(len(manifest.get("partnerships", [])))
        integration_count = str(len(manifest.get("ecosystem_integrations", [])))
        has_whitepaper = "yes" if manifest.get("whitepaper_url", "") else "no"
        has_docs = "yes" if manifest.get("docs_url", "") else "no"
        has_github = "yes" if manifest.get("github_repos", []) else "no"
        has_bug_bounty = "yes" if manifest.get("bug_bounty_url", "") else "no"
        roadmap_excerpt = self._clean_text(str(manifest.get("roadmap", "")), 300)
        audits_json = json.dumps(manifest.get("audits", []))[:400]
        investors_json = json.dumps(manifest.get("investors", []))[:300]
        partnerships_json = json.dumps(manifest.get("partnerships", []))[:300]
        tokenomics_json = json.dumps(manifest.get("tokenomics", {}))[:300]
        readiness_score = str(readiness.get("submission_completeness_score", 0))

        # Step 2a: Fetch all source URLs with strict equivalence.
        # All validators must agree on the fetched content before AI analysis proceeds.
        def fetch_all_sources() -> str:
            results = []
            for src_type, url in source_pairs:
                if not url:
                    continue
                try:
                    resp = gl.nondet.web.get(url)
                    text = resp.body.decode("utf-8", errors="replace")[:1200]
                    results.append({
                        "source_type": src_type,
                        "url": url,
                        "reachable": True,
                        "content_preview": text,
                    })
                except Exception:
                    results.append({
                        "source_type": src_type,
                        "url": url,
                        "reachable": False,
                        "content_preview": "",
                    })
            return json.dumps(results)

        fetched_json = gl.eq_principle.strict_eq(fetch_all_sources)
        fetched_sources = json.loads(fetched_json) if fetched_json else []

        # Step 2b: AI-based claim evaluation with non-comparative equivalence.
        # The LLM evaluates whether fetched content supports the submitted claims.
        def get_ai_input() -> str:
            return json.dumps({
                "project": {
                    "name": proj_name,
                    "category": proj_category,
                    "description": proj_description,
                },
                "submitted_claims": {
                    "team_member_count": team_count,
                    "security_audit_count": audit_count,
                    "partnership_count": partner_count,
                    "ecosystem_integration_count": integration_count,
                    "has_whitepaper": has_whitepaper,
                    "has_official_docs": has_docs,
                    "has_github_repos": has_github,
                    "has_bug_bounty": has_bug_bounty,
                    "roadmap_excerpt": roadmap_excerpt,
                    "audits": audits_json,
                    "investors": investors_json,
                    "partnerships": partnerships_json,
                    "tokenomics": tokenomics_json,
                    "submission_completeness_score": readiness_score,
                },
                "fetched_sources": fetched_sources,
            })

        ai_task = (
            "You are a blockchain protocol verification analyst conducting an on-chain source verification. "
            "You have been given a project's submitted claims and the actual content fetched live from their submitted source URLs. "
            "Your job is to evaluate whether the fetched source content supports, contradicts, or cannot verify the submitted claims. "
            "IMPORTANT: Base your verdict ONLY on what you can observe in the fetched_sources content. "
            "Do NOT invent or assume information that is not present in the fetched content. "
            "If a source is unreachable (reachable: false), treat all claims dependent on it as UNVERIFIABLE. "
            "If a source is reachable but the content does not mention the claimed information, treat it as UNVERIFIABLE (not CONTRADICTED). "
            "Only mark a claim as CONTRADICTED if the fetched content explicitly contradicts it. "
            "\n\n"
            "Return ONLY a valid JSON object. No markdown. No code fences. No explanation outside the JSON. "
            "The JSON must match this exact schema (replace placeholder values):\n"
            '{"schema":"veridex_verification_v1",'
            '"verdict":"VERIFIED",'
            '"confidence":0,'
            '"protocol_architecture":0,'
            '"team_governance":0,'
            '"market_traction":0,'
            '"security_risk":0,'
            '"delivery_proof":0,'
            '"token_design":0,'
            '"evidence_integrity":0,'
            '"sources_checked":0,'
            '"sources_failed":0,'
            '"material_findings":['
            '{"claim":"","status":"SUPPORTED","source_url":"","reason":""}],'
            '"risk_flags":[],'
            '"short_reason":""}'
            "\n\n"
            "Field rules:\n"
            "- verdict: one of VERIFIED, PARTIALLY_VERIFIED, UNVERIFIABLE, CONFLICTING_EVIDENCE, REJECTED\n"
            "  VERIFIED = 80%+ of verifiable claims supported by fetched content\n"
            "  PARTIALLY_VERIFIED = 50-79% of verifiable claims supported\n"
            "  UNVERIFIABLE = key sources unreachable or content too sparse to evaluate\n"
            "  CONFLICTING_EVIDENCE = fetched content explicitly contradicts submitted claims\n"
            "  REJECTED = clear misrepresentation or fabricated evidence detected\n"
            "- confidence: integer 0-100 based strictly on source-grounded evidence strength\n"
            "- dimension scores: each 0-100 based only on evidence found in fetched content\n"
            "  protocol_architecture: whitepaper, docs, github content quality\n"
            "  team_governance: verifiable team identity and governance structure\n"
            "  market_traction: partnerships, integrations, investor backing confirmed in sources\n"
            "  security_risk: audit reports, bug bounty evidence confirmed\n"
            "  delivery_proof: roadmap, github activity, mainnet deployment evidence\n"
            "  token_design: tokenomics detail verified from sources\n"
            "  evidence_integrity: overall source quality and coverage\n"
            "- sources_checked: integer count of reachable sources\n"
            "- sources_failed: integer count of unreachable sources\n"
            "- material_findings: array of 3-8 specific claim checks\n"
            "  Each finding: claim (brief claim name), status (SUPPORTED|PARTIAL|CONTRADICTED|UNVERIFIABLE), source_url (the URL checked), reason (one sentence)\n"
            "- risk_flags: array of stable uppercase labels e.g. UNVERIFIABLE_TEAM, AUDIT_NOT_CONFIRMED, DOCS_UNREACHABLE, GITHUB_EMPTY\n"
            "- short_reason: exactly one sentence summarizing the overall verdict"
        )

        verdict_json = gl.eq_principle.prompt_non_comparative(
            get_ai_input,
            task=ai_task,
        )

        # ---- Stage 3: Parse verdict and build final on-chain report ----
        ai_verdict = self._parse_ai_verdict(verdict_json, readiness, fetched_sources)

        # Enrich fact_checks entry with AI findings (backward-compat fields kept)
        readiness["summary"] = ai_verdict.get("short_reason", readiness.get("summary", ""))
        readiness["verification_score"] = ai_verdict.get("confidence", readiness.get("submission_completeness_score", 0))
        readiness["verified_source_count"] = ai_verdict.get("sources_checked", readiness.get("verified_source_count", 0))
        readiness["material_findings"] = ai_verdict.get("material_findings", [])
        readiness["verified_claims"] = [
            f["claim"] + ": " + f["reason"]
            for f in ai_verdict.get("material_findings", [])
            if f.get("status") == "SUPPORTED"
        ][:6]
        readiness["source_summaries"] = [
            {"source_type": s.get("source_type", ""), "url": s.get("url", ""), "status": "verified" if s.get("reachable") else "unreachable"}
            for s in fetched_sources
        ]
        self.fact_checks[dossier_id] = json.dumps(readiness)

        # Build final verification report
        report = self._build_report_from_ai_verdict(dossier, manifest, ai_verdict, readiness, fetched_sources)

        verification_hash = self._hash(report)
        now = str(self._now())
        verification_id = self._generate_verification_id(dossier_id, now)
        expires_at = str(self._now() + int(self.verification_window_days) * 86400)

        report["verification_id"] = verification_id
        report["dossier_id"] = dossier_id
        report["readiness_hash"] = readiness_hash
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
        self._append_proof_event(dossier_id, self.owner, "VERIFICATION_COMPLETED", verification_hash, "AI-grounded verification report stored on-chain.")

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
            "version": "VERIDEX_DOSSIER_V2",
            "verification_engine": "GenLayer_AI_NonDet",
            "verification_levels": [
                "VERIFIED_PLUS",
                "VERIFIED",
                "SUBSTANTIATED",
                "DEVELOPING",
                "LIMITED_EVIDENCE",
                "HIGH_RISK",
                "UNVERIFIABLE",
            ],
            "ai_verdicts": [
                "VERIFIED",
                "PARTIALLY_VERIFIED",
                "UNVERIFIABLE",
                "CONFLICTING_EVIDENCE",
                "REJECTED",
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

    # ---- Legacy aliases (backward compatibility) ----

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
            name, category, website, description, whitepaper_url, docs_url,
            github_repos, roadmap, tokenomics, audits, team, investors,
            partnerships, bug_bounty_url, ecosystem_integrations,
            verification_document_url, "[]",
        )

    @gl.public.write
    def update_project_before_lock(self, project_id: str, name: str, category: str, website: str, description: str, whitepaper_url: str, docs_url: str, github_repos: str, roadmap: str, tokenomics: str, audits: str, team: str, investors: str, partnerships: str, bug_bounty_url: str, ecosystem_integrations: str) -> None:
        self.update_dossier_before_lock(project_id, name, category, website, description, whitepaper_url, docs_url, github_repos, roadmap, tokenomics, audits, team, investors, partnerships, bug_bounty_url, ecosystem_integrations, "", "[]")

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

    # ---- Private: readiness / completeness pre-check (deterministic) ----

    def _run_readiness_check(self, dossier: dict, manifest: dict) -> dict:
        """
        Deterministic submission-completeness check.
        Counts which evidence fields are present. Does NOT fetch URLs.
        Stored for transparency but NOT used as the final verdict.
        """
        sources = self._manifest_sources(manifest)
        source_count = len(sources)
        missing = self._missing_evidence(manifest)
        # Formula: readiness based on field completeness, capped at 100
        completeness_score = max(0, min(100, 20 + source_count * 10 - len(missing) * 6))

        if source_count == 0:
            completeness_status = "INCOMPLETE"
        elif completeness_score >= 80:
            completeness_status = "COMPLETE"
        elif completeness_score >= 55:
            completeness_status = "MOSTLY_COMPLETE"
        elif completeness_score >= 30:
            completeness_status = "PARTIAL"
        else:
            completeness_status = "INCOMPLETE"

        return {
            "dossier_id": dossier.get("dossier_id", ""),
            "readiness_hash": "",
            "submission_completeness_score": completeness_score,
            "completeness_status": completeness_status,
            # Legacy field names kept for UI backward compatibility
            "verification_score": completeness_score,
            "verification_status": completeness_status,
            "confidence": min(95, max(20, completeness_score + 5)),
            "verified_source_count": source_count,
            "summary": self._readiness_summary(completeness_status, source_count, missing),
            "verified_claims": self._supplied_claims(dossier, manifest, source_count),
            "contradictions": [],
            "missing_evidence": missing,
            "source_summaries": sources,
            "material_findings": [],
            "checked_at": "",
        }

    def _readiness_summary(self, status: str, source_count: int, missing: list) -> str:
        if status == "COMPLETE":
            return f"Submission is complete with {source_count} evidence sources. Awaiting AI source verification."
        if status == "MOSTLY_COMPLETE":
            return f"Submission has {source_count} evidence sources with {len(missing)} missing field(s). Awaiting AI source verification."
        if status == "PARTIAL":
            return f"Submission is partially complete with {source_count} source(s). Several required fields are missing."
        return "Submission is incomplete. Add required evidence fields before running verification."

    def _supplied_claims(self, dossier: dict, manifest: dict, source_count: int) -> list:
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

    # ---- Private: AI verdict parsing and normalization ----

    def _parse_ai_verdict(self, verdict_json: str, readiness: dict, fetched_sources: list) -> dict:
        """Parse AI JSON output; fall back gracefully on malformed response."""
        default_confidence = self._bounded_score(readiness.get("submission_completeness_score", 0))
        sources_checked = sum(1 for s in fetched_sources if s.get("reachable", False))
        sources_failed = sum(1 for s in fetched_sources if not s.get("reachable", True))

        try:
            raw = str(verdict_json).strip()
            # Strip markdown fences if the LLM wrapped output
            if raw.startswith("```"):
                lines = raw.split("\n")
                raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
            data = json.loads(raw)
        except Exception:
            # Return a safe fallback verdict if JSON parsing fails
            return {
                "schema": "veridex_verification_v1",
                "verdict": "UNVERIFIABLE",
                "confidence": min(default_confidence, 50),
                "protocol_architecture": 0,
                "team_governance": 0,
                "market_traction": 0,
                "security_risk": 0,
                "delivery_proof": 0,
                "token_design": 0,
                "evidence_integrity": 0,
                "sources_checked": sources_checked,
                "sources_failed": sources_failed,
                "material_findings": [],
                "risk_flags": ["AI_PARSE_ERROR"],
                "short_reason": "AI verdict could not be parsed; verification is inconclusive.",
            }

        # Clamp numeric fields
        for field in ["confidence", "protocol_architecture", "team_governance", "market_traction",
                      "security_risk", "delivery_proof", "token_design", "evidence_integrity"]:
            data[field] = self._bounded_score(data.get(field, 0))

        # Normalize verdict enum
        valid_verdicts = {"VERIFIED", "PARTIALLY_VERIFIED", "UNVERIFIABLE", "CONFLICTING_EVIDENCE", "REJECTED"}
        if str(data.get("verdict", "")) not in valid_verdicts:
            data["verdict"] = "UNVERIFIABLE"

        # Normalize material_findings
        findings = data.get("material_findings", [])
        if not isinstance(findings, list):
            findings = []
        valid_statuses = {"SUPPORTED", "PARTIAL", "CONTRADICTED", "UNVERIFIABLE"}
        clean_findings = []
        for f in findings[:10]:
            if isinstance(f, dict):
                f_status = str(f.get("status", "UNVERIFIABLE"))
                if f_status not in valid_statuses:
                    f_status = "UNVERIFIABLE"
                clean_findings.append({
                    "claim": self._clean_text(str(f.get("claim", "")), 120),
                    "status": f_status,
                    "source_url": self._clean_text(str(f.get("source_url", "")), 300),
                    "reason": self._clean_text(str(f.get("reason", "")), 300),
                })
        data["material_findings"] = clean_findings

        # Normalize risk_flags
        flags = data.get("risk_flags", [])
        if not isinstance(flags, list):
            flags = []
        data["risk_flags"] = [self._clean_text(str(f), 60) for f in flags[:10]]

        # Fill in actual source counts from fetched data
        data["sources_checked"] = sources_checked
        data["sources_failed"] = sources_failed

        data["short_reason"] = self._clean_text(str(data.get("short_reason", "")), 300)

        return data

    # ---- Private: build final report from AI verdict ----

    def _build_report_from_ai_verdict(
        self, dossier: dict, manifest: dict, ai_verdict: dict, readiness: dict, fetched_sources: list
    ) -> dict:
        """
        Build the on-chain verification report from the AI verdict.
        Confidence and all dimension scores come from the AI, not from field counting.
        """
        confidence = self._bounded_score(ai_verdict.get("confidence", 0))
        sources_checked = int(ai_verdict.get("sources_checked", 0))
        risk_flags = list(ai_verdict.get("risk_flags", []))

        # Supplement risk flags based on source fetch failures
        sources_failed = int(ai_verdict.get("sources_failed", 0))
        if sources_failed > 0 and "SOURCES_UNREACHABLE" not in risk_flags:
            risk_flags.append("SOURCES_UNREACHABLE")

        level = self._verification_level_from_verdict(ai_verdict.get("verdict", "UNVERIFIABLE"), confidence, risk_flags)
        risk_band = self._risk_band(confidence, risk_flags)

        return {
            "verification_id": "",
            "dossier_id": dossier.get("dossier_id", ""),
            # AI-sourced verdict fields
            "ai_verdict": ai_verdict.get("verdict", "UNVERIFIABLE"),
            "verification_level": level,
            "evidence_confidence": confidence,
            "risk_band": risk_band,
            # Dimension scores from AI
            "verification_dimensions": {
                "protocol_architecture": self._bounded_score(ai_verdict.get("protocol_architecture", 0)),
                "team_governance": self._bounded_score(ai_verdict.get("team_governance", 0)),
                "market_traction": self._bounded_score(ai_verdict.get("market_traction", 0)),
                "security_risk": self._bounded_score(ai_verdict.get("security_risk", 0)),
                "delivery_proof": self._bounded_score(ai_verdict.get("delivery_proof", 0)),
                "token_design": self._bounded_score(ai_verdict.get("token_design", 0)),
                "evidence_integrity": self._bounded_score(ai_verdict.get("evidence_integrity", 0)),
            },
            # Source metadata
            "verified_source_count": sources_checked,
            "sources_checked": sources_checked,
            "sources_failed": sources_failed,
            "source_count": len(fetched_sources),
            # Completeness metadata
            "submission_completeness_score": readiness.get("submission_completeness_score", 0),
            "readiness_hash": "",
            # Findings and flags
            "material_findings": ai_verdict.get("material_findings", []),
            "critical_warnings": risk_flags,
            "risks": risk_flags,
            # Backward-compat summary fields
            "proof_completeness": self._bounded_score(readiness.get("submission_completeness_score", 0)),
            "source_integrity": self._bounded_score(ai_verdict.get("evidence_integrity", 0)),
            "summary": self._report_summary(level, risk_band, confidence),
            "strengths": self._strengths_from_verdict(ai_verdict),
            "recommended_evidence": self._recommendations(risk_flags),
            "confidence": confidence,
            # Hash/time fields filled after return
            "verification_hash": "",
            "verified_at": "",
            "expires_at": "",
            "fact_check_hash": readiness.get("readiness_hash", ""),
        }

    def _verification_level_from_verdict(self, verdict: str, confidence: int, flags: list) -> str:
        """Map AI verdict + confidence to the existing verification level taxonomy."""
        if verdict == "REJECTED":
            return "UNVERIFIABLE"
        if verdict == "CONFLICTING_EVIDENCE":
            return "HIGH_RISK"
        if verdict == "UNVERIFIABLE":
            if confidence >= 50:
                return "LIMITED_EVIDENCE"
            return "UNVERIFIABLE"
        # VERIFIED or PARTIALLY_VERIFIED - use confidence thresholds
        bounded = self._bounded_score(confidence)
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

    def _strengths_from_verdict(self, ai_verdict: dict) -> list:
        strengths = []
        findings = ai_verdict.get("material_findings", [])
        supported = [f for f in findings if f.get("status") == "SUPPORTED"]
        for f in supported[:3]:
            strengths.append(f.get("claim", "") + ": " + f.get("reason", ""))
        if ai_verdict.get("protocol_architecture", 0) >= 75:
            strengths.append("Protocol architecture evidence verified from live sources.")
        if ai_verdict.get("security_risk", 0) >= 75:
            strengths.append("Security evidence confirmed in live source content.")
        return strengths[:5]

    # ---- Private: shared helpers (unchanged) ----

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
            "ai_verdict": report.get("ai_verdict", "UNVERIFIABLE"),
            "evidence_confidence": report.get("evidence_confidence", 0),
            "risk_band": report.get("risk_band", "UNKNOWN"),
            "proof_completeness": report.get("proof_completeness", 0),
            "verified_source_count": report.get("verified_source_count", 0),
            "sources_checked": report.get("sources_checked", 0),
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
                "note": "Submitted for live verification.",
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

    def _recommendations(self, flags: list) -> list:
        recommendations = []
        if "MISSING_AUDIT" in flags or "AUDIT_NOT_CONFIRMED" in flags:
            recommendations.append("Add a public security audit report URL.")
        if "THIN_GITHUB" in flags or "GITHUB_EMPTY" in flags:
            recommendations.append("Add relevant GitHub repositories or development evidence.")
        if "UNVERIFIABLE_TEAM" in flags:
            recommendations.append("Add verifiable team or governance documentation.")
        if "TOKENOMICS_UNCLEAR" in flags:
            recommendations.append("Add tokenomics documentation with supply and utility details.")
        if "LOW_SOURCE_COUNT" in flags or "SOURCES_UNREACHABLE" in flags:
            recommendations.append("Ensure all submitted URLs are publicly accessible.")
        if "DOCS_UNREACHABLE" in flags or "INACCESSIBLE_DOCS" in flags:
            recommendations.append("Ensure documentation URL is publicly accessible.")
        return recommendations[:6]

    def _report_summary(self, level: str, risk_band: str, confidence: int) -> str:
        return "AI verification level " + level + " with " + str(confidence) + "% source-grounded confidence and " + risk_band + " risk."

    def _status_from_report(self, report: dict) -> str:
        level = str(report.get("verification_level", "UNVERIFIABLE"))
        if level in ["VERIFIED_PLUS", "VERIFIED"]:
            return "VERIFIED"
        if level in ["SUBSTANTIATED", "DEVELOPING"]:
            return "PARTIAL"
        if level in ["LIMITED_EVIDENCE", "HIGH_RISK"]:
            return "WEAK"
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
        # GenLayer has no gl.block API; GenVM pins datetime deterministically per tx.
        try:
            return int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        except Exception:
            return 0
