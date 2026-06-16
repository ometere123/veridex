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
    default: 'Veridex - On-Chain Crypto Intelligence',
    template: '%s - Veridex',
  },
  description:
    'On-chain crypto verification powered by GenLayer Intelligent Contracts. Submit evidence, lock it immutably, let AI evaluate, build a verifiable on-chain profile.',
  keywords: ['crypto', 'rankings', 'GenLayer', 'blockchain', 'AI', 'DeFi', 'evaluation', 'research'],
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
    title: 'Veridex - On-Chain Crypto Intelligence',
    description: 'On-chain crypto verification powered by GenLayer Intelligent Contracts.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Veridex - On-Chain Crypto Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veridex - On-Chain Crypto Intelligence',
    description: 'On-chain crypto verification powered by GenLayer Intelligent Contracts.',
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
          <a href="/tiers" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Tiers</a>
          <a href="/leaderboard" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Index</a>
          <a href="/register" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Register</a>
          <a href="/compare" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Compare</a>
          <a href="/analytics" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Analytics</a>
          <a href="/hub" className="hover:text-[#6b8e7a] transition-colors tracking-wide">Hub</a>
        </div>
      </div>
    </footer>
  );
}
