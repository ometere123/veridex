import type { TreasuryState } from '@/types';

interface TreasuryPanelProps {
  treasury: TreasuryState;
  className?: string;
}

export function TreasuryPanel({ treasury, className }: TreasuryPanelProps) {
  const rows = [
    { label: 'Evaluation Fee',        value: `${treasury.evaluation_fee} GEN`,    highlight: false },
    { label: 'Reevaluation Fee',      value: `${treasury.reevaluation_fee} GEN`,  highlight: false },
    { label: 'Total Evaluations Paid',value: String(treasury.total_evaluations_paid), highlight: false },
    { label: 'Total Fees Collected',  value: `${treasury.total_fees_collected} GEN`, highlight: true },
  ];

  return (
    <div
      className={className}
      style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.08)', borderRadius: '14px', padding: '20px' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: '#e6bef7' }}>◉</span>
        <h3 className="font-semibold text-sm" style={{ color: '#f5eeff' }}>Protocol Treasury</h3>
      </div>

      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center py-2.5 px-3 rounded-lg"
            style={row.highlight
              ? { background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.12)' }
              : { borderBottom: '1px solid rgba(230,190,247,0.05)' }}
          >
            <span className="text-sm" style={{ color: '#9b86b8' }}>{row.label}</span>
            <span className="font-mono font-bold text-sm"
              style={{ color: row.highlight ? '#4ade80' : '#ddd0f0' }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] mt-4 leading-relaxed" style={{ color: '#6b5490' }}>
        Treasury is managed exclusively by the GenLayer Intelligent Contract.
        All fees are stored on-chain.
      </p>
    </div>
  );
}
