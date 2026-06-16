import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/providers';
import { Navbar } from '@/components/Navbar';
import { NetworkChecker } from '@/components/NetworkChecker';
import { VeridexLogo } from '@/components/VeridexLogo';

export const viewport: Viewport = {
  themeColor: '#6b8e7a',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://veridex.app'),
  title: {
    default: 'Veridex - Evidence-First Verification Registry',
    template: '%s - Veridex',
  },
  description:
    'Evidence-first crypto project verification on GenLayer. Submit evidence, lock it, and receive verification dossiers, risk signals, and proof history.',
  keywords: ['crypto', 'verification', 'GenLayer', 'blockchain', 'evidence', 'dossier', 'risk signals', 'research'],
  authors: [{ name: 'Veridex' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://veridex.app',
    siteName: 'Veridex',
    title: 'Veridex - Evidence-First Verification Registry',
    description: 'Crypto project evidence, verification reports, risk signals, and proof history on GenLayer.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Veridex - Evidence-First Verification Registry',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veridex - Evidence-First Verification Registry',
    description: 'Crypto project evidence, verification reports, risk signals, and proof history on GenLayer.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col"
        style={{
          background: 'var(--background)',
          color: 'var(--foreground)',
          ['--font-space-grotesk' as string]: '"Segoe UI", "Trebuchet MS", sans-serif',
          ['--font-jetbrains-mono' as string]: '"Consolas", "Courier New", monospace',
        }}
      >
        <Providers>
          <Navbar />
          {/* md:ml-52 offsets content past the 208px sidebar on desktop */}
          <div className="flex flex-col min-h-screen md:ml-52">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <NetworkChecker />
        </Providers>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer
      className="mt-auto py-6 px-4"
      style={{ borderTop: '1px solid rgba(107,142,122,0.15)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <VeridexLogo withWordmark size={28} subtitle="Evidence-backed trust" />
          <span className="text-xs" style={{ color: 'var(--border-2)' }}>/ GenLayer</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs" style={{ color: 'var(--muted-2)' }}>
          <a href="/registry" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Registry</a>
          <a href="/submit" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Submit Evidence</a>
          <a href="/verification-levels" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Levels</a>
          <a href="/proof-ledger" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Proof Ledger</a>
          <a href="/compare" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Compare</a>
          <a href="/signals" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Signals</a>
          <a href="/issuer-hub" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Issuer Hub</a>
        </div>
      </div>
    </footer>
  );
}
