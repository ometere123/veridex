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
  background: '#ffffff',
  border: '1px solid rgba(107,142,122,0.14)',
  borderRadius: '24px',
  padding: '24px',
};

export default async function TreasuryPage() {
  const treasury = await fetchTreasury();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="mb-3 text-[11px] uppercase tracking-[0.26em]" style={{ color: '#8a8178' }}>Protocol Fee Transparency</p>
        <h1 className="text-3xl font-semibold mb-2" style={{ color: '#1a1612' }}>Treasury</h1>
        <p className="text-sm leading-7" style={{ color: '#5f5a52' }}>
          Create-dossier, verification, and refresh fees are stored and managed by the Veridex GenLayer Intelligent Contract on-chain.
        </p>
      </div>

      <TreasuryPanel treasury={treasury} className="mb-6" />

      {/* Fee structure breakdown */}
      <div style={PANEL}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: '#1a1612' }}>Rate Schedule</h2>
        <div className="space-y-3">
          {[
            { label: 'Verification Cycle', value: `${treasury.verification_fee ?? treasury.evaluation_fee} GEN`, desc: 'Paid when submitting a locked dossier for verification' },
            { label: 'Refresh Cycle', value: `${treasury.refresh_fee ?? treasury.reevaluation_fee} GEN`, desc: 'Paid when requesting a dossier re-verification' },
          ].map((fee) => (
            <div
              key={fee.label}
              className="flex items-center justify-between p-3 rounded-sm"
              style={{ background: 'rgba(107,142,122,0.06)', border: '1px solid rgba(107,142,122,0.10)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: '#1a1612' }}>{fee.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#5f5a52' }}>{fee.desc}</p>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: '#4f8f68' }}>{fee.value}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-4 rounded-sm p-3 text-xs leading-relaxed"
          style={{ background: 'rgba(107,142,122,0.05)', borderTop: '1px solid rgba(107,142,122,0.10)', color: '#5f5a52' }}
        >
          Fees are paid directly to the GenLayer contract.
          Withdrawal is only available to the contract owner via <code className="font-mono" style={{ color: '#4f8f68' }}>withdraw_protocol_fees()</code>.
        </div>
      </div>
    </div>
  );
}
