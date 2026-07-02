'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import {
  contractSubmitVerification,
  contractRunVerification,
  contractRequestVerificationRefresh,
} from '@/lib/genlayer-write';
import {
  savePendingEval, getPendingEval, clearPendingEval,
  updatePendingEvalStage, STAGE_LABEL,
  type EvalStage,
} from '@/lib/pending-tx';
import { TxLink } from './TxLink';
import type { Dossier, VerificationReport } from '@/types';

interface DossierVerificationPanelProps {
  dossier: Dossier;
  report?: VerificationReport | null;
  onVerify?: () => void;
  className?: string;
}

const POLL_INTERVAL = 15_000;
const MAX_POLLS = 20; // 20 x 15s = 5 minutes

const STAGE_COLOR: Record<EvalStage, string> = {
  signing: '#8effc3',
  submitted: '#67d89a',
  validating: '#d4ad63',
  finalising: '#4ddf98',
  completed: '#8effc3',
  stalled: '#e07a5f',
};

function StageChip({ stage }: { stage: EvalStage }) {
  const color = STAGE_COLOR[stage];
  return (
    <div className="rounded-2xl p-3 text-xs flex items-center gap-2.5"
      style={{ background: `${color}14`, border: `1px solid ${color}33` }}>
      {stage !== 'completed' && stage !== 'stalled' && (
        <span className="w-3 h-3 rounded-full border-2 animate-spin flex-shrink-0"
          style={{ borderColor: `${color}33`, borderTopColor: color }} />
      )}
      {stage === 'completed' && <span style={{ color }}>✓</span>}
      {stage === 'stalled' && <span style={{ color }}>⚠</span>}
      <span style={{ color }}>{STAGE_LABEL[stage]}</span>
    </div>
  );
}

const TERMINAL_STATUSES = ['VERIFIED', 'PARTIAL', 'WEAK', 'UNVERIFIABLE', 'REFRESH_PENDING'];

export function DossierVerificationPanel({ dossier, report: initialReport, onVerify, className }: DossierVerificationPanelProps) {
  const { address } = useAccount();
  const [report, setReport] = useState<VerificationReport | null>(initialReport ?? null);
  const [stage, setStage] = useState<EvalStage | null>(null);
  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const [txHash, setTxHash] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setReport(initialReport ?? null), [initialReport]);

  const isIssuer = address?.toLowerCase() === dossier.issuer?.toLowerCase();
  const canSubmit = isIssuer && ['EVIDENCE_LOCKED', 'REFRESH_PENDING', 'STALE'].includes(dossier.status);
  const canRetryRun = isIssuer && dossier.status === 'VERIFYING' && !report;
  const canRequestRefresh = isIssuer && TERMINAL_STATUSES.includes(dossier.status) && dossier.status !== 'REFRESH_PENDING';
  const isPolling = stage !== null && stage !== 'completed' && stage !== 'stalled';

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch(`/api/dossier/${dossier.dossier_id}`);
      const data = res.ok ? await res.json() : null;

      if (data?.verification_report?.verification_id) {
        setReport(data.verification_report as VerificationReport);
        clearPendingEval();
        setStage('completed');
        if (pollRef.current) clearInterval(pollRef.current);
        onVerify?.();
        return true;
      }
    } catch { /* non-fatal */ }
    return false;
  }, [dossier.dossier_id, onVerify]);

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    let count = 0;

    pollRef.current = setInterval(async () => {
      count++;
      setPollCount(count);
      const done = await fetchLatest();
      if (done || count >= MAX_POLLS) {
        if (pollRef.current) clearInterval(pollRef.current);
        if (!done) {
          setStage('stalled');
          updatePendingEvalStage('stalled');
        }
      }
    }, POLL_INTERVAL);
  }, [fetchLatest]);

  useEffect(() => {
    const pending = getPendingEval();
    if (pending && pending.project_id === dossier.dossier_id && !report) {
      const elapsed = Date.now() - pending.started_at;
      if (elapsed < 300_000) {
        setStage(pending.stage === 'completed' ? 'validating' : pending.stage);
        if (pending.tx_hash) setTxHash(pending.tx_hash);
        startPolling();
      } else {
        setStage('stalled');
      }
    }
  }, [dossier.dossier_id]); // eslint-disable-line

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function handleVerify(skipSubmit: boolean) {
    if (!address) return;
    setError('');
    setTxHash('');

    try {
      if (!skipSubmit) {
        setStage('signing');
        savePendingEval({ project_id: dossier.dossier_id, method: 'submit_evaluation', stage: 'signing', started_at: Date.now() });

        const submitTx = await contractSubmitVerification(address, dossier.dossier_id, setTxHash);
        setStage('submitted');
        updatePendingEvalStage('submitted', { tx_hash: submitTx });

        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 10_000));
          const r = await fetch(`/api/dossier/${dossier.dossier_id}`);
          const d = r.ok ? await r.json() : null;
          if (d?.dossier?.status === 'VERIFYING') break;
        }
      }

      setStage('signing');
      updatePendingEvalStage('signing', { method: 'run_evaluation' });

      const runTx = await contractRunVerification(address, dossier.dossier_id, setTxHash);

      setStage('validating');
      updatePendingEvalStage('validating', { tx_hash: runTx });

      startPolling();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      setStage(null);
      clearPendingEval();
    }
  }

  async function handleRequestRefresh() {
    if (!address) return;
    setError('');
    setTxHash('');
    setStage('signing');
    try {
      await contractRequestVerificationRefresh(address, dossier.dossier_id, setTxHash);
      setStage(null);
      onVerify?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh request failed');
      setStage(null);
    }
  }

  async function handleRefresh() {
    setStage('finalising');
    const done = await fetchLatest();
    if (!done) setStage('stalled');
  }

  return (
    <section className={className} style={{ background: '#0b1712cc', border: '1px solid rgba(142,255,195,0.18)', borderRadius: '28px', padding: '22px', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-[#f5fff7]">GenLayer Verification</h3>
        {(isPolling || stage === 'stalled' || report) && (
          <button onClick={handleRefresh}
            className="text-xs px-3 py-1.5 rounded-2xl transition-all"
            style={{ background: 'rgba(142,255,195,0.08)', border: '1px solid rgba(142,255,195,0.18)', color: '#8effc3' }}>
            ↻ Refresh Status
          </button>
        )}
      </div>

      {report ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(142,255,195,0.08)' }}>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#6fae8e]">Verification Level</p>
              <p className="text-lg font-semibold text-[#f5fff7]">{report.verification_level.replace(/_/g, ' ')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-[#6fae8e]">Confidence</p>
              <p className="text-2xl font-black font-mono text-[#8effc3]">{report.evidence_confidence}%</p>
            </div>
          </div>
          <p className="text-sm text-[#9bb4a6] leading-6">{report.summary}</p>
          <div className="text-[10px] pt-3 text-[#6fae8e] flex flex-wrap items-center gap-x-2 gap-y-1" style={{ borderTop: '1px solid rgba(142,255,195,0.06)' }}>
            <span>Verified by GenLayer validators</span>
            {txHash && <TxLink hash={txHash} label="last transaction" className="text-[10px]" />}
          </div>

          {canRequestRefresh && (
            <button onClick={handleRequestRefresh} disabled={!!stage}
              className="w-full text-sm font-medium py-2 px-4 rounded-2xl transition-all disabled:opacity-50"
              style={{ background: 'rgba(142,255,195,0.08)', border: '1px solid rgba(142,255,195,0.18)', color: '#8effc3' }}>
              {stage ? (STAGE_LABEL[stage] || 'Processing…') : 'Request Verification Refresh'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {stage && <StageChip stage={stage} />}

          {stage && txHash && (
            <div className="rounded-2xl p-3 text-xs" style={{ background: 'rgba(142,255,195,0.06)', border: '1px solid rgba(142,255,195,0.16)' }}>
              <TxLink hash={txHash} label="Submitted - view on explorer" />
            </div>
          )}

          {isPolling && pollCount > 0 && (
            <div className="text-[11px] text-[#6fae8e]">
              Checking on-chain state… ({pollCount * 15}s elapsed)
            </div>
          )}

          {stage === 'stalled' && (
            <div className="rounded-2xl p-3 text-xs" style={{ background: 'rgba(212,173,99,0.08)', border: '1px solid rgba(212,173,99,0.20)', color: '#d4ad63' }}>
              GenLayer validation can take up to 5 minutes. Click "Refresh Status" to check again.
              A timeout is NOT a failure - your transaction was submitted successfully.
            </div>
          )}

          {error && !stage && (
            <div className="rounded-2xl p-3 text-xs" style={{ background: 'rgba(224,122,95,0.08)', border: '1px solid rgba(224,122,95,0.22)', color: '#e07a5f' }}>
              {error}
            </div>
          )}

          {!stage && (
            <p className="text-sm text-[#9bb4a6]">
              {dossier.status === 'VERIFYING'
                ? 'Status: verifying. Click below to run the GenLayer verification.'
                : dossier.status === 'DRAFT'
                ? 'Lock your evidence first, then submit for GenLayer verification.'
                : 'Submit this dossier for a GenLayer verification cycle.'}
            </p>
          )}

          {canSubmit && !stage && (
            <button onClick={() => handleVerify(false)}
              className="w-full font-semibold py-2.5 px-4 rounded-2xl text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #8effc3, #4ddf98)', color: '#04100b' }}>
              Run GenLayer Verification
            </button>
          )}

          {canRetryRun && !stage && (
            <div className="space-y-2">
              <div className="rounded-2xl p-3 text-xs" style={{ background: 'rgba(212,173,99,0.08)', border: '1px solid rgba(212,173,99,0.20)', color: '#d4ad63' }}>
                ⚠ Dossier is in verifying state. Click below to run the verification.
              </div>
              <button onClick={() => handleVerify(true)}
                className="w-full font-semibold py-2.5 px-4 rounded-2xl text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #8effc3, #4ddf98)', color: '#04100b' }}>
                Run Verification
              </button>
            </div>
          )}

          {!isIssuer && address && dossier.status === 'DRAFT' && (
            <p className="text-xs text-[#789685]">Only the dossier issuer can submit for verification.</p>
          )}
        </div>
      )}
    </section>
  );
}
