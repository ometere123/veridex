'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WalletConnectButton } from './WalletConnectButton';
import { NotificationsPanel } from './NotificationsPanel';
import { VeridexLogo } from './VeridexLogo';
import { cn } from '@/utils';

const NAV_LINKS = [
  { href: '/tiers',       label: 'Tiers' },
  { href: '/leaderboard', label: 'Index' },
  { href: '/register',    label: 'Register' },
  { href: '/compare',     label: 'Compare' },
  { href: '/analytics',   label: 'Analytics' },
  { href: '/hub',         label: 'Hub' },
];

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium tracking-widest uppercase transition-all duration-150',
            pathname === link.href
              ? 'text-[#6b8e7a] bg-[rgba(107,142,122,0.10)] border-l-2 border-[#6b8e7a]'
              : 'text-[#9b938a] border-l-2 border-transparent hover:text-[#6b8e7a] hover:bg-[rgba(107,142,122,0.06)]'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-52 z-50 shrink-0"
        style={{
          background: 'rgba(245,241,237,0.98)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(107,142,122,0.10)' }}>
          <Link href="/" className="flex items-center gap-2 group">
            <VeridexLogo withWordmark subtitle="On-chain verification" size={30} />
          </Link>
          <span
            className="mt-2 inline-block text-[9px] font-medium px-1.5 py-0.5 rounded font-mono"
            style={{
              color: '#6b8360',
              border: '1px solid rgba(107,142,122,0.12)',
              background: 'rgba(107,142,122,0.05)',
              letterSpacing: '0.06em',
            }}
          >
            GenLayer
          </span>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Suspense fallback={<div className="h-40" />}>
            <NavLinks />
          </Suspense>
        </div>

        {/* Bottom — notifications + wallet */}
        <div className="px-3 pb-5 space-y-2" style={{ borderTop: '1px solid rgba(107,142,122,0.10)' }}>
          <div className="pt-3 flex items-center gap-2">
            <Suspense fallback={null}>
              <NotificationsPanel />
            </Suspense>
          </div>
          <Suspense fallback={<div className="h-9 rounded animate-pulse" style={{ background: 'rgba(107,142,122,0.08)' }} />}>
            <WalletConnectButton />
          </Suspense>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14"
        style={{
          background: 'rgba(245,241,237,0.98)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link href="/">
          <VeridexLogo withWordmark size={28} />
        </Link>
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <NotificationsPanel />
          </Suspense>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded"
            style={{ border: '1px solid rgba(107,142,122,0.15)' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="block h-px w-4 rounded-full transition-all duration-200"
              style={{ background: '#6b8e7a', transform: mobileOpen ? 'translateY(4px) rotate(45deg)' : 'none' }} />
            <span className="block h-px w-4 rounded-full transition-all duration-200"
              style={{ background: '#6b8e7a', opacity: mobileOpen ? 0 : 1 }} />
            <span className="block h-px w-4 rounded-full transition-all duration-200"
              style={{ background: '#6b8e7a', transform: mobileOpen ? 'translateY(-4px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-14"
          style={{ background: 'rgba(245,241,237,0.98)' }}
        >
          <div className="px-4 py-4 space-y-4">
            <Suspense fallback={null}>
              <NavLinks onClose={() => setMobileOpen(false)} />
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
