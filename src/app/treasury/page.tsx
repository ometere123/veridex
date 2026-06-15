import type { Metadata } from 'next';
import { TreasuryPanel } from '@/components/TreasuryPanel';
import { getTreasuryState } from '@/lib/genlayer';
import type { TreasuryState } from '@/types';

export const metadata: Metadata = {
  title: 'Treasury - Veridex',
  description: 'Veridex protocol treasury - fee structure and on-chain fund management.',
};
export const dynamic = 'force-dynamic';

async function fetchTreasury(): Promise<TreasuryState> {
  try {
    const state = await getTreasuryState();
    if (!state) throw new Error('No treasury state');
    return state;
  } catch {
    return {
      total_fees_collected: '0',
      contract_balance: '0',
      create_project_fee: '0',
      evaluation_fee: '0',
      reevaluation_fee: '0',
      fees_enabled: false,
      owner: '',
    };
  }
}

const PANEL = {
  background: '#0a0f1a',
  border: '1px solid rgba(0,217,255,0.08)',
  borderRadius: '14px',
  padding: '24px',
};

export default async function TreasuryPage() {
  const treasury = await fetchTreasury();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: '#e2e8f0' }}>Fee Vault</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          All protocol fees are stored and managed by the GenLayer Intelligent Contract on-chain.
        </p>
      </div>

      <TreasuryPanel treasury={treasury} className="mb-6" />

      {/* Fee structure breakdown */}
      <div style={PANEL}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: '#e2e8f0' }}>Rate Schedule</h2>
        <div className="space-y-3">
          {[
            { label: 'Primary Assessment',   value: `${treasury.evaluation_fee} GEN`,   desc: 'Paid when submitting project for first evaluation' },
            { label: 'Reassessment Cycle', value: `${treasury.reevaluation_fee} GEN`, desc: 'Paid when requesting a second evaluation cycle' },
          ].map((fee) => (
            <div
              key={fee.label}
              className="flex items-center justify-between p-3 rounded-sm"
              style={{ background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.07)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{fee.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>{fee.desc}</p>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: '#00d9ff' }}>{fee.value}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-4 rounded-sm p-3 text-xs leading-relaxed"
          style={{ background: 'rgba(0,217,255,0.03)', borderTop: '1px solid rgba(0,217,255,0.07)', color: '#64748b' }}
        >
          Fees are paid directly to the GenLayer contract.
          Withdrawal is only available to the contract owner via <code className="font-mono" style={{ color: '#94a3b8' }}>withdraw_protocol_fees()</code>.
        </div>
      </div>
    </div>
  );
}
