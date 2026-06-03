'use client';

import { useAccount } from 'wagmi';
import { WalletConnectButton } from './WalletConnectButton';

interface WalletGateProps {
  children?: React.ReactNode;
  message?: string;
}

export function WalletGate({ children, message = 'Connect your wallet to continue.' }: WalletGateProps) {
  const { isConnected } = useAccount();

  if (isConnected) return <>{children}</>;

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div
        className="max-w-sm w-full rounded-2xl p-8 text-center space-y-5"
        style={{ background: '#0e0a1a', border: '1px solid rgba(230,190,247,0.12)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto"
          style={{ background: 'rgba(230,190,247,0.08)', color: '#e6bef7' }}
        >
          ◈
        </div>
        <div>
          <h2 className="text-lg font-bold mb-1" style={{ color: '#f5eeff' }}>
            Wallet Required
          </h2>
          <p className="text-sm" style={{ color: '#9b86b8' }}>{message}</p>
        </div>
        <WalletConnectButton />
      </div>
    </div>
  );
}
