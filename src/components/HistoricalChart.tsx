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
      <div className={cn('text-center py-12', className)} style={{ color: '#9b938a' }}>
        No assessment history recorded yet.
      </div>
    );
  }

  const chartData = history.map((h, i) => ({
    label: `Assessment ${i + 1}`,
    score: h.new_score,
    delta: h.delta,
    date: formatDate(h.timestamp),
  }));

  const avgScore = Math.round(history.reduce((a, h) => a + h.new_score, 0) / history.length);

  return (
    <div className={cn('space-y-5', className)}>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,142,122,0.10)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#9b938a', fontSize: 10 }} axisLine={{ stroke: 'rgba(107,142,122,0.12)' }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#9b938a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <ReferenceLine y={avgScore} stroke="rgba(107,142,122,0.25)" strokeDasharray="4 2" />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid rgba(107,142,122,0.16)',
                borderRadius: '12px',
                color: '#1a1612',
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
              stroke="#6b8e7a"
              strokeWidth={2.5}
              dot={{ fill: '#6b8e7a', r: 4, strokeWidth: 0 }}
              activeDot={{ fill: '#6b8e7a', r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1">
        {history.slice().reverse().map((h, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 px-3 rounded-xl"
            style={{ background: i % 2 === 0 ? 'rgba(107,142,122,0.03)' : 'transparent' }}
          >
            <div className="flex items-center gap-2.5">
              <TierBadge tier={h.new_tier as RankTier} size="sm" />
              <span className="text-xs" style={{ color: '#9b938a' }}>{formatDate(h.timestamp)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm" style={{ color: getScoreHex(h.new_score) }}>
                {h.new_score}
              </span>
              {h.delta !== 0 && (
                <span className="text-[10px] font-mono font-semibold w-12 text-right"
                  style={{ color: h.delta > 0 ? '#6b8e7a' : '#b8633f' }}>
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
