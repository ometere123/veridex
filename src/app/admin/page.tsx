'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { contractSetProtocolFees, contractWithdrawProtocolFees } from '@/lib/genlayer-write';
import { getTreasuryState } from '@/lib/genlayer';

export default function AdminPage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [owner, setOwner] = useState('');
  const [treasury, setTreasury] = useState({
    create_project_fee: '0',
    evaluation_fee: '0',
    reevaluation_fee: '0',
    fees_enabled: false,
    total_fees_collected: '0',
    contract_balance: '0',
  });
  const [form, setForm] = useState({
    create_project_fee: '0',
    evaluation_fee: '0',
    reevaluation_fee: '0',
    fees_enabled: false,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const state = await getTreasuryState();
      if (state) {
        setOwner(state.owner);
        setTreasury(state);
        setForm({
          create_project_fee: state.create_project_fee,
          evaluation_fee: state.evaluation_fee,
          reevaluation_fee: state.reevaluation_fee,
          fees_enabled: state.fees_enabled,
        });
      }
      setLoading(false);
    }

    load().catch(() => {
      setError('Failed to load treasury state');
      setLoading(false);
    });
  }, []);

  const isAdmin = !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  async function refreshState() {
    const state = await getTreasuryState();
    if (!state) return;
    setOwner(state.owner);
    setTreasury(state);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const tx = await contractSetProtocolFees(
        address,
        form.create_project_fee,
        form.evaluation_fee,
        form.reevaluation_fee,
        form.fees_enabled,
      );
      setMessage(`Fee settings submitted: ${tx}`);
      await refreshState();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update fees');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWithdraw() {
    if (!address) return;
    setWithdrawalLoading(true);
    setError('');
    setMessage('');

    try {
      const tx = await contractWithdrawProtocolFees(address);
      setMessage(`Withdrawal submitted: ${tx}`);
      await refreshState();
    } catch (withdrawError) {
      setError(withdrawError instanceof Error ? withdrawError.message : 'Failed to withdraw fees');
    } finally {
      setWithdrawalLoading(false);
    }
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-sm" style={{ color: '#6b6360' }}>Loading admin controls...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-[32px] p-8" style={{ background: '#ffffff', border: '1px solid rgba(107, 142, 122, 0.12)' }}>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Admin</p>
          <h1 className="mt-3 text-3xl font-semibold" style={{ color: '#1a1612' }}>Owner access required</h1>
          <p className="mt-3 text-sm leading-7" style={{ color: '#6b6360' }}>
            This page is only available to the Veridex contract owner. Connect the owner wallet to manage protocol fees and treasury withdrawals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Admin</p>
          <h1 className="mt-3 text-4xl font-semibold" style={{ color: '#1a1612' }}>Protocol Fee Controls</h1>
          <p className="mt-3 text-sm leading-7" style={{ color: '#6b6360' }}>
            Manage `create_project_fee`, `evaluation_fee`, `reevaluation_fee`, `fees_enabled`, and treasury withdrawals for the deployed Veridex contract.
          </p>
        </div>
        <div className="rounded-[28px] p-6" style={{ background: '#ffffff', border: '1px solid rgba(107, 142, 122, 0.12)' }}>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Treasury State</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Create Project Fee', value: treasury.create_project_fee },
              { label: 'Evaluation Fee', value: treasury.evaluation_fee },
              { label: 'Reevaluation Fee', value: treasury.reevaluation_fee },
              { label: 'Fees Enabled', value: treasury.fees_enabled ? 'true' : 'false' },
              { label: 'Contract Balance', value: treasury.contract_balance },
              { label: 'Total Fees Collected', value: treasury.total_fees_collected },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl p-4" style={{ background: 'rgba(107, 142, 122, 0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#9b938a' }}>{item.label}</p>
                <p className="mt-2 font-semibold break-all" style={{ color: '#1a1612' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-[32px] p-8 space-y-6" style={{ background: '#ffffff', border: '1px solid rgba(107, 142, 122, 0.12)' }}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>Fee Settings</p>
          <h2 className="mt-3 text-2xl font-semibold" style={{ color: '#1a1612' }}>Set protocol fees on-chain</h2>
        </div>

        {error && <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(168, 92, 74, 0.08)', color: '#a85c4a' }}>{error}</div>}
        {message && <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(107, 142, 122, 0.08)', color: '#6b8e7a' }}>{message}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: 'create_project_fee', label: 'Create Project Fee' },
            { key: 'evaluation_fee', label: 'Evaluation Fee' },
            { key: 'reevaluation_fee', label: 'Reevaluation Fee' },
          ].map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm font-semibold" style={{ color: '#1a1612' }}>{field.label}</span>
              <input
                value={form[field.key as keyof typeof form] as string}
                onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}
                className="mt-2 w-full rounded-2xl px-4 py-3 text-sm"
                style={{ background: 'rgba(107, 142, 122, 0.05)', color: '#1a1612', outline: 'none' }}
              />
            </label>
          ))}
          <label className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(107, 142, 122, 0.05)' }}>
            <input
              type="checkbox"
              checked={form.fees_enabled}
              onChange={(e) => setForm((current) => ({ ...current, fees_enabled: e.target.checked }))}
            />
            <span className="text-sm font-semibold" style={{ color: '#1a1612' }}>fees_enabled</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#6b8e7a', color: '#ffffff' }}>
            {submitting ? 'Submitting...' : 'set_protocol_fees'}
          </button>
          <button type="button" disabled={withdrawalLoading} onClick={handleWithdraw} className="rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#b8633f', color: '#ffffff' }}>
            {withdrawalLoading ? 'Submitting...' : 'withdraw_protocol_fees'}
          </button>
        </div>
      </form>
      {/* Seed panel link */}
      <div className="rounded-[32px] p-8" style={{ background: '#ffffff', border: '1px solid rgba(107, 142, 122, 0.12)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: '#9b938a' }}>GenLayer Non-Det Testing</p>
            <h2 className="mt-1 text-xl font-semibold" style={{ color: '#1a1612' }}>Seed Real Projects</h2>
            <p className="mt-1 text-sm" style={{ color: '#6b6360' }}>
              Register Uniswap V3, Aave V3, and Arbitrum One with full on-chain evaluation — exercises <code>gl.nondet.web.get()</code> and <code>gl.nondet.exec_prompt()</code>.
            </p>
          </div>
          <Link
            href="/admin/seed"
            className="rounded-full px-6 py-3 text-sm font-semibold shrink-0"
            style={{ background: '#6b8e7a', color: '#ffffff' }}
          >
            Open Seed Panel →
          </Link>
        </div>
      </div>
    </div>
  );
}
