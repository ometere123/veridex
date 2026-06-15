'use client';

import { formatScore, getScoreHex, getScoreColor, cn, safeNumber } from '@/utils';
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

const ROW_STYLE = { borderBottom: '1px solid rgba(0,217,255,0.05)' };
const HIGHLIGHT = { background: 'rgba(74,222,128,0.04)' };

export function ProjectComparison({ projectA, projectB, evalA, evalB, className }: ProjectComparisonProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(0,217,255,0.10)' }}>
            <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider w-40"
              style={{ color: '#64748b' }}>Metric</th>
            <th className="pb-3 pr-4 text-center text-sm font-bold" style={{ color: '#00d9ff' }}>
              {projectA.name}
            </th>
            <th className="pb-3 text-center text-sm font-bold" style={{ color: '#00d9ff' }}>
              {projectB.name}
            </th>
          </tr>
        </thead>
        <tbody>

          {/* Category */}
          <tr style={ROW_STYLE}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#64748b' }}>Category</td>
            <td className="py-3 pr-4 text-center text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>{projectA.category}</td>
            <td className="py-3 text-center text-xs uppercase tracking-wider"      style={{ color: '#94a3b8' }}>{projectB.category}</td>
          </tr>

          {/* Tier */}
          <tr style={ROW_STYLE}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#64748b' }}>Tier</td>
            <td className="py-3 pr-4 text-center">
              {evalA ? <TierBadge tier={evalA.tier} size="sm" /> : <span style={{ color: '#334155' }}>-</span>}
            </td>
            <td className="py-3 text-center">
              {evalB ? <TierBadge tier={evalB.tier} size="sm" /> : <span style={{ color: '#334155' }}>-</span>}
            </td>
          </tr>

          {/* Overall */}
          <tr style={{ ...ROW_STYLE, background: 'rgba(0,217,255,0.03)' }}>
            <td className="py-3 pr-4 text-xs font-semibold" style={{ color: '#cbd5e1' }}>Overall Score</td>
            <td className="py-3 pr-4 text-center">
              {evalA
                ? <span className={cn('font-mono font-black text-xl', getScoreColor(evalA.overall_score))}
                    style={{ textShadow: `0 0 10px ${getScoreHex(evalA.overall_score)}44` }}>
                    {formatScore(evalA.overall_score)}
                  </span>
                : <span style={{ color: '#334155' }}>-</span>}
            </td>
            <td className="py-3 text-center">
              {evalB
                ? <span className={cn('font-mono font-black text-xl', getScoreColor(evalB.overall_score))}
                    style={{ textShadow: `0 0 10px ${getScoreHex(evalB.overall_score)}44` }}>
                    {formatScore(evalB.overall_score)}
                  </span>
                : <span style={{ color: '#334155' }}>-</span>}
            </td>
          </tr>

          {/* Individual scores */}
          {SCORE_KEYS.map((key) => {
            const aVal = evalA ? safeNumber(evalA[key]) : null;
            const bVal = evalB ? safeNumber(evalB[key]) : null;
            const aWins = aVal !== null && bVal !== null && aVal > bVal;
            const bWins = aVal !== null && bVal !== null && bVal > aVal;

            return (
              <tr key={key} style={ROW_STYLE}>
                <td className="py-3 pr-4 text-xs" style={{ color: '#64748b' }}>
                  {SCORE_LABELS[key]}
                </td>
                <td className="py-3 pr-4 text-center" style={aWins ? HIGHLIGHT : {}}>
                  {aVal !== null
                    ? <span className={cn('font-mono text-sm', aWins && 'font-bold', getScoreColor(aVal))}>
                        {formatScore(aVal)}
                      </span>
                    : <span style={{ color: '#334155' }}>-</span>}
                </td>
                <td className="py-3 text-center" style={bWins ? HIGHLIGHT : {}}>
                  {bVal !== null
                    ? <span className={cn('font-mono text-sm', bWins && 'font-bold', getScoreColor(bVal))}>
                        {formatScore(bVal)}
                      </span>
                    : <span style={{ color: '#334155' }}>-</span>}
                </td>
              </tr>
            );
          })}

          {/* Audits */}
          <tr style={ROW_STYLE}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#64748b' }}>Audits</td>
            <td className="py-3 pr-4 text-center text-xs" style={{ color: '#94a3b8' }}>
              {projectA.audits?.length ?? 0}
            </td>
            <td className="py-3 text-center text-xs" style={{ color: '#94a3b8' }}>
              {projectB.audits?.length ?? 0}
            </td>
          </tr>

          {/* GitHub repos */}
          <tr style={ROW_STYLE}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#64748b' }}>GitHub Repos</td>
            <td className="py-3 pr-4 text-center text-xs" style={{ color: '#94a3b8' }}>
              {projectA.github_repos?.length ?? 0}
            </td>
            <td className="py-3 text-center text-xs" style={{ color: '#94a3b8' }}>
              {projectB.github_repos?.length ?? 0}
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}
