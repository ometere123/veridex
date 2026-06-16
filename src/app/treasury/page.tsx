import type { Metadata } from 'next';
import { formatEther } from 'viem';
import { getTreasuryState } from '@/lib/genlayer';
import type { TreasuryState } from '@/types';

export const metadata: Metadata = {
  title: 'Treasury - Veridex',
  description: 'Read-only Veridex protocol fee transparency.',
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
      create_dossier_fee: '0',
      verification_fee: '0',
      refresh_fee: '0',
      fees_enabled: false,
      owner: '',
    };
  }
}

export default async function TreasuryPage() {
  const treasury = await fetchTreasury();

  const fees = [
    { label: 'Create dossier fee', value: treasury.create_dossier_fee ?? treasury.create_project_fee, desc: 'Paid when creating a new evidence dossier.' },
    { label: 'Verification fee', value: treasury.verification_fee ?? treasury.evaluation_fee, desc: 'Paid when submitting a locked dossier for verification.' },
    { label: 'Refresh fee', value: treasury.refresh_fee ?? treasury.reevaluation_fee, desc: 'Paid when requesting a new verification cycle.' },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section className="mb-6 rounded-[40px] border border-[#8effc333] bg-[#0b1712cc] p-7 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[#8effc3]">Protocol Fee Transparency</p>
        <h1 className="mt-4 text-5xl font-semibold text-[#f5fff7]">Public Treasury</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9bb4a6]">
          This page is read-only. Fee updates and withdrawals are only available to the contract owner in the Protocol Owner Console.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <TreasuryMetric label="Total fees collected" value={`${formatBase(treasury.total_fees_collected)} GEN`} />
        <TreasuryMetric label="Contract balance" value={`${formatBase(treasury.contract_balance)} GEN`} />
        <TreasuryMetric label="Protocol fee status" value={treasury.fees_enabled ? 'Enabled' : 'Disabled'} />
        <TreasuryMetric label="Owner address" value={treasury.owner || 'Unavailable'} />
      </section>

      <section className="mt-6 rounded-[36px] border border-[#8effc326] bg-[#0b1712cc] p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-[#f5fff7]">Fee Schedule</h2>
        <div className="mt-5 space-y-3">
          {fees.map((fee) => (
            <div key={fee.label} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#8effc31f] bg-[#ffffff08] p-4">
              <div>
                <p className="font-semibold text-[#f5fff7]">{fee.label}</p>
                <p className="mt-1 text-xs text-[#9bb4a6]">{fee.desc}</p>
              </div>
              <span className="font-mono text-sm text-[#8effc3]">{formatBase(fee.value)} GEN</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function TreasuryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[30px] border border-[#8effc326] bg-[#0b1712cc] p-5 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#6fae8e]">{label}</p>
      <p className="mt-3 break-all font-mono text-xl text-[#f5fff7]">{value}</p>
    </div>
  );
}

function formatBase(value?: string) {
  try {
    return formatEther(BigInt(value || '0')).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  } catch {
    return '0';
  }
}
