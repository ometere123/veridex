'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatAddress } from '@/utils';

const GENLAYER_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '61999');

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Prevent hydration mismatch — wallet state is client-only
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Always render the "not connected" button on the server
  if (!mounted) {
    return (
      <button
        disabled
        className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg opacity-80"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)', color: '#fff' }}
      >
        Connect Wallet
      </button>
    );
  }

  const isWrongNetwork = isConnected && chainId !== GENLAYER_CHAIN_ID;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{
            background: isWrongNetwork ? 'rgba(251,191,36,0.08)' : 'rgba(230,190,247,0.07)',
            border: isWrongNetwork ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(230,190,247,0.16)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: isWrongNetwork ? '#fbbf24' : '#4ade80' }}
          />
          <span className="text-sm font-mono" style={{ color: isWrongNetwork ? '#fbbf24' : '#e6bef7' }}>
            {formatAddress(address)}
          </span>
          {isWrongNetwork && (
            <span className="text-[10px] font-medium" style={{ color: '#fbbf24' }}>
              Wrong network
            </span>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs px-2 py-1.5 rounded-lg transition-colors"
          style={{ color: '#6b5490' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e6bef7')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6b5490')}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
      className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)',
        color: '#fff',
        boxShadow: isPending ? 'none' : '0 0 16px rgba(168,85,247,0.35)',
      }}
    >
      {isPending ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Connecting…
        </>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}
