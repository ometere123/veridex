'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { WalletGate } from '@/components/WalletGate';
import { getLocalProjectsByOwner, clearLocalProjects } from '@/lib/local-projects';

interface LocalDossier {
  project_id: string;
  name: string;
  category: string;
  status: string;
  created_at: string;
  owner: string;
}

export default function IssuerHubPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [dossiers, setDossiers] = useState<LocalDossier[]>([]);
  const [lookup, setLookup] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !address) return;
    setDossiers(getLocalProjectsByOwner(address));
  }, [address, mounted]);

  if (!mounted) return null;
  if (!isConnected) return <WalletGate message="Connect your issuer wallet to manage verification dossiers." />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.26em]" style={{ color: '#8a8178' }}>Issuer Hub</p>
          <h1 className="text-4xl font-semibold" style={{ color: '#1a1612' }}>Manage evidence dossiers.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: '#5f5a52' }}>
            Track locally submitted dossiers, open their public proof files, and start new evidence submissions. GenLayer remains the verification source of truth.
          </p>
        </div>
        <Link href="/submit" className="rounded-full px-5 py-3 text-sm font-semibold" style={{ background: '#5f8d6b', color: '#fff' }}>
          Submit Evidence
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Local dossiers" value={dossiers.length} />
        <Stat label="Issuer wallet" value={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '-'} />
        <Stat label="Source of truth" value="GenLayer" />
      </div>

      <div className="overflow-hidden rounded-[32px] bg-white" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
        <div className="flex items-center justify-between gap-4 px-6 py-4" style={{ borderBottom: '1px solid rgba(107,142,122,0.10)' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#1a1612' }}>Your dossier cache</h2>
          {dossiers.length > 0 ? (
            <button onClick={() => { clearLocalProjects(); setDossiers([]); }} className="rounded-full px-3 py-1 text-xs" style={{ border: '1px solid rgba(107,142,122,0.14)', color: '#8a8178' }}>
              Clear local cache
            </button>
          ) : null}
        </div>

        {dossiers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm" style={{ color: '#5f5a52' }}>No local dossier submissions yet.</p>
            <Link href="/submit" className="mt-4 inline-flex rounded-full px-5 py-3 text-sm font-semibold" style={{ background: '#5f8d6b', color: '#fff' }}>
              Create your first dossier
            </Link>
          </div>
        ) : (
          dossiers.map((dossier) => (
            <Link key={dossier.project_id} href={`/dossier/${dossier.project_id}`} className="block px-6 py-4 transition-colors hover:bg-[rgba(107,142,122,0.04)]" style={{ borderBottom: '1px solid rgba(107,142,122,0.08)' }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold" style={{ color: '#1a1612' }}>{dossier.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em]" style={{ color: '#8a8178' }}>{dossier.category} / {dossier.status}</p>
                </div>
                <span className="font-mono text-[11px]" style={{ color: '#8a8178' }}>{dossier.project_id}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-6 rounded-[28px] bg-white p-5" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#8a8178' }}>Open dossier by ID</h3>
        <div className="flex gap-2">
          <input
            value={lookup}
            onChange={(event) => setLookup(event.target.value)}
            placeholder="Enter dossier ID"
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-mono"
            style={{ background: 'rgba(107,142,122,0.06)', color: '#1a1612', outline: 'none' }}
          />
          <Link href={lookup.trim() ? `/dossier/${lookup.trim()}` : '#'} className="rounded-full px-5 py-3 text-sm font-semibold" style={{ background: lookup.trim() ? '#5f8d6b' : 'rgba(107,142,122,0.20)', color: '#fff', pointerEvents: lookup.trim() ? 'auto' : 'none' }}>
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[28px] bg-white p-5" style={{ border: '1px solid rgba(107,142,122,0.14)' }}>
      <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: '#8a8178' }}>{label}</div>
      <div className="mt-2 text-2xl font-semibold" style={{ color: '#4f8f68' }}>{value}</div>
    </div>
  );
}
