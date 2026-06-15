import { cn, getScoreColor, getScoreHex, formatScore } from '@/utils';
import { SCORE_LABELS, SCORE_WEIGHTS } from '@/constants';
import type { Evaluation } from '@/types';

interface ScoreBreakdownProps {
  evaluation: Evaluation;
  className?: string;
}

const SCORE_KEYS = [
  { key: 'protocol_architecture_score', weight: SCORE_WEIGHTS.protocol_architecture },
  { key: 'team_governance_score',      weight: SCORE_WEIGHTS.team_governance },
  { key: 'market_traction_score',      weight: SCORE_WEIGHTS.market_traction },
  { key: 'security_risk_score',        weight: SCORE_WEIGHTS.security_risk },
  { key: 'delivery_proof_score',       weight: SCORE_WEIGHTS.delivery_proof },
  { key: 'token_design_score',         weight: SCORE_WEIGHTS.token_design },
  { key: 'evidence_integrity_score',   weight: SCORE_WEIGHTS.evidence_integrity },
] as const;

export function ScoreBreakdown({ evaluation, className }: ScoreBreakdownProps) {
  return (
    <div className={cn('space-y-3.5', className)}>
      {SCORE_KEYS.map(({ key, weight }) => {
        const score = evaluation[key];
        const hex   = getScoreHex(score);
        const pct   = Math.round(weight * 100);

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: '#9b938a' }}>
                {SCORE_LABELS[key]}
                <span className="ml-1 opacity-50">({pct}%)</span>
              </span>
              <span
                className={cn('text-sm font-mono font-bold', getScoreColor(score))}
              >
                {formatScore(score)}
              </span>
            </div>
            {/* Track */}
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(107, 142, 122, 0.1)' }}
            >
              {/* Fill */}
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${score}%`,
                  background: `linear-gradient(90deg, ${hex}44, ${hex})`,
                  boxShadow: `0 0 6px ${hex}55`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
