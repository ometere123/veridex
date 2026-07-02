'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { truncateHash, formatDateTime } from '@/utils';
import { contractLockEvidence } from '@/lib/genlayer-write';
import { TxLink } from './TxLink';
import type { Dossier } from '@/types';

interface DossierLockPanelProps {
  dossier: Dossier;
  onLock?: () => void;
  className?: string;
}

export function DossierLockPanel({ dossier, onLock, className }: DossierLockPanelProps) {
  const { address } = useAccount();
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const isIssuer = address?.toLowerCase() === dossier.issuer?.toLowerCase();
  const isLocked = dossier.status !== 'DRAFT';
  const canLock = isIssuer && !isLocked;

  async function handleLock() {
    if (!address) return;
    setLocking(true);
    setError('');
    setTxHash('');
    try {
      await contractLockEvidence(address, dossier.dossier_id, setTxHash);
      onLock?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to lock evidence');
    } finally {
      setLocking(false);
    }
  }

  return (
    <section
      className={className}
      style={{
        background: '#0b1712cc',
        border: isLocked ? '1px solid rgba(142,255,195,0.24)' : '1px solid rgba(212,173,99,0.30)',
        borderRadius: '28px',
        padding: '22px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            background: isLocked ? '#8effc3' : '#d4ad63',
            boxShadow: isLocked ? '0 0 6px rgba(142,255,195,0.5)' : '0 0 6px rgba(212,173,99,0.4)',
          }}
        />
        <h3 className="font-semibold text-sm text-[#f5fff7]">Evidence Lock</h3>
      </div>

      {isLocked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-2xl"
            style={{ background: 'rgba(142,255,195,0.10)', color: '#8effc3' }}>
            Locked: evidence is immutable on-chain
          </div>
          {dossier.locked_at && (
            <div className="text-xs text-[#9bb4a6]">
              Locked: {formatDateTime(dossier.locked_at)}
            </div>
          )}
          {dossier.evidence_hash && (
            <div className="rounded-2xl p-3" style={{ background: 'rgba(142,255,195,0.05)', border: '1px solid rgba(142,255,195,0.12)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1 text-[#6fae8e]">Evidence Hash</div>
              <code className="text-xs break-all block font-mono text-[#8effc3]">
                {truncateHash(dossier.evidence_hash, 20)}
              </code>
            </div>
          )}
          <p className="text-xs text-[#789685]">No modifications permitted after locking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#9bb4a6]">
            Evidence is still <span className="font-semibold text-[#d4ad63]">editable</span>.
            Lock it before submitting for GenLayer verification.
          </p>
          <div className="rounded-2xl p-3 text-xs" style={{ background: 'rgba(212,173,99,0.08)', border: '1px solid rgba(212,173,99,0.20)', color: '#d4ad63' }}>
            ⚠ Locking is permanent. No edits after this action.
          </div>
          {error && <p className="text-sm text-[#e07a5f]">{error}</p>}
          {locking && txHash && (
            <div className="rounded-2xl p-3 text-xs" style={{ background: 'rgba(142,255,195,0.06)', border: '1px solid rgba(142,255,195,0.16)' }}>
              <TxLink hash={txHash} label="Submitted - view on explorer" />
            </div>
          )}
          {canLock && (
            <button
              onClick={handleLock}
              disabled={locking}
              className="w-full font-semibold py-2.5 px-4 rounded-2xl text-sm transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8effc3, #4ddf98)', color: '#04100b' }}
            >
              {locking ? 'Locking, approve in wallet…' : 'Lock Evidence'}
            </button>
          )}
          {!isIssuer && address && (
            <p className="text-xs text-[#789685]">Only the dossier issuer can lock evidence.</p>
          )}
        </div>
      )}
    </section>
  );
}
