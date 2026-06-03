'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { truncateHash, formatDateTime } from '@/utils';
import { contractLockProject } from '@/lib/genlayer-write';
import { glReadContract } from '@/lib/genlayer';
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
      // ① Call GenLayer contract from browser (MetaMask signs)
      const txHash = await contractLockProject(address, project.project_id);

      // ② Read the evidence_hash from the contract after finalization
      let evidenceHash = '';
      try {
        const updated = await glReadContract('get_project', [project.project_id]);
        const parsed = JSON.parse(updated as string);
        evidenceHash = parsed.evidence_hash || '';
      } catch { /* non-fatal */ }

      // ③ Sync status to Supabase cache
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
      setError(e instanceof Error ? e.message : 'Failed to lock evidence');
    } finally {
      setLocking(false);
    }
  }

  return (
    <div
      className={className}
      style={{
        background: '#0e0a1a',
        border: isLocked
          ? '1px solid rgba(248,113,113,0.2)'
          : '1px solid rgba(74,222,128,0.15)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            background: isLocked ? '#f87171' : '#4ade80',
            boxShadow: isLocked
              ? '0 0 6px rgba(248,113,113,0.6)'
              : '0 0 6px rgba(74,222,128,0.6)',
          }}
        />
        <h3 className="font-semibold text-sm" style={{ color: '#f5eeff' }}>
          Evidence Status
        </h3>
      </div>

      {isLocked ? (
        <div className="space-y-3">
          <div
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg"
            style={{ background: 'rgba(248,113,113,0.06)', color: '#f87171' }}
          >
            🔒 Evidence Locked — Immutable
          </div>
          {project.locked_at && (
            <div className="text-xs" style={{ color: '#9b86b8' }}>
              <span style={{ color: '#6b5490' }}>Locked: </span>
              {formatDateTime(project.locked_at)}
            </div>
          )}
          {project.evidence_hash && (
            <div
              className="rounded-lg p-3"
              style={{ background: 'rgba(230,190,247,0.04)', border: '1px solid rgba(230,190,247,0.08)' }}
            >
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6b5490' }}>
                Evidence Hash
              </div>
              <code className="text-xs break-all block font-mono" style={{ color: '#4ade80' }}>
                {truncateHash(project.evidence_hash, 20)}
              </code>
            </div>
          )}
          <p className="text-xs" style={{ color: '#6b5490' }}>
            No modifications permitted after locking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#9b86b8' }}>
            Evidence is{' '}
            <span className="font-semibold" style={{ color: '#4ade80' }}>editable</span>.
            Lock it before submitting for evaluation.
          </p>
          <div
            className="rounded-lg p-3 text-xs"
            style={{
              background: 'rgba(251,191,36,0.05)',
              border: '1px solid rgba(251,191,36,0.15)',
              color: '#fbbf24',
            }}
          >
            ⚠ Locking is permanent. No edits after this action.
          </div>
          {error && (
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          )}
          {canLock && (
            <button
              onClick={handleLock}
              disabled={locking}
              className="w-full font-semibold py-2.5 px-4 rounded-lg text-sm transition-all disabled:opacity-50"
              style={{
                background: locking
                  ? 'rgba(248,113,113,0.3)'
                  : 'linear-gradient(135deg,#dc2626,#ef4444)',
                color: '#fff',
                boxShadow: locking ? 'none' : '0 0 14px rgba(239,68,68,0.3)',
              }}
            >
              {locking ? 'Locking — approve in wallet…' : '🔒 Lock Evidence'}
            </button>
          )}
          {!isOwner && address && (
            <p className="text-xs" style={{ color: '#6b5490' }}>
              Only the project owner can lock evidence.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
