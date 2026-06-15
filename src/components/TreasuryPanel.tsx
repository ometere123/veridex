import type { TreasuryState } from '@/types';

interface TreasuryPanelProps {
  treasury: TreasuryState;
  className?: string;
}

export function TreasuryPanel({ treasury, className }: TreasuryPanelProps) {
  const rows = [
    { label: 'Create Project Fee',    value: `${treasury.create_project_fee} wei`, highlight: false },
    { label: 'Evaluation Fee',        value: `${treasury.evaluation_fee} GEN`,    highlight: false },
    { label: 'Reevaluation Fee',      value: `${treasury.reevaluation_fee} GEN`,  highlight: false },
    { label: 'Contract Balance',      value: `${treasury.contract_balance} GEN`, highlight: false },
    { label: 'Total Fees Collected',  value: `${treasury.total_fees_collected} GEN`, highlight: true },
    { label: 'Fees Enabled',          value: treasury.fees_enabled ? 'Yes' : 'No', highlight: false },
  ];

  return (
    <div
      className={className}
      style={{ background: '#0a0f1a', border: '1px solid rgba(0,217,255,0.08)', borderRadius: '14px', padding: '20px' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: '#00d9ff' }}>◉</span>
        <h3 className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>Fee Vault</h3>
      </div>

      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center py-2.5 px-3 rounded-lg"
            style={row.highlight
              ? { background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.12)' }
              : { borderBottom: '1px solid rgba(0,217,255,0.05)' }}
          >
            <span className="text-sm" style={{ color: '#94a3b8' }}>{row.label}</span>
            <span className="font-mono font-bold text-sm"
              style={{ color: row.highlight ? '#4ade80' : '#cbd5e1' }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] mt-4 leading-relaxed" style={{ color: '#64748b' }}>
        Fee collection is governed exclusively by the on-chain Intelligent Contract.
        Balances are transparent and immutable.
      </p>
    </div>
  );
}
