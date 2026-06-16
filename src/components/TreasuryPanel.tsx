import type { TreasuryState } from '@/types';

interface TreasuryPanelProps {
  treasury: TreasuryState;
  className?: string;
}

export function TreasuryPanel({ treasury, className }: TreasuryPanelProps) {
  const rows = [
    { label: 'Create Dossier Fee',    value: `${treasury.create_dossier_fee ?? treasury.create_project_fee} wei`, highlight: false },
    { label: 'Verification Fee',      value: `${treasury.verification_fee ?? treasury.evaluation_fee} GEN`,    highlight: false },
    { label: 'Refresh Fee',           value: `${treasury.refresh_fee ?? treasury.reevaluation_fee} GEN`,  highlight: false },
    { label: 'Contract Balance',      value: `${treasury.contract_balance} GEN`, highlight: false },
    { label: 'Total Fees Collected',  value: `${treasury.total_fees_collected} GEN`, highlight: true },
    { label: 'Fees Enabled',          value: treasury.fees_enabled ? 'Yes' : 'No', highlight: false },
  ];

  return (
    <div
      className={className}
      style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.14)', borderRadius: '24px', padding: '20px' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: '#4f8f68' }}>Fee</span>
        <h3 className="font-semibold text-sm" style={{ color: '#1a1612' }}>Protocol Fee Vault</h3>
      </div>

      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center py-2.5 px-3 rounded-lg"
            style={row.highlight
              ? { background: 'rgba(107,142,122,0.08)', border: '1px solid rgba(107,142,122,0.14)' }
              : { borderBottom: '1px solid rgba(107,142,122,0.08)' }}
          >
            <span className="text-sm" style={{ color: '#5f5a52' }}>{row.label}</span>
            <span className="font-mono font-bold text-sm"
              style={{ color: row.highlight ? '#4f8f68' : '#1a1612' }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] mt-4 leading-relaxed" style={{ color: '#5f5a52' }}>
        Fee collection is governed exclusively by the on-chain Intelligent Contract.
        Balances are transparent and immutable.
      </p>
    </div>
  );
}
