import type {
  AuditReport,
  Dossier,
  EvidenceManifest,
  Evaluation,
  FactCheckReport,
  HistoricalScore,
  IssuerProfile,
  LeaderboardEntry,
  Profile,
  ProofEvent,
  ProjectCategory,
  Project,
  ProjectStatus,
  RankTier,
  Ranking,
  RegistryEntry,
  RiskBand,
  TeamMember,
  Tokenomics,
  TreasuryState,
  VerificationLevel,
  VerificationReport,
} from '@/types';

export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== 'string') {
    return (value as T) ?? fallback;
  }

  const text = value.trim();
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function safeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function safeObject<T extends Record<string, unknown>>(value: unknown, fallback: T): T {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as T) : fallback;
}

export function parseTokenomics(value: unknown): Tokenomics {
  const source = safeObject<Record<string, unknown>>(value, {});
  return {
    symbol: safeString(source.symbol || source.token_symbol),
    total_supply: safeString(source.total_supply || source.supply),
    utility: safeString(source.utility),
    emission_schedule: safeString(source.emission_schedule || source.emissions),
  };
}

export function parseAudit(value: unknown): AuditReport {
  const source = safeObject<Record<string, unknown>>(value, {});
  return {
    firm: safeString(source.firm || source.auditor),
    report_url: safeString(source.report_url || source.url),
    audit_date: safeString(source.audit_date || source.date),
  };
}

export function parseTeamMember(value: unknown): TeamMember {
  const source = safeObject<Record<string, unknown>>(value, {});
  return {
    name: safeString(source.name),
    role: safeString(source.role),
    linkedin: safeString(source.linkedin),
    x: safeString(source.x || source.twitter),
  };
}

export function parseProject(raw: unknown): Project | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    project_id: safeString(parsed.project_id || parsed.dossier_id),
    owner: safeString(parsed.owner || parsed.issuer),
    name: safeString(parsed.name),
    category: safeString(parsed.category, 'Other') as ProjectCategory,
    website: safeString(parsed.website),
    description: safeString(parsed.description),
    whitepaper_url: safeString(parsed.whitepaper_url),
    docs_url: safeString(parsed.docs_url),
    verification_document_url: safeString(parsed.verification_document_url),
    github_repos: safeArray<unknown>(parsed.github_repos).map((entry) =>
      typeof entry === 'string' ? entry : safeString((entry as { url?: unknown }).url),
    ).filter(Boolean),
    roadmap: safeString(parsed.roadmap),
    tokenomics: parseTokenomics(parsed.tokenomics),
    audits: safeArray(parsed.audits).map(parseAudit),
    team: safeArray(parsed.team).map(parseTeamMember),
    investors: safeArray<string>(parsed.investors).map((item) => safeString(item)).filter(Boolean),
    partnerships: safeArray<string>(parsed.partnerships).map((item) => safeString(item)).filter(Boolean),
    bug_bounty_url: safeString(parsed.bug_bounty_url),
    ecosystem_integrations: safeArray<string>(parsed.ecosystem_integrations).map((item) => safeString(item)).filter(Boolean),
    evidence_hash: safeString(parsed.evidence_hash),
    fact_check_hash: safeString(parsed.fact_check_hash),
    fact_checked_at: safeString(parsed.fact_checked_at || parsed.last_verified_at),
    verification_score: safeNumber(parsed.verification_score || parsed.evidence_confidence),
    verification_status: safeString(parsed.verification_status || parsed.current_verification_level, 'UNVERIFIED'),
    verified_source_count: safeNumber(parsed.verified_source_count),
    locked_at: safeString(parsed.locked_at),
    status: safeString(parsed.status, 'draft') as ProjectStatus,
    created_at: safeString(parsed.created_at),
    updated_at: safeString(parsed.updated_at),
  };
}

export function parseDossier(raw: unknown): Dossier | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    dossier_id: safeString(parsed.dossier_id || parsed.project_id),
    issuer: safeString(parsed.issuer || parsed.owner),
    name: safeString(parsed.name || parsed.project_name),
    category: safeString(parsed.category, 'Other') as ProjectCategory,
    website: safeString(parsed.website),
    description: safeString(parsed.description),
    status: safeString(parsed.status, 'DRAFT') as ProjectStatus,
    evidence_hash: safeString(parsed.evidence_hash),
    current_verification_hash: safeString(parsed.current_verification_hash || parsed.evaluation_hash),
    current_verification_level: safeString(parsed.current_verification_level || parsed.verification_level || parsed.tier || 'UNVERIFIED') as VerificationLevel,
    evidence_confidence: safeNumber(parsed.evidence_confidence || parsed.overall_score || parsed.verification_score),
    risk_band: safeString(parsed.risk_band, 'UNKNOWN') as RiskBand,
    verified_source_count: safeNumber(parsed.verified_source_count),
    proof_event_count: safeNumber(parsed.proof_event_count),
    verification_count: safeNumber(parsed.verification_count || parsed.total_evaluations),
    created_at: safeString(parsed.created_at),
    updated_at: safeString(parsed.updated_at),
    locked_at: safeString(parsed.locked_at),
    last_verified_at: safeString(parsed.last_verified_at || parsed.evaluated_at || parsed.last_evaluated),
    expires_at: safeString(parsed.expires_at),
  };
}

export function parseEvidenceManifest(raw: unknown): EvidenceManifest | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    dossier_id: safeString(parsed.dossier_id || parsed.project_id),
    website: safeString(parsed.website),
    whitepaper_url: safeString(parsed.whitepaper_url),
    docs_url: safeString(parsed.docs_url),
    github_repos: safeArray<unknown>(parsed.github_repos).map((entry) =>
      typeof entry === 'string' ? entry : safeString((entry as { url?: unknown }).url),
    ).filter(Boolean),
    roadmap: safeString(parsed.roadmap),
    tokenomics: parseTokenomics(parsed.tokenomics),
    audits: safeArray(parsed.audits).map(parseAudit),
    team: safeArray(parsed.team).map(parseTeamMember),
    investors: safeArray<string>(parsed.investors).map((item) => safeString(item)).filter(Boolean),
    partnerships: safeArray<string>(parsed.partnerships).map((item) => safeString(item)).filter(Boolean),
    bug_bounty_url: safeString(parsed.bug_bounty_url),
    ecosystem_integrations: safeArray<string>(parsed.ecosystem_integrations).map((item) => safeString(item)).filter(Boolean),
    verification_document_url: safeString(parsed.verification_document_url),
    evidence_files: safeArray<Record<string, unknown>>(parsed.evidence_files).map((file) => ({
      name: safeString(file.name),
      url: safeString(file.url),
      path: safeString(file.path),
      size: safeNumber(file.size),
      type: safeString(file.type),
    })).filter((file) => file.url),
    submitted_at: safeString(parsed.submitted_at || parsed.created_at),
    locked_at: safeString(parsed.locked_at),
    evidence_hash: safeString(parsed.evidence_hash),
  };
}

export function parseFactCheck(raw: unknown): FactCheckReport | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    verification_score: safeNumber(parsed.verification_score),
    verification_status: safeString(parsed.verification_status, 'UNVERIFIABLE'),
    confidence: safeNumber(parsed.confidence),
    verified_source_count: safeNumber(parsed.verified_source_count),
    summary: safeString(parsed.summary),
    verified_claims: safeArray<string>(parsed.verified_claims).map((item) => safeString(item)).filter(Boolean),
    contradictions: safeArray<string>(parsed.contradictions).map((item) => safeString(item)).filter(Boolean),
    missing_evidence: safeArray<string>(parsed.missing_evidence).map((item) => safeString(item)).filter(Boolean),
    source_summaries: safeArray(parsed.source_summaries).map((item) => {
      const source = safeObject<Record<string, unknown>>(item, {});
      return {
        source_type: safeString(source.source_type, 'unknown'),
        url: safeString(source.url),
        status: safeString(source.status, 'unknown'),
        note: safeString(source.note),
      };
    }),
    fact_check_hash: safeString(parsed.fact_check_hash),
    project_id: safeString(parsed.project_id),
    checked_at: safeString(parsed.checked_at),
  };
}

export function parseEvaluation(raw: unknown): Evaluation | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    evaluation_id: safeString(parsed.evaluation_id || parsed.verification_id),
    project_id: safeString(parsed.project_id || parsed.dossier_id),
    protocol_architecture_score: safeNumber(parsed.protocol_architecture_score || safeObject<Record<string, unknown>>(parsed.verification_dimensions, {}).protocol_architecture),
    team_governance_score: safeNumber(parsed.team_governance_score || safeObject<Record<string, unknown>>(parsed.verification_dimensions, {}).team_governance),
    market_traction_score: safeNumber(parsed.market_traction_score || safeObject<Record<string, unknown>>(parsed.verification_dimensions, {}).market_traction),
    security_risk_score: safeNumber(parsed.security_risk_score || safeObject<Record<string, unknown>>(parsed.verification_dimensions, {}).security_risk),
    delivery_proof_score: safeNumber(parsed.delivery_proof_score || safeObject<Record<string, unknown>>(parsed.verification_dimensions, {}).delivery_proof),
    token_design_score: safeNumber(parsed.token_design_score || safeObject<Record<string, unknown>>(parsed.verification_dimensions, {}).token_design),
    evidence_integrity_score: safeNumber(parsed.evidence_integrity_score || safeObject<Record<string, unknown>>(parsed.verification_dimensions, {}).evidence_integrity || parsed.source_integrity),
    overall_score: safeNumber(parsed.overall_score || parsed.evidence_confidence),
    score_model_version: safeString(parsed.score_model_version, 'VERIDEX_DOSSIER_V1'),
    tier: safeString(parsed.tier || verificationLevelToTier(safeString(parsed.verification_level)), 'F') as RankTier,
    verification_score: safeNumber(parsed.verification_score),
    verification_status: safeString(parsed.verification_status || parsed.verification_level, 'UNVERIFIABLE'),
    verified_source_count: safeNumber(parsed.verified_source_count),
    fact_check_hash: safeString(parsed.fact_check_hash),
    fact_check_summary: safeString(parsed.fact_check_summary || parsed.summary),
    confidence: safeNumber(parsed.confidence),
    strengths: safeArray<string>(parsed.strengths).map((item) => safeString(item)).filter(Boolean),
    weaknesses: safeArray<string>(parsed.weaknesses || parsed.risks).map((item) => safeString(item)).filter(Boolean),
    recommendations: safeArray<string>(parsed.recommendations || parsed.recommended_evidence).map((item) => safeString(item)).filter(Boolean),
    evaluation_hash: safeString(parsed.evaluation_hash || parsed.verification_hash),
    evaluated_at: safeString(parsed.evaluated_at || parsed.verified_at),
  };
}

export function parseVerificationReport(raw: unknown): VerificationReport | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  const dimensions = safeObject<Record<string, unknown>>(parsed.verification_dimensions, {});

  return {
    verification_id: safeString(parsed.verification_id || parsed.evaluation_id),
    dossier_id: safeString(parsed.dossier_id || parsed.project_id),
    verification_level: safeString(parsed.verification_level || parsed.tier || 'UNVERIFIABLE') as VerificationLevel,
    evidence_confidence: safeNumber(parsed.evidence_confidence || parsed.overall_score),
    risk_band: safeString(parsed.risk_band, 'UNKNOWN') as RiskBand,
    proof_completeness: safeNumber(parsed.proof_completeness || parsed.overall_score),
    source_integrity: safeNumber(parsed.source_integrity || parsed.evidence_integrity_score),
    verified_source_count: safeNumber(parsed.verified_source_count),
    critical_warnings: safeArray<string>(parsed.critical_warnings || parsed.risks).map((item) => safeString(item)).filter(Boolean),
    verification_dimensions: {
      protocol_architecture: safeNumber(dimensions.protocol_architecture || parsed.protocol_architecture_score),
      team_governance: safeNumber(dimensions.team_governance || parsed.team_governance_score),
      market_traction: safeNumber(dimensions.market_traction || parsed.market_traction_score),
      security_risk: safeNumber(dimensions.security_risk || parsed.security_risk_score),
      delivery_proof: safeNumber(dimensions.delivery_proof || parsed.delivery_proof_score),
      token_design: safeNumber(dimensions.token_design || parsed.token_design_score),
      evidence_integrity: safeNumber(dimensions.evidence_integrity || parsed.evidence_integrity_score),
    },
    fact_check_hash: safeString(parsed.fact_check_hash),
    verification_hash: safeString(parsed.verification_hash || parsed.evaluation_hash),
    verified_at: safeString(parsed.verified_at || parsed.evaluated_at),
    expires_at: safeString(parsed.expires_at),
    summary: safeString(parsed.summary || parsed.fact_check_summary),
    strengths: safeArray<string>(parsed.strengths).map((item) => safeString(item)).filter(Boolean),
    risks: safeArray<string>(parsed.risks || parsed.weaknesses).map((item) => safeString(item)).filter(Boolean),
    recommended_evidence: safeArray<string>(parsed.recommended_evidence || parsed.recommendations).map((item) => safeString(item)).filter(Boolean),
    confidence: safeNumber(parsed.confidence || parsed.evidence_confidence || parsed.overall_score),
  };
}

export function parseRanking(raw: unknown): Ranking | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    project_id: safeString(parsed.project_id),
    project_name: safeString(parsed.project_name),
    category: safeString(parsed.category, 'Other') as ProjectCategory,
    overall_score: safeNumber(parsed.overall_score),
    tier: safeString(parsed.tier, 'F') as RankTier,
    overall_rank: safeNumber(parsed.overall_rank || parsed.rank_position),
    category_rank: safeNumber(parsed.category_rank),
    updated_at: safeString(parsed.updated_at),
  };
}

export function parseLeaderboard(raw: unknown): LeaderboardEntry[] {
  const parsed = safeArray<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, []) : raw,
    [],
  );

  return parsed.map((entry) => ({
    rank: safeNumber(entry.rank || entry.registry_position),
    project_id: safeString(entry.project_id || entry.dossier_id),
    project_name: safeString(entry.project_name || entry.name),
    category: safeString(entry.category, 'Other') as ProjectCategory,
    website: safeString(entry.website),
    overall_score: safeNumber(entry.overall_score || entry.evidence_confidence),
    tier: safeString(entry.tier || verificationLevelToTier(safeString(entry.verification_level)), 'F') as RankTier,
    protocol_architecture_score: safeNumber(entry.protocol_architecture_score),
    team_governance_score: safeNumber(entry.team_governance_score),
    market_traction_score: safeNumber(entry.market_traction_score),
    security_risk_score: safeNumber(entry.security_risk_score),
    delivery_proof_score: safeNumber(entry.delivery_proof_score),
    token_design_score: safeNumber(entry.token_design_score),
    evidence_integrity_score: safeNumber(entry.evidence_integrity_score || entry.source_integrity || entry.proof_completeness),
    last_evaluated: safeString(entry.last_evaluated || entry.last_verified_at),
  }));
}

export function parseRegistry(raw: unknown): RegistryEntry[] {
  const parsed = safeArray<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, []) : raw,
    [],
  );

  return parsed.map((entry) => ({
    dossier_id: safeString(entry.dossier_id || entry.project_id),
    name: safeString(entry.name || entry.project_name),
    category: safeString(entry.category, 'Other') as ProjectCategory,
    website: safeString(entry.website),
    verification_level: safeString(entry.verification_level || entry.tier || 'UNVERIFIABLE') as VerificationLevel,
    evidence_confidence: safeNumber(entry.evidence_confidence || entry.overall_score),
    risk_band: safeString(entry.risk_band, 'UNKNOWN') as RiskBand,
    proof_completeness: safeNumber(entry.proof_completeness || entry.overall_score),
    verified_source_count: safeNumber(entry.verified_source_count),
    last_verified_at: safeString(entry.last_verified_at || entry.last_evaluated),
    expires_at: safeString(entry.expires_at),
    registry_position: safeNumber(entry.registry_position || entry.rank),
  }));
}

export function parseHistoricalScores(raw: unknown): HistoricalScore[] {
  const parsed = safeArray<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, []) : raw,
    [],
  );

  return parsed.map((entry) => ({
    project_id: safeString(entry.project_id || entry.dossier_id),
    old_score: safeNumber(entry.old_score),
    new_score: safeNumber(entry.new_score || entry.evidence_confidence),
    delta: safeNumber(entry.delta),
    old_tier: safeString(entry.old_tier, 'F') as RankTier,
    new_tier: safeString(entry.new_tier || verificationLevelToTier(safeString(entry.verification_level)), 'F') as RankTier,
    timestamp: safeString(entry.timestamp || entry.verified_at),
    evaluation_id: safeString(entry.evaluation_id || entry.verification_id),
  }));
}

export function parseProofLedger(raw: unknown): ProofEvent[] {
  const parsed = safeArray<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, []) : raw,
    [],
  );

  return parsed.map((event) => ({
    event_id: safeString(event.event_id),
    dossier_id: safeString(event.dossier_id),
    actor: safeString(event.actor),
    event_type: safeString(event.event_type),
    event_hash: safeString(event.event_hash),
    related_hash: safeString(event.related_hash),
    summary: safeString(event.summary),
    timestamp: safeString(event.timestamp),
  }));
}

export function parseProfile(raw: unknown): Profile | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    wallet_address: safeString(parsed.wallet_address || parsed.issuer),
    display_name: safeString(parsed.display_name),
    bio: safeString(parsed.bio),
    twitter: safeString(parsed.twitter),
    github: safeString(parsed.github),
    total_projects: safeNumber(parsed.total_projects || parsed.submitted_dossiers),
    total_evaluations: safeNumber(parsed.total_evaluations || parsed.verified_dossiers),
    average_score: safeNumber(parsed.average_score || parsed.average_evidence_confidence),
    best_score: safeNumber(parsed.best_score || parsed.average_evidence_confidence),
    credibility_score: safeNumber(parsed.credibility_score || parsed.average_evidence_confidence),
    consistency_score: safeNumber(parsed.consistency_score),
    security_rating: safeNumber(parsed.security_rating),
    execution_rating: safeNumber(parsed.execution_rating),
    evidence_rating: safeNumber(parsed.evidence_rating),
    created_at: safeString(parsed.created_at),
  };
}

export function parseIssuerProfile(raw: unknown): IssuerProfile | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    issuer: safeString(parsed.issuer || parsed.wallet_address),
    submitted_dossiers: safeNumber(parsed.submitted_dossiers || parsed.total_projects),
    verified_dossiers: safeNumber(parsed.verified_dossiers || parsed.total_evaluations),
    average_evidence_confidence: safeNumber(parsed.average_evidence_confidence || parsed.average_score),
    high_risk_dossiers: safeNumber(parsed.high_risk_dossiers),
    stale_dossiers: safeNumber(parsed.stale_dossiers),
    latest_activity_at: safeString(parsed.latest_activity_at || parsed.created_at),
  };
}

export function parseTreasuryState(raw: unknown): TreasuryState | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    total_fees_collected: safeString(parsed.total_fees_collected || '0'),
    contract_balance: safeString(parsed.contract_balance || '0'),
    create_project_fee: safeString(parsed.create_project_fee || parsed.create_dossier_fee || '0'),
    evaluation_fee: safeString(parsed.evaluation_fee || parsed.verification_fee || '0'),
    reevaluation_fee: safeString(parsed.reevaluation_fee || parsed.refresh_fee || '0'),
    create_dossier_fee: safeString(parsed.create_dossier_fee || parsed.create_project_fee || '0'),
    verification_fee: safeString(parsed.verification_fee || parsed.evaluation_fee || '0'),
    refresh_fee: safeString(parsed.refresh_fee || parsed.reevaluation_fee || '0'),
    fees_enabled: safeBoolean(parsed.fees_enabled),
    owner: safeString(parsed.owner),
  };
}

function verificationLevelToTier(level: string): RankTier {
  switch (level) {
    case 'VERIFIED_PLUS':
      return 'S+';
    case 'VERIFIED':
      return 'S';
    case 'SUBSTANTIATED':
      return 'A';
    case 'DEVELOPING':
      return 'B';
    case 'LIMITED_EVIDENCE':
      return 'C';
    case 'HIGH_RISK':
      return 'D';
    default:
      return 'F';
  }
}
