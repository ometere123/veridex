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
  { href: '/index',       label: 'Index' },
  { href: '/register',    label: 'Register' },
  { href: '/compare',     label: 'Compare' },
  { href: '/analytics',   label: 'Analytics' },
  { href: '/hub',         label: 'Hub' },
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
            'px-3 py-1.5 text-xs font-medium tracking-widest uppercase transition-all duration-150 block md:inline-block border-b-2',
            pathname === link.href
              ? 'text-[#6b8e7a] border-[#6b8e7a]'
              : 'text-[#9b938a] border-transparent hover:text-[#6b8e7a] hover:border-[#6b8e7a]/40'
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
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: 'rgba(245, 241, 237, 0.98)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* ── Logo ──────────────────────────────────────── */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <VeridexLogo
                withWordmark
                subtitle="On-chain verification"
                className="group-hover:opacity-95 transition-opacity"
                size={34}
              />
              <span
                className="hidden sm:block text-[9px] font-medium px-1.5 py-0.5 rounded font-mono"
                style={{
                  color: '#6b8360',
                  border: '1px solid rgba(107, 142, 122, 0.12)',
                  background: 'rgba(107, 142, 122, 0.05)',
                  letterSpacing: '0.06em',
                }}
                >
                  GenLayer
                </span>
              </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0">
              <Suspense fallback={<div className="h-8 w-64" />}>
                <NavLinks />
              </Suspense>
            </div>
          </div>

          {/* ── Right side ───────────────────────────────── */}
          <div className="flex items-center gap-2">
            <Suspense fallback={null}>
              <NotificationsPanel />
            </Suspense>

            <div className="hidden sm:block">
              <Suspense fallback={<div className="w-32 h-8 rounded-sm bg-[#091628] animate-pulse" />}>
                <WalletConnectButton />
              </Suspense>
            </div>

            {/* Hamburger - mobile */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded transition-all"
              style={{
                background: mobileOpen ? 'rgba(107, 142, 122, 0.1)' : 'transparent',
                border: '1px solid rgba(107, 142, 122, 0.15)',
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className="block h-px w-4 rounded-full transition-all duration-200"
                style={{
                  background: '#6b8e7a',
                  transform: mobileOpen ? 'translateY(4px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block h-px w-4 rounded-full transition-all duration-200"
                style={{
                  background: '#6b8e7a',
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-px w-4 rounded-full transition-all duration-200"
                style={{
                  background: '#6b8e7a',
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
          className="md:hidden px-4 pb-5 pt-2 space-y-0"
          style={{ borderTop: '1px solid rgba(107, 142, 122, 0.12)' }}
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
