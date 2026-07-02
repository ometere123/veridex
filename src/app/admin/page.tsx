'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { formatDateTime } from '@/utils';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import {
  getProofLedger,
  getProtocolFees,
  getTotalEvaluations,
  getTotalProjects,
  getTreasuryState,
  getVerificationModel,
} from '@/lib/genlayer';
import { contractSetProtocolFees, contractWithdrawProtocolFees } from '@/lib/genlayer-write';
import { VERIDEX_CONTRACT_ADDRESS } from '@/lib/veridex-contract';
import type { ProofEvent } from '@/types';

type TreasurySnapshot = {
  owner: string;
  total_fees_collected: string;
  contract_balance: string;
  fees_enabled: boolean;
  create_dossier_fee: string;
  verification_fee: string;
  refresh_fee: string;
};

type ProtocolModel = {
  version: string;
  verification_levels: string[];
  risk_bands: string[];
  dimensions: Record<string, number>;
  verification_window_days?: number;
};

type ConsoleData = {
  treasury: TreasurySnapshot;
  model: ProtocolModel;
  totalDossiers: number;
  totalVerifications: number;
  treasuryEvents: ProofEvent[];
};

const EMPTY_TREASURY: TreasurySnapshot = {
  owner: '',
  total_fees_collected: '0',
  contract_balance: '0',
  fees_enabled: false,
  create_dossier_fee: '0',
  verification_fee: '0',
  refresh_fee: '0',
};

const DEFAULT_MODEL: ProtocolModel = {
  version: 'VERIDEX_DOSSIER_V1',
  verification_levels: ['VERIFIED_PLUS', 'VERIFIED', 'SUBSTANTIATED', 'DEVELOPING', 'LIMITED_EVIDENCE', 'HIGH_RISK', 'UNVERIFIABLE'],
  risk_bands: ['LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL', 'UNKNOWN'],
  dimensions: {},
};

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConsoleData | null>(null);
  const [form, setForm] = useState({
    createDossierFee: '0',
    verificationFee: '0',
    refreshFee: '0',
    feesEnabled: false,
  });
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    void loadConsole();
  }, [mounted]);

  const owner = data?.treasury.owner ?? '';
  const isOwner = !!address && !!owner && address.toLowerCase() === owner.toLowerCase();
  const treasuryBalance = BigInt(data?.treasury.total_fees_collected || data?.treasury.contract_balance || '0');

  const review = useMemo(() => {
    try {
      return {
        createDossierFeeBase: parseHumanGen(form.createDossierFee).toString(),
        verificationFeeBase: parseHumanGen(form.verificationFee).toString(),
        refreshFeeBase: parseHumanGen(form.refreshFee).toString(),
      };
    } catch {
      return null;
    }
  }, [form.createDossierFee, form.verificationFee, form.refreshFee]);

  async function loadConsole() {
    setLoading(true);
    setError('');

    try {
      const [treasuryState, protocolFees, model, totalDossiers, totalVerifications, treasuryEvents] = await Promise.all([
        getTreasuryState(),
        getProtocolFees(),
        getVerificationModel(),
        getTotalProjects().catch(() => 0),
        getTotalEvaluations().catch(() => 0),
        getProofLedger('treasury').catch(() => []),
      ]);

      const normalizedTreasury = normalizeTreasury(treasuryState, protocolFees);
      const normalizedModel = model ?? DEFAULT_MODEL;

      setData({
        treasury: normalizedTreasury,
        model: normalizedModel,
        totalDossiers,
        totalVerifications,
        treasuryEvents: treasuryEvents.filter((event) => event.event_type === 'FEE_PAID' || event.event_type === 'FEE_WITHDRAWN'),
      });
      setForm({
        createDossierFee: formatBaseUnits(normalizedTreasury.create_dossier_fee),
        verificationFee: formatBaseUnits(normalizedTreasury.verification_fee),
        refreshFee: formatBaseUnits(normalizedTreasury.refresh_fee),
        feesEnabled: normalizedTreasury.fees_enabled,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to read protocol owner state.');
    } finally {
      setLoading(false);
    }
  }

  function validateFees() {
    const fields = [form.createDossierFee, form.verificationFee, form.refreshFee];
    if (!fields.every((value) => /^\d+(\.\d+)?$/.test(value.trim()))) {
      throw new Error('Fee values must be non-negative GEN numbers.');
    }
    return {
      createDossierFeeBase: parseHumanGen(form.createDossierFee).toString(),
      verificationFeeBase: parseHumanGen(form.verificationFee).toString(),
      refreshFeeBase: parseHumanGen(form.refreshFee).toString(),
    };
  }

  function handleReview(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      validateFees();
      setShowReview(true);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Invalid fee values.');
    }
  }

  async function submitFees() {
    if (!address) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const nextFees = validateFees();
      const tx = await contractSetProtocolFees(
        address,
        nextFees.createDossierFeeBase,
        nextFees.verificationFeeBase,
        nextFees.refreshFeeBase,
        form.feesEnabled,
      );
      setMessage(`Protocol fee update submitted: ${tx}`);
      setShowReview(false);
      await loadConsole();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update protocol fees.');
    } finally {
      setSubmitting(false);
    }
  }

  async function withdrawFees() {
    if (!address) return;
    setWithdrawing(true);
    setError('');
    setMessage('');

    try {
      const tx = await contractWithdrawProtocolFees(address);
      setMessage(`Treasury withdrawal submitted: ${tx}`);
      await loadConsole();
    } catch (withdrawError) {
      setError(withdrawError instanceof Error ? withdrawError.message : 'Failed to withdraw protocol fees.');
    } finally {
      setWithdrawing(false);
    }
  }

  if (!mounted || loading) {
    return (
      <ConsoleShell>
        <AccessPanel eyebrow="Protocol Owner Console" title="Reading owner seal..." body="Veridex is reading owner, treasury, and model state directly from the deployed GenLayer contract." />
      </ConsoleShell>
    );
  }

  if (!isConnected) {
    return (
      <ConsoleShell>
        <AccessPanel
          eyebrow="Owner access"
          title="Connect the contract owner wallet to access the Protocol Owner Console."
          body="The contract owner is read from get_treasury_state(). No owner address is hardcoded in the interface."
        >
          <WalletConnectButton />
        </AccessPanel>
      </ConsoleShell>
    );
  }

  if (!isOwner) {
    return (
      <ConsoleShell>
        <AccessPanel
          eyebrow="Access denied"
          title="This wallet is not the Veridex protocol owner."
          body="Fee controls and withdrawal actions are hidden unless the connected wallet matches the owner returned by the contract."
        >
          <div className="grid gap-3 text-xs font-mono">
            <AddressRow label="Connected wallet" value={address ?? ''} />
            <AddressRow label="Contract owner" value={owner || 'Unavailable'} />
          </div>
          <button
            onClick={() => disconnect()}
            className="mt-5 rounded-full px-5 py-3 text-sm font-semibold"
            style={{ background: 'rgba(142,255,195,0.16)', color: '#dfffee', border: '1px solid rgba(142,255,195,0.28)' }}
          >
            Switch Wallet
          </button>
        </AccessPanel>
      </ConsoleShell>
    );
  }

  const consoleData = data ?? {
    treasury: EMPTY_TREASURY,
    model: DEFAULT_MODEL,
    totalDossiers: 0,
    totalVerifications: 0,
    treasuryEvents: [],
  };

  return (
    <ConsoleShell>
      <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#8effc3]">Protocol Owner Console</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight text-[#f5fff7]">
            Operations room for the Veridex evidence registry.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9bb4a6]">
            Owner-only controls for fee schedules, treasury withdrawals, model visibility, and proof-event monitoring. Contract state remains the source of truth.
          </p>
        </div>
        <OwnerIdentityCard owner={consoleData.treasury.owner} connected={address ?? ''} />
      </div>

      {error ? <Notice tone="danger">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}

      <ProtocolMetricsStrip totalDossiers={consoleData.totalDossiers} totalVerifications={consoleData.totalVerifications} modelVersion={consoleData.model.version} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <OwnerPanel title="Protocol Identity" eyebrow="GenLayer source of truth">
          <div className="grid gap-3">
            <AddressRow label="Contract address" value={VERIDEX_CONTRACT_ADDRESS} />
            <AddressRow label="Contract owner" value={consoleData.treasury.owner} />
            <InfoRow label="Network" value="GenLayer StudioNet" />
            <InfoRow label="Contract model" value={consoleData.model.version} />
            <InfoRow label="Verification window" value={consoleData.model.verification_window_days ? `${consoleData.model.verification_window_days} days` : 'Contract default'} />
          </div>
        </OwnerPanel>

        <TreasuryVaultCard treasury={consoleData.treasury} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <FeeControlPanel
          form={form}
          setForm={setForm}
          review={review}
          showReview={showReview}
          submitting={submitting}
          onReview={handleReview}
          onCancelReview={() => setShowReview(false)}
          onSubmitFees={submitFees}
        />
        <WithdrawFeesButton
          treasuryBalance={treasuryBalance}
          owner={consoleData.treasury.owner}
          withdrawing={withdrawing}
          onWithdraw={withdrawFees}
        />
      </div>

      <TreasuryProofEvents events={consoleData.treasuryEvents} />
    </ConsoleShell>
  );
}

function ConsoleShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-10 text-[#f5fff7]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(142,255,195,0.16),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(184,99,63,0.18),transparent_26%),linear-gradient(135deg,#07110d_0%,#0b1712_44%,#11100c_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-35 [background-image:linear-gradient(rgba(142,255,195,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(142,255,195,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

function AccessPanel({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: ReactNode }) {
  return (
    <div className="mx-auto mt-16 max-w-3xl rounded-[36px] border border-[#8effc333] bg-[#0b1712cc] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.34em] text-[#8effc3]">{eyebrow}</p>
      <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#f5fff7]">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-[#9bb4a6]">{body}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

function OwnerIdentityCard({ owner, connected }: { owner: string; connected: string }) {
  return (
    <div className="rounded-[32px] border border-[#8effc333] bg-[#0b1712cc] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#8effc3]">Owner identity seal</p>
      <div className="mt-5 rounded-3xl border border-[#8effc326] bg-[#8effc30a] p-4">
        <p className="text-xs text-[#9bb4a6]">Authenticated owner wallet</p>
        <p className="mt-2 break-all font-mono text-sm text-[#f5fff7]">{connected}</p>
      </div>
      <div className="mt-3 rounded-3xl border border-[#b8633f33] bg-[#b8633f12] p-4">
        <p className="text-xs text-[#d4a28f]">Contract owner from treasury state</p>
        <p className="mt-2 break-all font-mono text-sm text-[#fff1eb]">{owner}</p>
      </div>
    </div>
  );
}

function ProtocolMetricsStrip({ totalDossiers, totalVerifications, modelVersion }: { totalDossiers: number; totalVerifications: number; modelVersion: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Metric label="Total dossiers" value={totalDossiers.toLocaleString()} />
      <Metric label="Total verifications" value={totalVerifications.toLocaleString()} />
      <Metric label="Verification model" value={modelVersion} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-[#8effc326] bg-[#0b1712cc] p-5 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#6fae8e]">{label}</p>
      <p className="mt-3 break-all font-mono text-2xl font-semibold text-[#f5fff7]">{value}</p>
    </div>
  );
}

function OwnerPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[32px] border border-[#8effc326] bg-[#0b1712cc] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-[#f5fff7]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TreasuryVaultCard({ treasury }: { treasury: TreasurySnapshot }) {
  return (
    <OwnerPanel eyebrow="Fee vault monitor" title="Treasury State">
      <div className="grid gap-3 sm:grid-cols-2">
        <VaultCell label="Total fees collected" value={`${formatBaseUnits(treasury.total_fees_collected)} GEN`} glow />
        <VaultCell label="Contract balance" value={`${formatBaseUnits(treasury.contract_balance)} GEN`} />
        <VaultCell label="Fees enabled" value={treasury.fees_enabled ? 'Enabled' : 'Disabled'} />
        <VaultCell label="Create dossier fee" value={`${formatBaseUnits(treasury.create_dossier_fee)} GEN`} />
        <VaultCell label="Verification fee" value={`${formatBaseUnits(treasury.verification_fee)} GEN`} />
        <VaultCell label="Refresh fee" value={`${formatBaseUnits(treasury.refresh_fee)} GEN`} />
      </div>
    </OwnerPanel>
  );
}

function VaultCell({ label, value, glow = false }: { label: string; value: string; glow?: boolean }) {
  return (
    <div className={`rounded-3xl border p-4 ${glow ? 'border-[#8effc34d] bg-[#8effc314]' : 'border-[#8effc31f] bg-[#ffffff08]'}`}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#6fae8e]">{label}</p>
      <p className="mt-2 break-all font-mono text-lg text-[#f5fff7]">{value}</p>
    </div>
  );
}

function FeeControlPanel({
  form,
  setForm,
  review,
  showReview,
  submitting,
  onReview,
  onCancelReview,
  onSubmitFees,
}: {
  form: { createDossierFee: string; verificationFee: string; refreshFee: string; feesEnabled: boolean };
  setForm: Dispatch<SetStateAction<{ createDossierFee: string; verificationFee: string; refreshFee: string; feesEnabled: boolean }>>;
  review: { createDossierFeeBase: string; verificationFeeBase: string; refreshFeeBase: string } | null;
  showReview: boolean;
  submitting: boolean;
  onReview: (event: FormEvent) => void;
  onCancelReview: () => void;
  onSubmitFees: () => Promise<void>;
}) {
  return (
    <OwnerPanel eyebrow="Protocol controls panel" title="Fee Controls">
      <form onSubmit={onReview} className="space-y-4">
        <FeeInput label="Create dossier fee" value={form.createDossierFee} onChange={(value) => setForm((current) => ({ ...current, createDossierFee: value }))} />
        <FeeInput label="Verification fee" value={form.verificationFee} onChange={(value) => setForm((current) => ({ ...current, verificationFee: value }))} />
        <FeeInput label="Refresh fee" value={form.refreshFee} onChange={(value) => setForm((current) => ({ ...current, refreshFee: value }))} />
        <label className="flex items-center justify-between rounded-3xl border border-[#8effc326] bg-[#ffffff08] px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-[#f5fff7]">Fees enabled</span>
            <span className="text-xs text-[#9bb4a6]">Toggle protocol fee collection.</span>
          </span>
          <input
            type="checkbox"
            checked={form.feesEnabled}
            onChange={(event) => setForm((current) => ({ ...current, feesEnabled: event.target.checked }))}
            className="h-5 w-5 accent-[#8effc3]"
          />
        </label>
        <button type="submit" className="w-full rounded-full px-5 py-3 text-sm font-semibold text-[#07110d]" style={{ background: '#8effc3' }}>
          Review fee update
        </button>
      </form>

      {showReview && review ? (
        <div className="mt-5 rounded-3xl border border-[#b8633f4d] bg-[#b8633f14] p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4a28f]">Review before transaction</p>
          <div className="mt-4 grid gap-2 text-xs">
            <InfoRow label="Create dossier fee" value={`${form.createDossierFee} GEN / ${review.createDossierFeeBase} base units`} />
            <InfoRow label="Verification fee" value={`${form.verificationFee} GEN / ${review.verificationFeeBase} base units`} />
            <InfoRow label="Refresh fee" value={`${form.refreshFee} GEN / ${review.refreshFeeBase} base units`} />
            <InfoRow label="Fee status" value={form.feesEnabled ? 'Enabled' : 'Disabled'} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void onSubmitFees()}
              disabled={submitting}
              className="rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50"
              style={{ background: '#8effc3', color: '#07110d' }}
            >
              {submitting ? 'Submitting...' : 'Send set_protocol_fees'}
            </button>
            <button type="button" onClick={onCancelReview} className="rounded-full border border-[#8effc326] px-5 py-3 text-sm font-semibold text-[#dfffee]">
              Edit values
            </button>
          </div>
        </div>
      ) : null}
    </OwnerPanel>
  );
}

function FeeInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#f5fff7]">{label}</span>
      <div className="mt-2 flex overflow-hidden rounded-3xl border border-[#8effc326] bg-[#ffffff08]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-[#f5fff7] outline-none"
          placeholder="0"
          inputMode="decimal"
        />
        <span className="border-l border-[#8effc326] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8effc3]">GEN</span>
      </div>
    </label>
  );
}

function WithdrawFeesButton({ treasuryBalance, owner, withdrawing, onWithdraw }: { treasuryBalance: bigint; owner: string; withdrawing: boolean; onWithdraw: () => Promise<void> }) {
  const disabled = treasuryBalance === BigInt(0) || withdrawing;

  return (
    <OwnerPanel eyebrow="Owner withdrawal" title="Withdraw Fees">
      <div className="rounded-3xl border border-[#b8633f4d] bg-[#b8633f14] p-5">
        <p className="text-sm leading-7 text-[#ffd9ce]">
          This will withdraw accumulated protocol fees to the contract owner address.
        </p>
        <p className="mt-3 break-all font-mono text-xs text-[#d4a28f]">{owner}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => void onWithdraw()}
        className="mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
        style={{ background: disabled ? 'rgba(255,255,255,0.10)' : '#b8633f', color: '#fff7f2' }}
      >
        {withdrawing ? 'Submitting withdrawal...' : treasuryBalance === BigInt(0) ? 'Treasury is empty' : 'withdraw_protocol_fees'}
      </button>
    </OwnerPanel>
  );
}

function TreasuryProofEvents({ events }: { events: ProofEvent[] }) {
  return (
    <section className="mt-6 rounded-[32px] border border-[#8effc326] bg-[#06100ccc] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">Proof event terminal</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#f5fff7]">Treasury Proof Events</h2>
        </div>
        <span className="rounded-full border border-[#8effc326] px-3 py-1 text-xs font-mono text-[#8effc3]">get_proof_ledger(&quot;treasury&quot;)</span>
      </div>
      {events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#8effc326] p-8 text-center text-sm text-[#9bb4a6]">
          No FEE_PAID or FEE_WITHDRAWN events are stored for the treasury ledger yet.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.event_id} className="rounded-3xl border border-[#8effc31f] bg-[#ffffff08] p-4 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-[#8effc314] px-3 py-1 text-[#8effc3]">{event.event_type}</span>
                <span className="text-[#6fae8e]">{formatDateTime(event.timestamp)}</span>
              </div>
              <p className="mt-3 text-[#f5fff7]">{event.summary}</p>
              <p className="mt-2 break-all text-[#9bb4a6]">event hash: {event.event_hash}</p>
              <p className="mt-1 break-all text-[#9bb4a6]">related hash: {event.related_hash || 'none'}</p>
              <p className="mt-1 break-all text-[#9bb4a6]">actor: {event.actor}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Notice({ tone, children }: { tone: 'success' | 'danger'; children: ReactNode }) {
  const isSuccess = tone === 'success';
  return (
    <div
      className="mb-5 rounded-3xl border px-5 py-4 text-sm"
      style={{
        background: isSuccess ? 'rgba(142,255,195,0.10)' : 'rgba(184,99,63,0.12)',
        borderColor: isSuccess ? 'rgba(142,255,195,0.24)' : 'rgba(184,99,63,0.30)',
        color: isSuccess ? '#dfffee' : '#ffd9ce',
      }}
    >
      {children}
    </div>
  );
}

function AddressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#8effc31f] bg-[#ffffff08] p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#6fae8e]">{label}</p>
      <p className="mt-2 break-all font-mono text-xs text-[#f5fff7]">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#8effc31f] bg-[#ffffff08] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.18em] text-[#6fae8e]">{label}</span>
      <span className="break-all text-right font-mono text-sm text-[#f5fff7]">{value}</span>
    </div>
  );
}

function normalizeTreasury(
  treasuryState: Awaited<ReturnType<typeof getTreasuryState>>,
  protocolFees: Awaited<ReturnType<typeof getProtocolFees>>,
): TreasurySnapshot {
  return {
    owner: treasuryState?.owner ?? '',
    total_fees_collected: treasuryState?.total_fees_collected ?? '0',
    contract_balance: treasuryState?.contract_balance ?? '0',
    fees_enabled: treasuryState?.fees_enabled ?? protocolFees.fees_enabled,
    create_dossier_fee: treasuryState?.create_dossier_fee ?? protocolFees.create_dossier_fee ?? treasuryState?.create_project_fee ?? '0',
    verification_fee: treasuryState?.verification_fee ?? protocolFees.verification_fee ?? treasuryState?.evaluation_fee ?? '0',
    refresh_fee: treasuryState?.refresh_fee ?? protocolFees.refresh_fee ?? treasuryState?.reevaluation_fee ?? '0',
  };
}

function parseHumanGen(value: string): bigint {
  const cleaned = value.trim();
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    throw new Error('Invalid GEN amount.');
  }
  return parseEther(cleaned);
}

function formatBaseUnits(value: string): string {
  try {
    const formatted = formatEther(BigInt(value || '0'));
    return formatted.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  } catch {
    return '0';
  }
}
