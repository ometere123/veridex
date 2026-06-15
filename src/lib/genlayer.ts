import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import type { Project, Evaluation, Ranking, LeaderboardEntry, Profile, HistoricalScore } from '@/types';
import {
  parseEvaluation,
  parseFactCheck,
  parseHistoricalScores,
  parseLeaderboard,
  parseProfile,
  parseProject,
  parseRanking,
  parseTreasuryState,
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

export async function getProject(projectId: string): Promise<Project | null> {
  const result = await glReadContract('get_project', [projectId]);
  return parseProject(result);
}

export async function getEvaluation(projectId: string): Promise<Evaluation | null> {
  const result = await glReadContract('get_evaluation', [projectId]);
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
  const result = await glReadContract('get_leaderboard', [category.toLowerCase()]);
  return parseLeaderboard(result);
}

export async function getProfile(wallet: string): Promise<Profile | null> {
  const result = await glReadContract('get_profile', [wallet]);
  return parseProfile(result);
}

export async function getHistoricalScores(projectId: string): Promise<HistoricalScore[]> {
  const result = await glReadContract('get_historical_scores', [projectId]);
  return parseHistoricalScores(result);
}

export async function getTotalProjects(): Promise<number> {
  const result = await glReadContract('get_total_projects', []);
  return Number(result);
}

export async function getTotalEvaluations(): Promise<number> {
  const result = await glReadContract('get_total_evaluations', []);
  return Number(result);
}

export async function getTreasuryState(): Promise<{
  create_project_fee: string;
  evaluation_fee: string;
  reevaluation_fee: string;
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

export async function getProtocolFees() {
  try {
    const result = await glReadContract('get_protocol_fees', []);
    const parsed = parseTreasuryState(result);
    if (!parsed) {
      return {
        fees_enabled: false,
        create_project_fee: '0',
        evaluation_fee: '0',
        reevaluation_fee: '0',
      };
    }
    return {
      fees_enabled: parsed.fees_enabled,
      create_project_fee: parsed.create_project_fee,
      evaluation_fee: parsed.evaluation_fee,
      reevaluation_fee: parsed.reevaluation_fee,
    };
  } catch {
    return {
      fees_enabled: false,
      create_project_fee: '0',
      evaluation_fee: '0',
      reevaluation_fee: '0',
    };
  }
}
