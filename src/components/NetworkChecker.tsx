'use client';

import { useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const GENLAYER_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '61999');
const RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';

export function NetworkChecker() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [adding, setAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isWrongNetwork = mounted && isConnected && chainId !== GENLAYER_CHAIN_ID;

  async function addAndSwitch() {
    setAdding(true);
    try {
      // Try wagmi switchChain first
      switchChain({ chainId: GENLAYER_CHAIN_ID });
    } catch {
      // Fallback: directly call wallet_addEthereumChain
      const win = window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } };
      if (win.ethereum) {
        try {
          await win.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${GENLAYER_CHAIN_ID.toString(16)}`,
              chainName: 'GenLayer Testnet',
              nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
              rpcUrls: [RPC],
              blockExplorerUrls: ['https://studio.genlayer.com'],
            }],
          });
        } catch (e) {
          console.error('Failed to add chain:', e);
        }
      }
    } finally {
      setAdding(false);
    }
  }

  if (!isWrongNetwork) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium"
      style={{
        background: '#160f29',
        border: '1px solid rgba(251,191,36,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.1)',
        maxWidth: '90vw',
      }}
    >
      <span style={{ color: '#fbbf24' }}>⚠</span>
      <span style={{ color: '#ddd0f0' }}>
        Wrong network - switch to{' '}
        <strong style={{ color: '#e6bef7' }}>GenLayer Testnet</strong>
      </span>
      <button
        onClick={addAndSwitch}
        disabled={isPending || adding}
        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
          color: '#fff',
          boxShadow: '0 0 10px rgba(168,85,247,0.4)',
        }}
      >
        {isPending || adding ? 'Switching…' : 'Switch Network'}
      </button>
    </div>
  );
}
