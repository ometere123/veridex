'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ProofEvent } from '@/types';

export default function ProofLedgerPage() {
  const [dossierId, setDossierId] = useState('');
  const [events, setEvents] = useState<ProofEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function loadLedger() {
    const id = dossierId.trim();
    if (!id) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/dossier/${id}`);
      const data = res.ok ? await res.json() : null;
      setEvents(data?.proof_ledger ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-3 text-[11px] uppercase tracking-[0.26em]" style={{ color: '#8a8178' }}>Proof Ledger</p>
        <h1 className="text-4xl font-semibold" style={{ color: '#1a1612' }}>Every major dossier action leaves a proof event.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: '#5f5a52' }}>
          Search a dossier ID to inspect evidence locks, verification submissions, fact-check completions, verification hashes, fee events, and archive events recorded by the contract.
        </p>
      </div>

      <div className="rounded-[32px] bg-white p-6" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={dossierId}
            onChange={(event) => setDossierId(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') void loadLedger(); }}
            placeholder="Enter dossier ID"
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-mono"
            style={{ background: 'rgba(107,142,122,0.06)', color: '#1a1612', outline: 'none' }}
          />
          <button onClick={() => void loadLedger()} className="rounded-full px-6 py-3 text-sm font-semibold" style={{ background: '#5f8d6b', color: '#fff' }}>
            Read Ledger
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[32px] bg-white p-6" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
        {loading ? (
          <p className="py-12 text-center text-sm" style={{ color: '#5f5a52' }}>Reading proof events...</p>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.event_id} className="rounded-3xl p-5" style={{ background: 'rgba(107,142,122,0.06)' }}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: '#4f8f68' }}>{event.event_type}</span>
                  <span className="font-mono text-[11px]" style={{ color: '#8a8178' }}>{event.timestamp}</span>
                </div>
                <p className="text-sm" style={{ color: '#1a1612' }}>{event.summary}</p>
                <p className="mt-2 break-all font-mono text-[11px]" style={{ color: '#8a8178' }}>{event.event_hash}</p>
              </div>
            ))}
            <Link href={`/dossier/${dossierId.trim()}`} className="inline-flex rounded-full px-5 py-3 text-sm font-semibold" style={{ background: '#5f8d6b', color: '#fff' }}>
              Open dossier
            </Link>
          </div>
        ) : searched ? (
          <p className="py-12 text-center text-sm" style={{ color: '#5f5a52' }}>No proof events were returned for that dossier ID.</p>
        ) : (
          <p className="py-12 text-center text-sm" style={{ color: '#5f5a52' }}>Enter a dossier ID to read its proof trail.</p>
        )}
      </div>
    </div>
  );
}
