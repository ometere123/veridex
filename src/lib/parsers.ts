import type {
  AuditReport,
  Evaluation,
  FactCheckReport,
  HistoricalScore,
  LeaderboardEntry,
  Profile,
  ProjectCategory,
  Project,
  ProjectStatus,
  RankTier,
  Ranking,
  TeamMember,
  Tokenomics,
  TreasuryState,
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
    project_id: safeString(parsed.project_id),
    owner: safeString(parsed.owner),
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
    fact_checked_at: safeString(parsed.fact_checked_at),
    verification_score: safeNumber(parsed.verification_score),
    verification_status: safeString(parsed.verification_status, 'unverified'),
    verified_source_count: safeNumber(parsed.verified_source_count),
    locked_at: safeString(parsed.locked_at),
    status: safeString(parsed.status, 'draft') as ProjectStatus,
    created_at: safeString(parsed.created_at),
    updated_at: safeString(parsed.updated_at),
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
    evaluation_id: safeString(parsed.evaluation_id),
    project_id: safeString(parsed.project_id),
    protocol_architecture_score: safeNumber(parsed.protocol_architecture_score),
    team_governance_score: safeNumber(parsed.team_governance_score),
    market_traction_score: safeNumber(parsed.market_traction_score),
    security_risk_score: safeNumber(parsed.security_risk_score),
    delivery_proof_score: safeNumber(parsed.delivery_proof_score),
    token_design_score: safeNumber(parsed.token_design_score),
    evidence_integrity_score: safeNumber(parsed.evidence_integrity_score),
    overall_score: safeNumber(parsed.overall_score),
    score_model_version: safeString(parsed.score_model_version),
    tier: safeString(parsed.tier, 'F') as RankTier,
    verification_score: safeNumber(parsed.verification_score),
    verification_status: safeString(parsed.verification_status, 'UNVERIFIABLE'),
    verified_source_count: safeNumber(parsed.verified_source_count),
    fact_check_hash: safeString(parsed.fact_check_hash),
    fact_check_summary: safeString(parsed.fact_check_summary),
    confidence: safeNumber(parsed.confidence),
    strengths: safeArray<string>(parsed.strengths).map((item) => safeString(item)).filter(Boolean),
    weaknesses: safeArray<string>(parsed.weaknesses).map((item) => safeString(item)).filter(Boolean),
    recommendations: safeArray<string>(parsed.recommendations).map((item) => safeString(item)).filter(Boolean),
    evaluation_hash: safeString(parsed.evaluation_hash),
    evaluated_at: safeString(parsed.evaluated_at),
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
    rank: safeNumber(entry.rank),
    project_id: safeString(entry.project_id),
    project_name: safeString(entry.project_name),
    category: safeString(entry.category, 'Other') as ProjectCategory,
    website: safeString(entry.website),
    overall_score: safeNumber(entry.overall_score),
    tier: safeString(entry.tier, 'F') as RankTier,
    protocol_architecture_score: safeNumber(entry.protocol_architecture_score),
    team_governance_score: safeNumber(entry.team_governance_score),
    market_traction_score: safeNumber(entry.market_traction_score),
    security_risk_score: safeNumber(entry.security_risk_score),
    delivery_proof_score: safeNumber(entry.delivery_proof_score),
    token_design_score: safeNumber(entry.token_design_score),
    evidence_integrity_score: safeNumber(entry.evidence_integrity_score),
    last_evaluated: safeString(entry.last_evaluated),
  }));
}

export function parseHistoricalScores(raw: unknown): HistoricalScore[] {
  const parsed = safeArray<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, []) : raw,
    [],
  );

  return parsed.map((entry) => ({
    project_id: safeString(entry.project_id),
    old_score: safeNumber(entry.old_score),
    new_score: safeNumber(entry.new_score),
    delta: safeNumber(entry.delta),
    old_tier: safeString(entry.old_tier, 'F') as RankTier,
    new_tier: safeString(entry.new_tier, 'F') as RankTier,
    timestamp: safeString(entry.timestamp),
    evaluation_id: safeString(entry.evaluation_id),
  }));
}

export function parseProfile(raw: unknown): Profile | null {
  const parsed = safeObject<Record<string, unknown>>(
    typeof raw === 'string' ? safeJsonParse(raw, {}) : raw,
    {},
  );
  if (Object.keys(parsed).length === 0) return null;

  return {
    wallet_address: safeString(parsed.wallet_address),
    display_name: safeString(parsed.display_name),
    bio: safeString(parsed.bio),
    twitter: safeString(parsed.twitter),
    github: safeString(parsed.github),
    total_projects: safeNumber(parsed.total_projects),
    total_evaluations: safeNumber(parsed.total_evaluations),
    average_score: safeNumber(parsed.average_score),
    best_score: safeNumber(parsed.best_score),
    credibility_score: safeNumber(parsed.credibility_score),
    consistency_score: safeNumber(parsed.consistency_score),
    security_rating: safeNumber(parsed.security_rating),
    execution_rating: safeNumber(parsed.execution_rating),
    evidence_rating: safeNumber(parsed.evidence_rating),
    created_at: safeString(parsed.created_at),
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
    create_project_fee: safeString(parsed.create_project_fee || '0'),
    evaluation_fee: safeString(parsed.evaluation_fee || '0'),
    reevaluation_fee: safeString(parsed.reevaluation_fee || '0'),
    fees_enabled: safeBoolean(parsed.fees_enabled),
    owner: safeString(parsed.owner),
  };
}
