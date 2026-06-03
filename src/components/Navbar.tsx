'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WalletConnectButton } from './WalletConnectButton';
import { NotificationsPanel } from './NotificationsPanel';
import { cn } from '@/utils';

const NAV_LINKS = [
  { href: '/rankings',    label: 'Rankings' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/submit',      label: 'Submit' },
  { href: '/compare',     label: 'Compare' },
  { href: '/analytics',   label: 'Analytics' },
  { href: '/dashboard',   label: 'Dashboard' },
];

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className={cn(
            'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 block md:inline-block',
            pathname === link.href
              ? 'text-[#e6bef7] bg-[#e6bef7]/10 shadow-[inset_0_0_0_1px_rgba(230,190,247,0.18)]'
              : 'text-[#9b86b8] hover:text-[#e6bef7] hover:bg-[#e6bef7]/6'
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(180deg, rgba(14,10,26,0.97) 0%, rgba(14,10,26,0.90) 100%)',
        borderBottom: '1px solid rgba(230,190,247,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ─────────────────────────────────────── */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm"
                style={{
                  background: 'linear-gradient(135deg,#a855f7,#e6bef7)',
                  boxShadow: '0 0 12px rgba(230,190,247,0.3)',
                  color: '#fff',
                }}
              >
                α
              </div>
              <span className="text-base font-bold tracking-tight text-white group-hover:text-[#e6bef7] transition-colors">
                Alpha<span style={{ color: '#e6bef7' }}>Rank</span>
              </span>
              <span
                className="hidden sm:block text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  color: '#9b86b8',
                  border: '1px solid rgba(230,190,247,0.12)',
                  background: 'rgba(230,190,247,0.04)',
                  letterSpacing: '0.05em',
                }}
              >
                GenLayer
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              <Suspense fallback={<div className="h-9 w-64" />}>
                <NavLinks />
              </Suspense>
            </div>
          </div>

          {/* ── Right side ───────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <Suspense fallback={null}>
              <NotificationsPanel />
            </Suspense>

            {/* Wallet button — desktop */}
            <div className="hidden sm:block">
              <Suspense fallback={<div className="w-32 h-9 rounded-lg bg-[#160f29] animate-pulse" />}>
                <WalletConnectButton />
              </Suspense>
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg transition-all"
              style={{
                background: mobileOpen ? 'rgba(230,190,247,0.12)' : 'transparent',
                border: '1px solid rgba(230,190,247,0.12)',
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className="block h-0.5 w-5 rounded-full transition-all duration-200"
                style={{
                  background: '#e6bef7',
                  transform: mobileOpen ? 'translateY(4px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-all duration-200"
                style={{
                  background: '#e6bef7',
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-all duration-200"
                style={{
                  background: '#e6bef7',
                  transform: mobileOpen ? 'translateY(-4px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-5 pt-2 space-y-1"
          style={{ borderTop: '1px solid rgba(230,190,247,0.06)' }}
        >
          <Suspense fallback={null}>
            <NavLinks onClose={() => setMobileOpen(false)} />
          </Suspense>
          <div className="pt-3">
            <Suspense fallback={null}>
              <WalletConnectButton />
            </Suspense>
          </div>
        </div>
      )}
    </nav>
  );
}
