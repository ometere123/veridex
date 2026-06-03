'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ScoreBreakdown } from './ScoreBreakdown';
import { TierBadge } from './TierBadge';
import { formatScore, getScoreHex, formatDateTime } from '@/utils';
import {
  contractSubmitEvaluation,
  contractRunEvaluation,
  contractFinalizeScore,
  contractRequestReevaluation,
} from '@/lib/genlayer-write';
import type { Project, Evaluation } from '@/types';

interface EvaluationPanelProps {
  project: Project;
  evaluation?: Evaluation | null;
  onEvaluate?: () => void;
  className?: string;
}

const STEPS_EVALUATE = [
  'Submitting to GenLayer — approve in wallet…',
  'Running AI evaluation — validators are analyzing…',
  'Finalizing score on-chain…',
  'Syncing results…',
];

export function EvaluationPanel({ project, evaluation, onEvaluate, className }: EvaluationPanelProps) {
  const { address } = useAccount();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');

  const isOwner = address?.toLowerCase() === project.owner?.toLowerCase();
  const canEvaluate = isOwner && project.status === 'evaluation_locked';
  const canReevaluate = isOwner && project.status === 'ranked';

  async function handleEvaluate() {
    if (!address) return;
    setSubmitting(true);
    setError('');

    try {
      // ① submit_evaluation — marks project as "evaluating"
      setStep(STEPS_EVALUATE[0]);
      await contractSubmitEvaluation(address, project.project_id);

      // ② run_evaluation — AI agents run, validators reach consensus (slow)
      setStep(STEPS_EVALUATE[1]);
      await contractRunEvaluation(address, project.project_id);

      // ③ finalize_score — writes tier + updates leaderboard
      setStep(STEPS_EVALUATE[2]);
      await contractFinalizeScore(address, project.project_id);

      // ④ Sync to Supabase (reads result from GenLayer, caches it)
      setStep(STEPS_EVALUATE[3]);
      await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.project_id, wallet: address }),
      });

      onEvaluate?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Evaluation failed');
    } finally {
      setSubmitting(false);
      setStep('');
    }
  }

  async function handleReevaluate() {
    if (!address) return;
    setSubmitting(true);
    setError('');
    try {
      setStep('Requesting reevaluation — approve in wallet…');
      await contractRequestReevaluation(address, project.project_id);

      await fetch('/api/reevaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.project_id, wallet: address }),
      });

      onEvaluate?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reevaluation request failed');
    } finally {
      setSubmitting(false);
      setStep('');
    }
  }

  return (
    <div
      className={className}
      style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.10)', borderRadius: '12px', padding: '20px' }}
    >
      <h3 className="font-semibold text-sm mb-4" style={{ color: '#f5eeff' }}>
        GenLayer Evaluation
      </h3>

      {evaluation ? (
        <div className="space-y-4">
          {/* Score header */}
          <div
            className="flex items-center justify-between pb-4"
            style={{ borderBottom: '1px solid rgba(230,190,247,0.07)' }}
          >
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-4xl font-black font-mono"
                style={{
                  color: getScoreHex(evaluation.overall_score),
                  textShadow: `0 0 20px ${getScoreHex(evaluation.overall_score)}55`,
                }}
              >
                {formatScore(evaluation.overall_score)}
              </span>
              <span className="text-sm" style={{ color: '#6b5490' }}>/ 100</span>
            </div>
            <div className="text-right">
              <TierBadge tier={evaluation.tier} size="lg" />
              <div className="text-[10px] mt-1" style={{ color: '#6b5490' }}>
                {evaluation.confidence}% confidence
              </div>
            </div>
          </div>

          <ScoreBreakdown evaluation={evaluation} />

          {evaluation.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2" style={{ color: '#4ade80' }}>Strengths</h4>
              <ul className="space-y-1">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: '#9b86b8' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.weaknesses.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>Weaknesses</h4>
              <ul className="space-y-1">
                {evaluation.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: '#9b86b8' }}>
                    <span style={{ color: '#f87171', flexShrink: 0 }}>✗</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2" style={{ color: '#e6bef7' }}>Recommendations</h4>
              <ul className="space-y-1">
                {evaluation.recommendations.map((r, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: '#9b86b8' }}>
                    <span style={{ color: '#e6bef7', flexShrink: 0 }}>→</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            className="text-[10px] pt-3"
            style={{ borderTop: '1px solid rgba(230,190,247,0.06)', color: '#6b5490' }}
          >
            Evaluated by GenLayer validators · {formatDateTime(evaluation.evaluated_at)}
          </div>

          {canReevaluate && (
            <button
              onClick={handleReevaluate}
              disabled={submitting}
              className="w-full text-sm font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: 'rgba(230,190,247,0.07)',
                border: '1px solid rgba(230,190,247,0.16)',
                color: '#e6bef7',
              }}
            >
              {submitting ? (step || 'Processing…') : 'Request Reevaluation'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#9b86b8' }}>
            {project.status === 'evaluating'
              ? 'GenLayer validators are analyzing this project…'
              : project.status === 'reevaluation_pending'
              ? 'Reevaluation request pending.'
              : 'Lock evidence first, then submit for GenLayer evaluation.'}
          </p>

          {project.status === 'evaluating' && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#e6bef7' }}>
              <span
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(230,190,247,0.3)', borderTopColor: '#e6bef7' }}
              />
              Evaluation in progress — this may take a few minutes…
            </div>
          )}

          {submitting && step && (
            <div
              className="rounded-lg p-3 text-xs flex items-center gap-2"
              style={{ background: 'rgba(230,190,247,0.06)', color: '#e6bef7' }}
            >
              <span
                className="w-3 h-3 rounded-full border-2 animate-spin flex-shrink-0"
                style={{ borderColor: 'rgba(230,190,247,0.3)', borderTopColor: '#e6bef7' }}
              />
              {step}
            </div>
          )}

          {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}

          {canEvaluate && (
            <button
              onClick={handleEvaluate}
              disabled={submitting}
              className="w-full font-semibold py-2.5 px-4 rounded-lg text-sm transition-all disabled:opacity-50"
              style={{
                background: submitting
                  ? 'rgba(168,85,247,0.3)'
                  : 'linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)',
                color: '#fff',
                boxShadow: submitting ? 'none' : '0 0 18px rgba(168,85,247,0.35)',
              }}
            >
              {submitting ? (step || '⬡ Processing…') : '⬡ Submit for Evaluation'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
