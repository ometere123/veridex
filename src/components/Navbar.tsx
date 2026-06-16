'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { WalletConnectButton } from './WalletConnectButton';
import { VeridexLogo } from './VeridexLogo';
import { getTreasuryState } from '@/lib/genlayer';
import { cn } from '@/utils';

const NAV_LINKS = [
  { href: '/registry',            label: 'Registry' },
  { href: '/submit',              label: 'Submit Evidence' },
  { href: '/dossiers',            label: 'Dossiers' },
  { href: '/proof-ledger',        label: 'Proof Ledger' },
  { href: '/signals',             label: 'Signals' },
  { href: '/verification-levels', label: 'Verification Levels' },
  { href: '/hub',                 label: 'Issuer Hub' },
  { href: '/treasury',            label: 'Treasury' },
  { href: '/admin',               label: 'Admin', ownerAware: true },
];

function NavLinks({ onClose, isOwner }: { onClose?: () => void; isOwner: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className={cn(
            'flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium tracking-widest uppercase transition-all duration-150',
            pathname === link.href
              ? 'text-[#dfffee] bg-[rgba(142,255,195,0.12)] border border-[rgba(142,255,195,0.28)]'
              : link.ownerAware && !isOwner
                ? 'text-[#4f665a] border border-transparent hover:text-[#8aa897] hover:bg-[rgba(142,255,195,0.04)]'
                : 'text-[#789685] border border-transparent hover:text-[#dfffee] hover:bg-[rgba(142,255,195,0.07)]'
          )}
        >
          <span>{link.label}</span>
          {link.ownerAware && isOwner ? (
            <span className="rounded-full bg-[#8effc3] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-[#07110d]">
              Owner
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { address } = useAccount();
  const [owner, setOwner] = useState('');

  useEffect(() => {
    let active = true;
    getTreasuryState()
      .then((state) => {
        if (active) setOwner(state?.owner ?? '');
      })
      .catch(() => {
        if (active) setOwner('');
      });
    return () => {
      active = false;
    };
  }, []);

  const isOwner = !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-52 z-50 shrink-0"
        style={{
          background: 'rgba(4, 12, 9, 0.92)',
          borderRight: '1px solid rgba(142,255,195,0.18)',
          boxShadow: '18px 0 70px rgba(0,0,0,0.22)',
          backdropFilter: 'blur(18px)',
        }}
      >
        {/* Logo */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(142,255,195,0.14)' }}>
          <Link href="/" className="flex items-center gap-2 group">
            <VeridexLogo withWordmark subtitle="On-chain verification" size={30} />
          </Link>
          <span
            className="mt-2 inline-block text-[9px] font-medium px-1.5 py-0.5 rounded font-mono"
            style={{
              color: '#8effc3',
              border: '1px solid rgba(142,255,195,0.20)',
              background: 'rgba(142,255,195,0.08)',
              letterSpacing: '0.06em',
            }}
          >
            GenLayer
          </span>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Suspense fallback={<div className="h-40" />}>
            <NavLinks isOwner={isOwner} />
          </Suspense>
        </div>

        {/* Bottom - wallet */}
        <div className="px-3 pt-3 pb-5" style={{ borderTop: '1px solid rgba(142,255,195,0.14)' }}>
          <Suspense fallback={<div className="h-9 rounded animate-pulse" style={{ background: 'rgba(142,255,195,0.08)' }} />}>
            <WalletConnectButton />
          </Suspense>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14"
        style={{
          background: 'rgba(4, 12, 9, 0.92)',
          borderBottom: '1px solid rgba(142,255,195,0.18)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <Link href="/">
          <VeridexLogo withWordmark size={28} />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded"
            style={{ border: '1px solid rgba(142,255,195,0.20)' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="block h-px w-4 rounded-full transition-all duration-200"
              style={{ background: '#8effc3', transform: mobileOpen ? 'translateY(4px) rotate(45deg)' : 'none' }} />
            <span className="block h-px w-4 rounded-full transition-all duration-200"
              style={{ background: '#8effc3', opacity: mobileOpen ? 0 : 1 }} />
            <span className="block h-px w-4 rounded-full transition-all duration-200"
              style={{ background: '#8effc3', transform: mobileOpen ? 'translateY(-4px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-14"
          style={{ background: 'rgba(4, 12, 9, 0.96)' }}
        >
          <div className="px-4 py-4 space-y-4">
            <Suspense fallback={null}>
              <NavLinks onClose={() => setMobileOpen(false)} isOwner={isOwner} />
            </Suspense>
            <Suspense fallback={null}>
              <WalletConnectButton />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
