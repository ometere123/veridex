'use client';

import { formatScore, getScoreHex, safeNumber } from '@/utils';
import { TierBadge } from './TierBadge';
import { SCORE_LABELS } from '@/constants';
import type { Evaluation, Project } from '@/types';

interface ProjectComparisonProps {
  projectA: Project;
  projectB: Project;
  evalA?: Evaluation | null;
  evalB?: Evaluation | null;
  className?: string;
}

const SCORE_KEYS = [
  'protocol_architecture_score',
  'team_governance_score',
  'market_traction_score',
  'security_risk_score',
  'delivery_proof_score',
  'token_design_score',
  'evidence_integrity_score',
] as const;

const ROW = { borderBottom: '1px solid rgba(107,142,122,0.07)' };

export function ProjectComparison({ projectA, projectB, evalA, evalB, className }: ProjectComparisonProps) {
  return (
    <div className={`overflow-x-auto ${className ?? ''}`}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(107,142,122,0.14)' }}>
            <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider w-40"
              style={{ color: '#9b938a' }}>Dimension</th>
            <th className="pb-3 pr-4 text-center text-sm font-bold" style={{ color: '#6b8e7a' }}>
              {projectA.name}
            </th>
            <th className="pb-3 text-center text-sm font-bold" style={{ color: '#b8633f' }}>
              {projectB.name}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={ROW}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#9b938a' }}>Category</td>
            <td className="py-3 pr-4 text-center text-xs uppercase tracking-wider" style={{ color: '#6b6360' }}>{projectA.category}</td>
            <td className="py-3 text-center text-xs uppercase tracking-wider" style={{ color: '#6b6360' }}>{projectB.category}</td>
          </tr>
          <tr style={ROW}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#9b938a' }}>Star Tier</td>
            <td className="py-3 pr-4 text-center">
              {evalA ? <TierBadge tier={evalA.tier} size="sm" /> : <span style={{ color: '#c8c0b8' }}>-</span>}
            </td>
            <td className="py-3 text-center">
              {evalB ? <TierBadge tier={evalB.tier} size="sm" /> : <span style={{ color: '#c8c0b8' }}>-</span>}
            </td>
          </tr>
          <tr style={{ ...ROW, background: 'rgba(107,142,122,0.03)' }}>
            <td className="py-3 pr-4 text-xs font-semibold" style={{ color: '#1a1612' }}>Verification Score</td>
            <td className="py-3 pr-4 text-center">
              {evalA
                ? <span className="font-mono font-black text-xl" style={{ color: getScoreHex(evalA.overall_score) }}>
                    {formatScore(evalA.overall_score)}
                  </span>
                : <span style={{ color: '#c8c0b8' }}>-</span>}
            </td>
            <td className="py-3 text-center">
              {evalB
                ? <span className="font-mono font-black text-xl" style={{ color: getScoreHex(evalB.overall_score) }}>
                    {formatScore(evalB.overall_score)}
                  </span>
                : <span style={{ color: '#c8c0b8' }}>-</span>}
            </td>
          </tr>
          {SCORE_KEYS.map((key) => {
            const aVal = evalA ? safeNumber(evalA[key]) : null;
            const bVal = evalB ? safeNumber(evalB[key]) : null;
            const aWins = aVal !== null && bVal !== null && aVal > bVal;
            const bWins = aVal !== null && bVal !== null && bVal > aVal;
            return (
              <tr key={key} style={ROW}>
                <td className="py-3 pr-4 text-xs" style={{ color: '#9b938a' }}>{SCORE_LABELS[key]}</td>
                <td className="py-3 pr-4 text-center" style={aWins ? { background: 'rgba(107,142,122,0.06)' } : {}}>
                  {aVal !== null
                    ? <span className="font-mono text-sm" style={{ color: getScoreHex(aVal), fontWeight: aWins ? 700 : 400 }}>
                        {formatScore(aVal)}
                      </span>
                    : <span style={{ color: '#c8c0b8' }}>-</span>}
                </td>
                <td className="py-3 text-center" style={bWins ? { background: 'rgba(184,99,63,0.05)' } : {}}>
                  {bVal !== null
                    ? <span className="font-mono text-sm" style={{ color: getScoreHex(bVal), fontWeight: bWins ? 700 : 400 }}>
                        {formatScore(bVal)}
                      </span>
                    : <span style={{ color: '#c8c0b8' }}>-</span>}
                </td>
              </tr>
            );
          })}
          <tr style={ROW}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#9b938a' }}>Audits on file</td>
            <td className="py-3 pr-4 text-center text-xs" style={{ color: '#6b6360' }}>{projectA.audits?.length ?? 0}</td>
            <td className="py-3 text-center text-xs" style={{ color: '#6b6360' }}>{projectB.audits?.length ?? 0}</td>
          </tr>
          <tr style={ROW}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#9b938a' }}>GitHub repos</td>
            <td className="py-3 pr-4 text-center text-xs" style={{ color: '#6b6360' }}>{projectA.github_repos?.length ?? 0}</td>
            <td className="py-3 text-center text-xs" style={{ color: '#6b6360' }}>{projectB.github_repos?.length ?? 0}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
