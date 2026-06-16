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

  // Prevent hydration mismatch - wallet state is client-only
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Always render the "not connected" button on the server
  if (!mounted) {
    return (
      <button
        disabled
        className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm opacity-80"
        style={{ background: '#8b7355', color: '#fff' }}
      >
        Connect wallet
      </button>
    );
  }

  const isWrongNetwork = isConnected && chainId !== GENLAYER_CHAIN_ID;

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-1">
        <div
          className="flex items-center gap-2 rounded-sm px-3 py-1.5"
          style={{
            background: isWrongNetwork ? 'rgba(184,99,63,0.12)' : 'rgba(184,99,63,0.08)',
            border: isWrongNetwork ? '1px solid rgba(184,99,63,0.24)' : '1px solid rgba(184,99,63,0.18)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: isWrongNetwork ? '#f59e0b' : '#8b7355' }}
          />
          <span className="text-sm font-mono" style={{ color: isWrongNetwork ? '#f59e0b' : '#8b7355' }}>
            {formatAddress(address)}
          </span>
          {isWrongNetwork && (
            <span className="text-[10px] font-medium" style={{ color: '#f59e0b' }}>
              Wrong network
            </span>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs px-3 py-1 rounded-sm transition-colors text-left"
          style={{ color: '#8b7355' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#b8633f')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8b7355')}
        >
          Unlink
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
      className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm transition-all disabled:opacity-50"
      style={{
        background: '#b8633f',
        color: '#fff',
        boxShadow: isPending ? 'none' : '0 0 16px rgba(184, 99, 63, 0.32)',
      }}
    >
      {isPending ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Connecting…
        </>
      ) : (
        'Connect wallet'
      )}
    </button>
  );
}
