'use client';

import { formatScore, getScoreHex, getScoreColor, cn } from '@/utils';
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
  'technical_score', 'team_score', 'market_fit_score',
  'security_score', 'execution_score', 'token_utility_score',
] as const;

const ROW_STYLE = { borderBottom: '1px solid rgba(230,190,247,0.05)' };
const HIGHLIGHT = { background: 'rgba(74,222,128,0.04)' };

export function ProjectComparison({ projectA, projectB, evalA, evalB, className }: ProjectComparisonProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(230,190,247,0.10)' }}>
            <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider w-40"
              style={{ color: '#6b5490' }}>Metric</th>
            <th className="pb-3 pr-4 text-center text-sm font-bold" style={{ color: '#e6bef7' }}>
              {projectA.name}
            </th>
            <th className="pb-3 text-center text-sm font-bold" style={{ color: '#e6bef7' }}>
              {projectB.name}
            </th>
          </tr>
        </thead>
        <tbody>

          {/* Category */}
          <tr style={ROW_STYLE}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#6b5490' }}>Category</td>
            <td className="py-3 pr-4 text-center text-xs uppercase tracking-wider" style={{ color: '#9b86b8' }}>{projectA.category}</td>
            <td className="py-3 text-center text-xs uppercase tracking-wider"      style={{ color: '#9b86b8' }}>{projectB.category}</td>
          </tr>

          {/* Tier */}
          <tr style={ROW_STYLE}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#6b5490' }}>Tier</td>
            <td className="py-3 pr-4 text-center">
              {evalA ? <TierBadge tier={evalA.tier} size="sm" /> : <span style={{ color: '#3d2a6b' }}>—</span>}
            </td>
            <td className="py-3 text-center">
              {evalB ? <TierBadge tier={evalB.tier} size="sm" /> : <span style={{ color: '#3d2a6b' }}>—</span>}
            </td>
          </tr>

          {/* Overall */}
          <tr style={{ ...ROW_STYLE, background: 'rgba(230,190,247,0.03)' }}>
            <td className="py-3 pr-4 text-xs font-semibold" style={{ color: '#ddd0f0' }}>Overall Score</td>
            <td className="py-3 pr-4 text-center">
              {evalA
                ? <span className={cn('font-mono font-black text-xl', getScoreColor(evalA.overall_score))}
                    style={{ textShadow: `0 0 10px ${getScoreHex(evalA.overall_score)}44` }}>
                    {formatScore(evalA.overall_score)}
                  </span>
                : <span style={{ color: '#3d2a6b' }}>—</span>}
            </td>
            <td className="py-3 text-center">
              {evalB
                ? <span className={cn('font-mono font-black text-xl', getScoreColor(evalB.overall_score))}
                    style={{ textShadow: `0 0 10px ${getScoreHex(evalB.overall_score)}44` }}>
                    {formatScore(evalB.overall_score)}
                  </span>
                : <span style={{ color: '#3d2a6b' }}>—</span>}
            </td>
          </tr>

          {/* Individual scores */}
          {SCORE_KEYS.map((key) => {
            const aVal = evalA?.[key] ?? null;
            const bVal = evalB?.[key] ?? null;
            const aWins = aVal !== null && bVal !== null && aVal > bVal;
            const bWins = aVal !== null && bVal !== null && bVal > aVal;

            return (
              <tr key={key} style={ROW_STYLE}>
                <td className="py-3 pr-4 text-xs" style={{ color: '#6b5490' }}>
                  {SCORE_LABELS[key]}
                </td>
                <td className="py-3 pr-4 text-center" style={aWins ? HIGHLIGHT : {}}>
                  {aVal !== null
                    ? <span className={cn('font-mono text-sm', aWins && 'font-bold', getScoreColor(aVal))}>
                        {Math.round(aVal)}
                      </span>
                    : <span style={{ color: '#3d2a6b' }}>—</span>}
                </td>
                <td className="py-3 text-center" style={bWins ? HIGHLIGHT : {}}>
                  {bVal !== null
                    ? <span className={cn('font-mono text-sm', bWins && 'font-bold', getScoreColor(bVal))}>
                        {Math.round(bVal)}
                      </span>
                    : <span style={{ color: '#3d2a6b' }}>—</span>}
                </td>
              </tr>
            );
          })}

          {/* Audits */}
          <tr style={ROW_STYLE}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#6b5490' }}>Audits</td>
            <td className="py-3 pr-4 text-center text-xs" style={{ color: '#9b86b8' }}>
              {projectA.audits?.length ?? 0}
            </td>
            <td className="py-3 text-center text-xs" style={{ color: '#9b86b8' }}>
              {projectB.audits?.length ?? 0}
            </td>
          </tr>

          {/* GitHub repos */}
          <tr style={ROW_STYLE}>
            <td className="py-3 pr-4 text-xs" style={{ color: '#6b5490' }}>GitHub Repos</td>
            <td className="py-3 pr-4 text-center text-xs" style={{ color: '#9b86b8' }}>
              {projectA.github_repos?.length ?? 0}
            </td>
            <td className="py-3 text-center text-xs" style={{ color: '#9b86b8' }}>
              {projectB.github_repos?.length ?? 0}
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}
