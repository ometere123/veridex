import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import type {
  Dossier,
  EvidenceManifest,
  Evaluation,
  HistoricalScore,
  IssuerProfile,
  LeaderboardEntry,
  Profile,
  Project,
  ProofEvent,
  Ranking,
  RegistryEntry,
  VerificationReport,
} from '@/types';
import {
  parseDossier,
  parseEvidenceManifest,
  parseEvaluation,
  parseFactCheck,
  parseHistoricalScores,
  parseIssuerProfile,
  parseLeaderboard,
  parseProfile,
  parseProject,
  parseProofLedger,
  parseRanking,
  parseRegistry,
  parseTreasuryState,
  parseVerificationReport,
} from './parsers';
import { VERIDEX_CONTRACT_ADDRESS } from './veridex-contract';

type CalldataEncodable = string | number | bigint | boolean | null | Uint8Array | CalldataEncodable[] | { [k: string]: CalldataEncodable };

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';
const CONTRACT_ADDRESS = VERIDEX_CONTRACT_ADDRESS;

function getReadClient() {
  // Use the official studionet chain - includes all required SDK fields
  return createClient({ chain: studionet, endpoint: RPC_ENDPOINT });
}

export function getGenLayerClient(account?: string) {
  return createClient({
    chain: studionet,
    endpoint: RPC_ENDPOINT,
    account: account ? (account as `0x${string}`) : undefined,
  });
}

export async function glReadContract(method: string, args: CalldataEncodable[] = []): Promise<unknown> {
  const client = getReadClient();
  return client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
  });
}

export async function glReadContractFallback(
  primaryMethod: string,
  fallbackMethod: string,
  args: CalldataEncodable[] = [],
): Promise<unknown> {
  try {
    return await glReadContract(primaryMethod, args);
  } catch (primaryError) {
    try {
      return await glReadContract(fallbackMethod, args);
    } catch {
      throw primaryError;
    }
  }
}

export async function glWriteContract(
  method: string,
  args: CalldataEncodable[],
  account: string,
  value?: bigint
): Promise<string> {
  // In server-side API routes, we call via the RPC directly.
  // Browser-side calls use window.ethereum through the wagmi hook.
  const client = createClient({
    chain: studionet,
    endpoint: RPC_ENDPOINT,
    account: account as `0x${string}`,
  });

  const writeParams = value !== undefined
    ? { address: CONTRACT_ADDRESS, functionName: method, args, value }
    : { address: CONTRACT_ADDRESS, functionName: method, args, value: BigInt(0) };

  const txHash = await client.writeContract(writeParams);

  return txHash as string;
}

// ── Read helpers ──────────────────────────────────────────────────

export async function getDossier(dossierId: string): Promise<Dossier | null> {
  const result = await glReadContractFallback('get_dossier', 'get_project', [dossierId]);
  return parseDossier(result);
}

export async function getEvidenceManifest(dossierId: string): Promise<EvidenceManifest | null> {
  try {
    const result = await glReadContract('get_evidence_manifest', [dossierId]);
    return parseEvidenceManifest(result);
  } catch {
    const project = await getProject(dossierId);
    if (!project) return null;
    return parseEvidenceManifest(JSON.stringify({
      dossier_id: project.project_id,
      website: project.website,
      whitepaper_url: project.whitepaper_url,
      docs_url: project.docs_url,
      github_repos: project.github_repos,
      roadmap: project.roadmap,
      tokenomics: project.tokenomics,
      audits: project.audits,
      team: project.team,
      investors: project.investors,
      partnerships: project.partnerships,
      bug_bounty_url: project.bug_bounty_url,
      ecosystem_integrations: project.ecosystem_integrations,
      verification_document_url: project.verification_document_url,
      evidence_files: [],
      submitted_at: project.created_at,
      locked_at: project.locked_at,
      evidence_hash: project.evidence_hash,
    }));
  }
}

export async function getVerificationReport(dossierId: string): Promise<VerificationReport | null> {
  const result = await glReadContractFallback('get_verification_report', 'get_evaluation', [dossierId]);
  return parseVerificationReport(result);
}

export async function getVerificationHistory(dossierId: string): Promise<HistoricalScore[]> {
  const result = await glReadContractFallback('get_verification_history', 'get_historical_scores', [dossierId]);
  return parseHistoricalScores(result);
}

export async function getProofLedger(dossierId: string): Promise<ProofEvent[]> {
  try {
    const result = await glReadContract('get_proof_ledger', [dossierId]);
    return parseProofLedger(result);
  } catch {
    return [];
  }
}

export async function getRegistry(category: string = 'overall'): Promise<RegistryEntry[]> {
  const result = await glReadContractFallback('get_registry', 'get_leaderboard', [category.toLowerCase()]);
  return parseRegistry(result);
}

export async function getIssuerProfile(wallet: string): Promise<IssuerProfile | null> {
  const result = await glReadContractFallback('get_issuer_profile', 'get_profile', [wallet]);
  return parseIssuerProfile(result);
}

export async function getProject(projectId: string): Promise<Project | null> {
  const result = await glReadContractFallback('get_dossier', 'get_project', [projectId]);
  return parseProject(result);
}

export async function getEvaluation(projectId: string): Promise<Evaluation | null> {
  const result = await glReadContractFallback('get_verification_report', 'get_evaluation', [projectId]);
  return parseEvaluation(result);
}

export async function getFactCheck(projectId: string) {
  const result = await glReadContract('get_fact_check', [projectId]);
  return parseFactCheck(result);
}

export async function getRanking(projectId: string): Promise<Ranking | null> {
  const result = await glReadContract('get_ranking', [projectId]);
  return parseRanking(result);
}

export async function getLeaderboard(category: string = 'overall'): Promise<LeaderboardEntry[]> {
  const result = await glReadContractFallback('get_registry', 'get_leaderboard', [category.toLowerCase()]);
  return parseLeaderboard(result);
}

export async function getProfile(wallet: string): Promise<Profile | null> {
  const result = await glReadContractFallback('get_issuer_profile', 'get_profile', [wallet]);
  return parseProfile(result);
}

export async function getHistoricalScores(projectId: string): Promise<HistoricalScore[]> {
  const result = await glReadContractFallback('get_verification_history', 'get_historical_scores', [projectId]);
  return parseHistoricalScores(result);
}

export async function getTotalProjects(): Promise<number> {
  const result = await glReadContractFallback('get_total_dossiers', 'get_total_projects', []);
  return Number(result);
}

export async function getTotalEvaluations(): Promise<number> {
  const result = await glReadContractFallback('get_total_verifications', 'get_total_evaluations', []);
  return Number(result);
}

export async function getTreasuryState(): Promise<{
  create_project_fee: string;
  evaluation_fee: string;
  reevaluation_fee: string;
  create_dossier_fee?: string;
  verification_fee?: string;
  refresh_fee?: string;
  fees_enabled: boolean;
  total_fees_collected: string;
  contract_balance: string;
  owner: string;
} | null> {
  try {
    const result = await glReadContract('get_treasury_state', []);
    return parseTreasuryState(result);
  } catch {
    return null;
  }
}

export async function getProtocolFees(): Promise<{
  fees_enabled: boolean;
  create_project_fee: string;
  evaluation_fee: string;
  reevaluation_fee: string;
  create_dossier_fee: string;
  verification_fee: string;
  refresh_fee: string;
}> {
  try {
    const result = await glReadContract('get_protocol_fees', []);
    const parsed = parseTreasuryState(result);
    if (!parsed) {
      return {
        fees_enabled: false,
        create_project_fee: '0',
        evaluation_fee: '0',
        reevaluation_fee: '0',
        create_dossier_fee: '0',
        verification_fee: '0',
        refresh_fee: '0',
      };
    }
    return {
      fees_enabled: parsed.fees_enabled,
      create_project_fee: parsed.create_project_fee,
      evaluation_fee: parsed.evaluation_fee,
      reevaluation_fee: parsed.reevaluation_fee,
      create_dossier_fee: parsed.create_dossier_fee || parsed.create_project_fee,
      verification_fee: parsed.verification_fee || parsed.evaluation_fee,
      refresh_fee: parsed.refresh_fee || parsed.reevaluation_fee,
    };
  } catch {
    return {
      fees_enabled: false,
      create_project_fee: '0',
      evaluation_fee: '0',
      reevaluation_fee: '0',
      create_dossier_fee: '0',
      verification_fee: '0',
      refresh_fee: '0',
    };
  }
}
