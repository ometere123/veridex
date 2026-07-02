'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const GENLAYER_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '61999');
const RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';

export function NetworkChecker() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [adding, setAdding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const autoTriggered = useRef(false);

  useEffect(() => setMounted(true), []);

  const isWrongNetwork = mounted && isConnected && chainId !== GENLAYER_CHAIN_ID;

  async function addAndSwitch() {
    if (adding || isPending) return;
    setAdding(true);
    const win = window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } };
    try {
      // First try to add the chain (no-op if it already exists), then switch
      if (win.ethereum) {
        await win.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${GENLAYER_CHAIN_ID.toString(16)}`,
            chainName: 'GenLayer Studionet',
            nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
            rpcUrls: [RPC],
            blockExplorerUrls: [process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL || 'https://explorer-studio.genlayer.com'],
          }],
        });
      } else {
        switchChain({ chainId: GENLAYER_CHAIN_ID });
      }
    } catch (e) {
      console.error('Failed to switch chain:', e);
    } finally {
      setAdding(false);
    }
  }

  // Auto-trigger as soon as wrong network is detected
  useEffect(() => {
    if (isWrongNetwork && !autoTriggered.current) {
      autoTriggered.current = true;
      addAndSwitch();
    }
    // Reset so it can trigger again if user switches away and back
    if (!isWrongNetwork) {
      autoTriggered.current = false;
    }
  }, [isWrongNetwork]); // eslint-disable-line

  if (!isWrongNetwork) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium"
      style={{
        background: '#111827',
        border: '1px solid rgba(251,191,36,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.1)',
        maxWidth: '90vw',
      }}
    >
      <span style={{ color: '#fbbf24' }}>⚠</span>
      <span style={{ color: '#cbd5e1' }}>
        Wrong network, switching to{' '}
        <strong style={{ color: '#6b8e7a' }}>GenLayer Studionet</strong>…
      </span>
      <button
        onClick={addAndSwitch}
        disabled={isPending || adding}
        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-60"
        style={{
          background: '#6b8e7a',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(107,142,122,0.30)',
        }}
      >
        {isPending || adding ? 'Switching…' : 'Retry'}
      </button>
    </div>
  );
}
