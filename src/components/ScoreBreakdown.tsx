import { cn, getScoreColor, getScoreHex, formatScore } from '@/utils';
import { SCORE_LABELS, SCORE_WEIGHTS } from '@/constants';
import type { Evaluation } from '@/types';

interface ScoreBreakdownProps {
  evaluation: Evaluation;
  className?: string;
}

const SCORE_KEYS = [
  { key: 'technical_score',     weight: SCORE_WEIGHTS.technical },
  { key: 'team_score',          weight: SCORE_WEIGHTS.team },
  { key: 'market_fit_score',    weight: SCORE_WEIGHTS.market_fit },
  { key: 'security_score',      weight: SCORE_WEIGHTS.security },
  { key: 'execution_score',     weight: SCORE_WEIGHTS.execution },
  { key: 'token_utility_score', weight: SCORE_WEIGHTS.token_utility },
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
              <span className="text-xs" style={{ color: '#9b86b8' }}>
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
              style={{ background: 'rgba(230,190,247,0.07)' }}
            >
              {/* Fill */}
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${score}%`,
                  background: `linear-gradient(90deg, ${hex}55, ${hex})`,
                  boxShadow: `0 0 6px ${hex}66`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
