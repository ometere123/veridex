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
        style={{
          background: 'rgba(142,255,195,0.14)',
          border: '1px solid rgba(142,255,195,0.24)',
          color: '#8effc3',
        }}
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
            background: isWrongNetwork ? 'rgba(255,183,77,0.12)' : 'rgba(142,255,195,0.1)',
            border: isWrongNetwork ? '1px solid rgba(255,183,77,0.28)' : '1px solid rgba(142,255,195,0.24)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: isWrongNetwork ? '#ffb74d' : '#8effc3' }}
          />
          <span className="text-sm font-mono" style={{ color: isWrongNetwork ? '#ffb74d' : '#d7ffe8' }}>
            {formatAddress(address)}
          </span>
          {isWrongNetwork && (
            <span className="text-[10px] font-medium" style={{ color: '#ffb74d' }}>
              Wrong network
            </span>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs px-3 py-1 rounded-sm transition-colors text-left"
          style={{ color: '#7d9d8d' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#8effc3')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7d9d8d')}
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
        background: 'linear-gradient(135deg, #8effc3, #4ddf98)',
        color: '#04100b',
        border: '1px solid rgba(142,255,195,0.42)',
        boxShadow: isPending ? 'none' : '0 0 22px rgba(142, 255, 195, 0.26)',
      }}
    >
      {isPending ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect wallet'
      )}
    </button>
  );
}
