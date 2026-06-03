/**
 * genlayer-write.ts — Client-side GenLayer write service.
 * All writes sign via window.ethereum (MetaMask/Brave).
 * Import only from 'use client' components — never from API routes.
 */

import { createClient, abi } from 'genlayer-js';

// calldata decoder lives under abi.calldata
const calldata = abi.calldata;
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

// ── Contract address ─────────────────────────────────────────────
const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ||
  '0x972205A6d14437bacd49a59317EAB63d0599f4ed'
) as `0x${string}`;

// ── Use the official studionet chain from the SDK ────────────────
// This includes consensusMainContract, defaultNumberOfInitialValidators,
// and all other required fields the SDK needs to build transactions.
const CHAIN = studionet;
const CHAIN_ID_HEX = `0x${CHAIN.id.toString(16)}`; // "0xf27f"
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';

// ── Provider helpers ─────────────────────────────────────────────

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

  // If multiple wallets coexist (Brave + MetaMask), prefer MetaMask
  if (Array.isArray(win.ethereum.providers)) {
    const metamask = win.ethereum.providers.find(
      (p: EthProvider) => p.isMetaMask && !p.isBraveWallet
    );
    return metamask ?? win.ethereum.providers[0] ?? win.ethereum;
  }

  return win.ethereum;
}

async function ensureGenLayerChain(): Promise<void> {
  let provider: EthProvider;
  try { provider = getProvider(); } catch { return; } // no wallet → fail later in writeContract

  const chainParams = {
    chainId: CHAIN_ID_HEX,
    chainName: 'GenLayer Studionet',
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    rpcUrls: [RPC_ENDPOINT],
    blockExplorerUrls: ['https://studio.genlayer.com'],
  };

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code === 4001) throw new Error('Network switch rejected. Please approve the network switch in your wallet.');
    // Chain not added yet (4902) or unknown chain (-32603)
    if (code === 4902 || code === -32603) {
      try {
        await provider.request({ method: 'wallet_addEthereumChain', params: [chainParams] });
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID_HEX }] });
      } catch (addErr: unknown) {
        if ((addErr as { code?: number }).code === 4001) {
          throw new Error('Please approve adding the GenLayer network in your wallet.');
        }
        // Some wallets don't support addEthereumChain — try to proceed anyway
        console.warn('wallet_addEthereumChain not supported, proceeding:', addErr);
      }
    } else {
      // Any other error — log and try to proceed
      console.warn('wallet_switchEthereumChain non-fatal error:', err);
    }
  }
}

function getBrowserClient(account: string) {
  if (!account || !account.startsWith('0x')) {
    throw new Error('Invalid wallet address. Please connect your wallet first.');
  }
  const provider = getProvider();

  // Use the official studionet chain object — it has all required fields
  return createClient({
    chain: CHAIN,              // ← full chain config with consensusMainContract
    endpoint: RPC_ENDPOINT,   // ← override RPC endpoint if needed
    account: account as `0x${string}`,
    provider,                  // ← browser wallet for signing
  });
}

// ── Hex → Uint8Array helper ──────────────────────────────────────
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// ── Core helpers ─────────────────────────────────────────────────

/**
 * Submit a write tx, wait for FINALIZED, and return the tx hash.
 * strictWait = true (default for critical steps): throws if finalization fails.
 * strictWait = false: logs warning and continues (for non-critical steps).
 */
export async function glWriteAndWait(
  method: string,
  args: string[],
  account: string,
  strictWait = true
): Promise<string> {
  await ensureGenLayerChain();
  const client = getBrowserClient(account);

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
    value: BigInt(0),
  });

  try {
    await client.waitForTransactionReceipt({
      hash: txHash as `0x${string}` & { length: 66 },
      status: TransactionStatus.FINALIZED,
    });
  } catch (waitErr) {
    if (strictWait) {
      // For critical steps (run_evaluation, finalize_score) we must not proceed
      // if finalization hasn't confirmed — doing so causes "No evaluation found"
      throw new Error(
        `Transaction submitted (${txHash}) but did not finalize in time for ${method}. ` +
        `Please wait a moment and try again.`
      );
    }
    console.warn(`waitForTransactionReceipt warning for ${method}:`, waitErr);
  }

  return txHash as string;
}

/**
 * Decode a GenLayer leader_receipt result (base64-encoded calldata) into a string.
 * The result field skips the first byte (header byte) before calldata decode.
 */
function decodeLeaderResult(b64: string): string | null {
  try {
    // 1. base64 → bytes
    const binaryString = atob(b64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. Try calldata.decode starting at offset 1 (skip header byte)
    try {
      const decoded = calldata.decode(bytes.slice(1));
      if (typeof decoded === 'string' && decoded.length > 0) return decoded;
    } catch { /* try next */ }

    // 3. Try offset 0
    try {
      const decoded = calldata.decode(bytes);
      if (typeof decoded === 'string' && decoded.length > 0) return decoded;
    } catch { /* try next */ }

    // 4. Fallback: read raw ASCII from offset 3 (skip 3-byte length prefix)
    //    This works for 32-char hex project IDs
    const ascii = new TextDecoder().decode(bytes.slice(3));
    if (/^[0-9a-f]{32}$/.test(ascii)) return ascii;

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch a GenLayer transaction directly from the RPC and extract the leader result.
 */
async function fetchTxResult(txHash: string): Promise<string | null> {
  try {
    const rpc = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'eth_getTransactionByHash',
        params: [txHash],
      }),
    });
    const data = await res.json() as {
      result?: {
        consensus_data?: {
          leader_receipt?: Array<{ result?: string; execution_result?: string }>;
        };
      };
    };

    const lr = data?.result?.consensus_data?.leader_receipt;
    if (!lr || lr.length === 0) return null;

    const b64 = lr[0]?.result;
    if (!b64) return null;

    return decodeLeaderResult(b64);
  } catch {
    return null;
  }
}

/**
 * Submit a write tx, wait for FINALIZED, and decode the contract's return value.
 * Used for create_project() which returns the project_id string.
 */
export async function glWriteAndGetResult(
  method: string,
  args: string[],
  account: string
): Promise<unknown> {
  await ensureGenLayerChain();
  const client = getBrowserClient(account);

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
    value: BigInt(0),
  });

  // Wait for finalization
  try {
    await client.waitForTransactionReceipt({
      hash: txHash as `0x${string}` & { length: 66 },
      status: TransactionStatus.FINALIZED,
    });
  } catch (waitErr) {
    console.warn('waitForTransactionReceipt (tx was submitted):', waitErr);
  }

  // Fetch full tx from RPC and decode the base64 leader_receipt result
  const projectId = await fetchTxResult(txHash as string);
  if (projectId) return projectId;

  // Also try via SDK getTransaction
  try {
    const tx = await client.getTransaction({
      hash: txHash as `0x${string}` & { length: 66 },
    }) as { consensus_data?: { leader_receipt?: Array<{ result?: string }> } };

    const b64 = tx?.consensus_data?.leader_receipt?.[0]?.result;
    if (b64) {
      const decoded = decodeLeaderResult(b64);
      if (decoded) return decoded;
    }
  } catch { /* non-fatal */ }

  // Final fallback — return tx hash so caller can show a helpful message
  return txHash;
}

export async function glWrite(method: string, args: string[], account: string): Promise<string> {
  await ensureGenLayerChain();
  const client = getBrowserClient(account);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
    value: BigInt(0),
  });
  return txHash as string;
}

// ── Typed contract calls ─────────────────────────────────────────

export async function contractCreateProject(
  account: string,
  params: {
    name: string; category: string; website: string; description: string;
    whitepaper_url: string; docs_url: string; github_repos: string[];
    roadmap: string; tokenomics: object; audits: object[]; team: object[];
    investors: string[]; partnerships: string[]; bug_bounty_url: string;
    ecosystem_integrations: string[];
  }
): Promise<string> {
  const args = [
    params.name,
    params.category,
    params.website,
    params.description,
    params.whitepaper_url || '',
    params.docs_url || '',
    JSON.stringify(params.github_repos),
    params.roadmap,
    JSON.stringify(params.tokenomics),
    JSON.stringify(params.audits),
    JSON.stringify(params.team),
    JSON.stringify(params.investors),
    JSON.stringify(params.partnerships),
    params.bug_bounty_url || '',
    JSON.stringify(params.ecosystem_integrations),
  ];

  // Use glWriteAndGetResult to get the actual project_id returned by the contract,
  // not the tx hash. The contract's create_project() returns a sha256-derived string.
  const result = await glWriteAndGetResult('create_project', args, account);

  // The decoded result should be the project_id string
  if (typeof result === 'string' && result.length > 0 && !result.startsWith('0x')) {
    return result;
  }

  // If decoding failed or returned the tx hash, fetch the project_id a different way:
  // Read all projects for this wallet and find the most recently created one
  throw new Error(
    `Project created successfully (tx: ${result}), but could not retrieve the project ID. ` +
    `Check your Dashboard to find and view the project.`
  );
}

export async function contractLockProject(account: string, projectId: string): Promise<string> {
  return glWriteAndWait('lock_project_data', [projectId], account);
}

export async function contractSubmitEvaluation(account: string, projectId: string): Promise<string> {
  // submit_evaluation just changes status to "evaluating" — we wait for it too
  return glWriteAndWait('submit_evaluation', [projectId], account, true);
}

export async function contractRunEvaluation(account: string, projectId: string): Promise<string> {
  // run_evaluation is the slowest step — AI agents + validator consensus.
  // Must fully finalize before finalize_score is called.
  return glWriteAndWait('run_evaluation', [projectId], account, true);
}

/**
 * Verify the evaluation exists on-chain before calling finalize_score.
 * Polls get_evaluation up to 10 times with 3s intervals.
 */
async function waitForEvaluationOnChain(projectId: string): Promise<void> {
  const rpc = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';
  const CONTRACT = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || '0x972205A6d14437bacd49a59317EAB63d0599f4ed';

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      // Use gen_call to read get_evaluation(project_id)
      const callPayload = {
        jsonrpc: '2.0', id: 1,
        method: 'gen_call',
        params: [{
          to: CONTRACT,
          data: JSON.stringify({ method: 'get_evaluation', args: [projectId] }),
          type: 'read',
        }],
      };
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callPayload),
      });
      const data = await res.json() as { result?: string };
      const raw = data?.result;
      if (raw && raw !== '{}' && raw.length > 2) {
        // Evaluation exists
        return;
      }
    } catch { /* retry */ }

    // Wait 3 seconds between checks
    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error(
    'run_evaluation completed but the evaluation result is not yet readable. ' +
    'Please wait 30 seconds and try clicking "Submit for Evaluation" again from the project page.'
  );
}

export async function contractFinalizeScore(account: string, projectId: string): Promise<string> {
  // Guard: confirm evaluation is on-chain before finalizing
  await waitForEvaluationOnChain(projectId);
  return glWriteAndWait('finalize_score', [projectId], account, true);
}

export async function contractRequestReevaluation(account: string, projectId: string): Promise<string> {
  return glWriteAndWait('request_reevaluation', [projectId], account);
}
