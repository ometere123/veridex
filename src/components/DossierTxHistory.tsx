'use client';

import { useEffect, useState } from 'react';
import { getTxHistory, TX_OP_LABEL, type TxEntry } from '@/lib/tx-history';
import { TxLink } from './TxLink';

interface DossierTxHistoryProps {
  dossierId: string;
  /** bump this to force a re-read of localStorage after new transactions */
  refreshKey?: number;
  className?: string;
}

export function DossierTxHistory({ dossierId, refreshKey = 0, className }: DossierTxHistoryProps) {
  const [entries, setEntries] = useState<TxEntry[]>([]);

  useEffect(() => {
    setEntries(getTxHistory(dossierId));
  }, [dossierId, refreshKey]);

  if (!entries.length) return null;

  return (
    <section
      className={className}
      style={{ background: '#0b1712cc', border: '1px solid rgba(142,255,195,0.18)', borderRadius: '28px', padding: '22px', backdropFilter: 'blur(12px)' }}
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">On-chain audit trail</p>
      <h3 className="mt-2 font-semibold text-sm text-[#f5fff7]">Transaction History</h3>
      <div className="mt-4 space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.hash}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2 text-xs"
            style={{ background: 'rgba(142,255,195,0.05)', border: '1px solid rgba(142,255,195,0.10)' }}
          >
            <span className="font-medium text-[#dfffee]">{TX_OP_LABEL[entry.op] ?? entry.op}</span>
            <span className="text-[#6fae8e]">{new Date(entry.timestamp).toLocaleString()}</span>
            <TxLink hash={entry.hash} label="View" className="text-xs" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[#789685]">
        Transaction links are recorded in this browser when you sign them. All records remain permanently queryable on the GenLayer explorer.
      </p>
    </section>
  );
}
