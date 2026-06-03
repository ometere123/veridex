/**
 * pending-tx.ts
 * Stores in-flight GenLayer evaluation state to localStorage.
 * GenLayer transactions can take 2-5 minutes to finalize.
 * We must not lose state if the user refreshes or the wait times out.
 */

export type EvalStage =
  | 'signing'      // wallet popup open
  | 'submitted'    // tx sent, waiting
  | 'validating'   // validators running AI
  | 'finalising'   // consensus reached, writing state
  | 'completed'    // get_evaluation returns full JSON
  | 'stalled';     // >5 min, suggest manual refresh

export interface PendingEvaluation {
  project_id: string;
  project_name?: string;
  tx_hash?: string;          // from submit_evaluation or run_evaluation
  method: 'submit_evaluation' | 'run_evaluation';
  stage: EvalStage;
  started_at: number;        // Date.now()
  last_polled?: number;
}

const KEY = 'alpharank_pending_eval';

export function savePendingEval(ev: PendingEvaluation): void {
  try { localStorage.setItem(KEY, JSON.stringify(ev)); } catch {}
}

export function getPendingEval(): PendingEvaluation | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingEvaluation) : null;
  } catch { return null; }
}

export function clearPendingEval(): void {
  try { localStorage.removeItem(KEY); } catch {}
}

export function updatePendingEvalStage(stage: EvalStage, extra?: Partial<PendingEvaluation>): void {
  const cur = getPendingEval();
  if (!cur) return;
  savePendingEval({ ...cur, ...extra, stage });
}

export const STAGE_LABEL: Record<EvalStage, string> = {
  signing:    'Waiting for wallet signature…',
  submitted:  'Transaction submitted — GenLayer validators starting…',
  validating: 'GenLayer AI evaluation running. This may take 2–5 minutes…',
  finalising: 'Validators reached consensus, finalising on-chain…',
  completed:  'Evaluation complete!',
  stalled:    'Still validating. Click "Refresh Status" to check.',
};
