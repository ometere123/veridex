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
        style={{ background: '#ffffff', border: '1px solid rgba(107,142,122,0.14)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto"
          style={{ background: 'rgba(107,142,122,0.08)', color: '#6b8e7a' }}
        >
          ◈
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#1a1612' }}>
            Wallet required
          </h2>
          <p className="text-sm" style={{ color: '#6b6360' }}>{message}</p>
        </div>
        <WalletConnectButton />
      </div>
    </div>
  );
}
