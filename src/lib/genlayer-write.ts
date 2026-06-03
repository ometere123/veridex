/**
 * genlayer-write.ts — Client-side GenLayer write service.
 * New contract flow (v0.2.17+):
 *   create_project → lock_project_data → submit_evaluation → run_evaluation
 *   run_evaluation does ALL ranking: scores, leaderboard, history, status=ranked
 *   finalize_score is NOT part of the normal flow.
 */

import { createClient, abi } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

const calldata = abi.calldata;

const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ||
  '0x07c480420A27736CAC316a7eb4E67A11f5106f3D'
) as `0x${string}`;

const CHAIN = studionet;
const CHAIN_ID_HEX = `0x${CHAIN.id.toString(16)}`;
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';

// ── Provider ─────────────────────────────────────────────────────

type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  providers?: EthProvider[];
};

function getProvider(): EthProvider {
  if (typeof window === 'undefined') throw new Error('Browser only');
  const win = window as Window & { ethereum?: EthProvider };
  if (!win.ethereum) throw new Error('No wallet detected. Please install MetaMask.');
  if (Array.isArray(win.ethereum.providers)) {
    const mm = win.ethereum.providers.find((p: EthProvider) => p.isMetaMask && !p.isBraveWallet);
    return mm ?? win.ethereum.providers[0] ?? win.ethereum;
  }
  return win.ethereum;
}

async function ensureGenLayerChain(): Promise<void> {
  let provider: EthProvider;
  try { provider = getProvider(); } catch { return; }
  const chainParams = {
    chainId: CHAIN_ID_HEX,
    chainName: 'GenLayer Studionet',
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    rpcUrls: [RPC_ENDPOINT],
    blockExplorerUrls: ['https://studio.genlayer.com'],
  };
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID_HEX }] });
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code === 4001) throw new Error('Network switch rejected. Please approve in your wallet.');
    if (code === 4902 || code === -32603) {
      try {
        await provider.request({ method: 'wallet_addEthereumChain', params: [chainParams] });
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID_HEX }] });
      } catch (addErr: unknown) {
        if ((addErr as { code?: number }).code === 4001) throw new Error('Please approve adding the GenLayer network.');
        console.warn('wallet_addEthereumChain not supported, proceeding:', addErr);
      }
    } else {
      console.warn('wallet_switchEthereumChain non-fatal:', err);
    }
  }
}

function getBrowserClient(account: string) {
  if (!account || !account.startsWith('0x')) throw new Error('Invalid wallet address.');
  return createClient({ chain: CHAIN, endpoint: RPC_ENDPOINT, account: account as `0x${string}`, provider: getProvider() });
}

// ── Core write helpers ────────────────────────────────────────────

export async function glWriteAndWait(method: string, args: string[], account: string, strictWait = true): Promise<string> {
  await ensureGenLayerChain();
  const client = getBrowserClient(account);
  const txHash = await client.writeContract({ address: CONTRACT_ADDRESS, functionName: method, args, value: BigInt(0) });
  try {
    await client.waitForTransactionReceipt({ hash: txHash as `0x${string}` & { length: 66 }, status: TransactionStatus.FINALIZED });
  } catch (waitErr) {
    if (strictWait) throw new Error(`${method} did not finalize in time (tx: ${txHash}). Wait and retry.`);
    console.warn(`waitForTransactionReceipt non-fatal for ${method}:`, waitErr);
  }
  return txHash as string;
}

// ── Decode base64 leader_receipt result ──────────────────────────

function decodeLeaderResult(b64: string): string | null {
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Try offset 1 (skip header byte)
    try { const d = calldata.decode(bytes.slice(1)); if (typeof d === 'string' && d.length > 0) return d; } catch {}
    // Try offset 0
    try { const d = calldata.decode(bytes); if (typeof d === 'string' && d.length > 0) return d; } catch {}
    // Raw ASCII offset 3 (32-char hex project IDs)
    const ascii = new TextDecoder().decode(bytes.slice(3));
    if (/^[0-9a-f]{32}$/.test(ascii)) return ascii;
    return null;
  } catch { return null; }
}

async function fetchTxResult(txHash: string): Promise<string | null> {
  try {
    const res = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionByHash', params: [txHash] }),
    });
    const data = await res.json() as { result?: { consensus_data?: { leader_receipt?: Array<{ result?: string }> } } };
    const b64 = data?.result?.consensus_data?.leader_receipt?.[0]?.result;
    return b64 ? decodeLeaderResult(b64) : null;
  } catch { return null; }
}

export async function glWriteAndGetResult(method: string, args: string[], account: string): Promise<unknown> {
  await ensureGenLayerChain();
  const client = getBrowserClient(account);
  const txHash = await client.writeContract({ address: CONTRACT_ADDRESS, functionName: method, args, value: BigInt(0) });
  try {
    await client.waitForTransactionReceipt({ hash: txHash as `0x${string}` & { length: 66 }, status: TransactionStatus.FINALIZED });
  } catch (e) { console.warn('waitForTransactionReceipt warning:', e); }

  // Fetch full tx to decode return value
  const fromReceipt = await fetchTxResult(txHash as string);
  if (fromReceipt) return fromReceipt;

  // Fallback: getTransaction
  try {
    const tx = await client.getTransaction({ hash: txHash as `0x${string}` & { length: 66 } });
    const b64 = (tx as { consensus_data?: { leader_receipt?: Array<{ result?: string }> } })?.consensus_data?.leader_receipt?.[0]?.result;
    if (b64) { const d = decodeLeaderResult(b64); if (d) return d; }
  } catch {}

  return txHash;
}

export async function glWrite(method: string, args: string[], account: string): Promise<string> {
  await ensureGenLayerChain();
  const client = getBrowserClient(account);
  const txHash = await client.writeContract({ address: CONTRACT_ADDRESS, functionName: method, args, value: BigInt(0) });
  return txHash as string;
}

// ── Typed contract calls ──────────────────────────────────────────

export async function contractCreateProject(account: string, params: {
  name: string; category: string; website: string; description: string;
  whitepaper_url: string; docs_url: string; github_repos: string[];
  roadmap: string; tokenomics: object; audits: object[]; team: object[];
  investors: string[]; partnerships: string[]; bug_bounty_url: string;
  ecosystem_integrations: string[];
}): Promise<string> {
  const args = [
    params.name, params.category, params.website, params.description,
    params.whitepaper_url || '', params.docs_url || '',
    JSON.stringify(params.github_repos), params.roadmap,
    JSON.stringify(params.tokenomics), JSON.stringify(params.audits),
    JSON.stringify(params.team), JSON.stringify(params.investors),
    JSON.stringify(params.partnerships), params.bug_bounty_url || '',
    JSON.stringify(params.ecosystem_integrations),
  ];
  const result = await glWriteAndGetResult('create_project', args, account);
  if (typeof result === 'string' && result.length > 0 && !result.startsWith('0x')) return result;
  throw new Error(
    `Project created on-chain (tx: ${result}), but could not retrieve the project ID. ` +
    `Check your Dashboard to find and view the project.`
  );
}

export async function contractLockProject(account: string, projectId: string): Promise<string> {
  return glWriteAndWait('lock_project_data', [projectId], account, true);
}

/** Step 3: submit_evaluation — changes status to "evaluating" only */
export async function contractSubmitEvaluation(account: string, projectId: string): Promise<string> {
  return glWriteAndWait('submit_evaluation', [projectId], account, true);
}

/**
 * Step 4: run_evaluation — THE core evaluation step.
 * Does everything: AI scoring, saves evaluation, updates leaderboard,
 * updates profile, sets status = "ranked". Returns evaluation_id.
 * Do NOT call finalize_score after this.
 */
export async function contractRunEvaluation(account: string, projectId: string): Promise<string> {
  const result = await glWriteAndGetResult('run_evaluation', [projectId], account);
  // result is the evaluation_id (or tx hash as fallback)
  return typeof result === 'string' ? result : String(result);
}

/** Only for request_reevaluation — NOT part of initial evaluation flow */
export async function contractRequestReevaluation(account: string, projectId: string): Promise<string> {
  return glWriteAndWait('request_reevaluation', [projectId], account, true);
}

// NOTE: contractFinalizeScore is intentionally NOT exported.
// The new contract's run_evaluation() handles all finalization internally.
// Calling finalize_score separately caused "No evaluation found" errors.
