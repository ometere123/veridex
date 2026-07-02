const lsKey = (id: string) => `veridex_tx_${id}`;

export type TxOp =
  | 'create_dossier'
  | 'lock_evidence'
  | 'submit_verification'
  | 'run_verification'
  | 'request_refresh';

export interface TxEntry {
  op: TxOp;
  hash: string;
  timestamp: number;
}

export const TX_OP_LABEL: Record<TxOp, string> = {
  create_dossier: 'Create Dossier',
  lock_evidence: 'Lock Evidence',
  submit_verification: 'Submit Verification',
  run_verification: 'Run Verification',
  request_refresh: 'Request Refresh',
};

export function appendTxHistory(dossierId: string, entry: TxEntry): void {
  if (typeof window === 'undefined' || !dossierId) return;
  try {
    const raw = localStorage.getItem(lsKey(dossierId));
    const existing: TxEntry[] = raw ? JSON.parse(raw) : [];
    if (!existing.find((e) => e.hash === entry.hash)) {
      existing.push(entry);
      localStorage.setItem(lsKey(dossierId), JSON.stringify(existing));
    }
  } catch { /* non-fatal */ }
}

export function getTxHistory(dossierId: string): TxEntry[] {
  if (typeof window === 'undefined' || !dossierId) return [];
  try {
    const raw = localStorage.getItem(lsKey(dossierId));
    return raw ? (JSON.parse(raw) as TxEntry[]) : [];
  } catch { return []; }
}
