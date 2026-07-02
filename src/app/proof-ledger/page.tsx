'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDateTime } from '@/utils';
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
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-7 rounded-[40px] border border-[#8effc333] bg-[#0b1712cc] p-7 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[#8effc3]">Public audit terminal</p>
        <h1 className="mt-4 text-5xl font-semibold text-[#f5fff7]">Proof Ledger</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9bb4a6]">
          Search by dossier ID to inspect proof events, event hashes, related hashes, actors, timestamps, and event types recorded by the GenLayer contract.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={dossierId}
            onChange={(event) => setDossierId(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') void loadLedger(); }}
            placeholder="Enter dossier ID"
            className="flex-1 rounded-full border border-[#8effc326] bg-[#ffffff08] px-5 py-4 font-mono text-sm text-[#f5fff7] outline-none placeholder:text-[#6f8b7c]"
          />
          <button onClick={() => void loadLedger()} className="rounded-full bg-[#8effc3] px-7 py-4 text-sm font-semibold text-[#07110d]">
            Read Ledger
          </button>
        </div>
      </section>

      <section className="proof-terminal rounded-[40px] p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6fae8e]">Terminal rows</p>
          {dossierId.trim() ? (
            <Link href={`/dossier/${dossierId.trim()}`} className="rounded-full border border-[#8effc326] px-4 py-2 text-xs text-[#8effc3]">
              Open dossier
            </Link>
          ) : null}
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#9bb4a6]">Reading proof events...</p>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.event_id} className="rounded-3xl border border-[#8effc31f] bg-[#ffffff08] p-4 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#8effc314] px-3 py-1 text-[#8effc3]">{event.event_type}</span>
                  <span className="text-[#6fae8e]">{formatDateTime(event.timestamp)}</span>
                </div>
                <p className="mt-3 font-sans text-sm text-[#f5fff7]">{event.summary}</p>
                <TerminalLine label="event hash" value={event.event_hash} />
                <TerminalLine label="related hash" value={event.related_hash || 'none'} />
                <TerminalLine label="actor" value={event.actor} />
                <TerminalLine label="event id" value={event.event_id} />
              </div>
            ))}
          </div>
        ) : searched ? (
          <p className="py-12 text-center text-sm text-[#9bb4a6]">No proof events were returned for that dossier ID.</p>
        ) : (
          <p className="py-12 text-center text-sm text-[#9bb4a6]">Enter a dossier ID to read its proof trail.</p>
        )}
      </section>
    </main>
  );
}

function TerminalLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-2 break-all text-[#9bb4a6]">
      <span className="text-[#6fae8e]">{label}: </span>
      {value}
    </p>
  );
}
