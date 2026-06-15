'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TierBadge } from './TierBadge';
import { cn, formatDate, getScoreHex } from '@/utils';
import type { HistoricalScore, RankTier } from '@/types';

interface HistoricalChartProps {
  history: HistoricalScore[];
  className?: string;
}

export function HistoricalChart({ history, className }: HistoricalChartProps) {
  if (history.length === 0) {
    return (
      <div className={cn('text-center py-12', className)} style={{ color: '#64748b' }}>
        No evaluation history yet.
      </div>
    );
  }

  const chartData = history.map((h, i) => ({
    label: `Eval ${i + 1}`,
    score: h.new_score,
    delta: h.delta,
    date: formatDate(h.timestamp),
  }));

  const avgScore = Math.round(history.reduce((a, h) => a + h.new_score, 0) / history.length);

  return (
    <div className={cn('space-y-5', className)}>
      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#00d9ff" />
                <stop offset="50%"  stopColor="#e6bef7" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(230,190,247,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(230,190,247,0.08)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              y={avgScore}
              stroke="rgba(230,190,247,0.2)"
              strokeDasharray="4 2"
            />
            <Tooltip
              contentStyle={{
                background: '#0e0a1a',
                border: '1px solid rgba(230,190,247,0.16)',
                borderRadius: '8px',
                color: '#f5eeff',
                fontSize: 12,
              }}
              formatter={(val) => [
                <span key="v" style={{ color: getScoreHex(Number(val ?? 0)), fontWeight: 700 }}>
                  {val}
                </span>,
                'Score',
              ]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              dot={{ fill: '#e6bef7', r: 4, strokeWidth: 0 }}
              activeDot={{ fill: '#e6bef7', r: 6, strokeWidth: 0, filter: 'drop-shadow(0 0 6px #e6bef7)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* History list */}
      <div className="space-y-1">
        {history.slice().reverse().map((h, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg"
            style={{ background: i % 2 === 0 ? 'rgba(230,190,247,0.02)' : 'transparent' }}
          >
            <div className="flex items-center gap-2.5">
              <TierBadge tier={h.new_tier as RankTier} size="sm" />
              <span className="text-xs" style={{ color: '#9b86b8' }}>
                {formatDate(h.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm" style={{ color: getScoreHex(h.new_score) }}>
                {h.new_score}
              </span>
              {h.delta !== 0 && (
                <span
                  className="text-[10px] font-mono font-semibold w-12 text-right"
                  style={{ color: h.delta > 0 ? '#4ade80' : '#f87171' }}
                >
                  {h.delta > 0 ? `+${h.delta}` : h.delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
