const EXPLORER_BASE = (process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL || 'https://studio.genlayer.com').replace(/\/$/, '');

/** Link to a transaction on the GenLayer Studio explorer. */
export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_BASE}/tx/${hash}`;
}
