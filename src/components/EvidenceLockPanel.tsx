'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { truncateHash, formatDateTime } from '@/utils';
import { contractLockProject } from '@/lib/genlayer-write';
import { getProject } from '@/lib/genlayer';
import type { Project } from '@/types';

interface EvidenceLockPanelProps {
  project: Project;
  onLock?: () => void;
  className?: string;
}

export function EvidenceLockPanel({ project, onLock, className }: EvidenceLockPanelProps) {
  const { address } = useAccount();
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState('');

  const isOwner = address?.toLowerCase() === project.owner?.toLowerCase();
  const isLocked = project.status !== 'draft';
  const canLock = isOwner && !isLocked;

  async function handleLock() {
    if (!address) return;
    setLocking(true);
    setError('');
    try {
      const txHash = await contractLockProject(address, project.project_id);
      let evidenceHash = '';
      try {
        const updated = await getProject(project.project_id);
        evidenceHash = updated?.evidence_hash || '';
      } catch { /* non-fatal */ }
      await fetch('/api/projects/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.project_id,
          wallet: address,
          evidence_hash: evidenceHash,
          tx_hash: txHash,
        }),
      });
      onLock?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to lock source data');
    } finally {
      setLocking(false);
    }
  }

  return (
    <div
      className={className}
      style={{
        background: '#ffffff',
        border: isLocked
          ? '1px solid rgba(107,142,122,0.20)'
          : '1px solid rgba(184,99,63,0.18)',
        borderRadius: '20px',
        padding: '20px',
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            background: isLocked ? '#6b8e7a' : '#b8633f',
            boxShadow: isLocked
              ? '0 0 6px rgba(107,142,122,0.5)'
              : '0 0 6px rgba(184,99,63,0.4)',
          }}
        />
        <h3 className="font-semibold text-sm" style={{ color: '#1a1612' }}>
          Source Data Lock
        </h3>
      </div>

      {isLocked ? (
        <div className="space-y-3">
          <div
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl"
            style={{ background: 'rgba(107,142,122,0.08)', color: '#6b8e7a' }}
          >
            🔒 Locked: immutable on-chain
          </div>
          {project.locked_at && (
            <div className="text-xs" style={{ color: '#9b938a' }}>
              <span>Locked: </span>
              {formatDateTime(project.locked_at)}
            </div>
          )}
          {project.evidence_hash && (
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(107,142,122,0.05)', border: '1px solid rgba(107,142,122,0.12)' }}
            >
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9b938a' }}>
                Source Hash
              </div>
              <code className="text-xs break-all block font-mono" style={{ color: '#6b8e7a' }}>
                {truncateHash(project.evidence_hash, 20)}
              </code>
            </div>
          )}
          <p className="text-xs" style={{ color: '#9b938a' }}>
            No modifications permitted after locking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#6b6360' }}>
            Source data is{' '}
            <span className="font-semibold" style={{ color: '#b8633f' }}>editable</span>.
            Lock it before submitting for GenLayer assessment.
          </p>
          <div
            className="rounded-xl p-3 text-xs"
            style={{ background: 'rgba(184,99,63,0.06)', border: '1px solid rgba(184,99,63,0.15)', color: '#8b5a3c' }}
          >
            ⚠ Locking is permanent. No edits after this action.
          </div>
          {error && <p className="text-sm" style={{ color: '#b8633f' }}>{error}</p>}
          {canLock && (
            <button
              onClick={handleLock}
              disabled={locking}
              className="w-full font-semibold py-2.5 px-4 rounded-xl text-sm transition-all disabled:opacity-50"
              style={{ background: '#b8633f', color: '#fff' }}
            >
              {locking ? 'Locking, approve in wallet…' : '🔒 Lock Source Data'}
            </button>
          )}
          {!isOwner && address && (
            <p className="text-xs" style={{ color: '#9b938a' }}>
              Only the initiative owner can lock source data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
