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
        className="max-w-sm w-full rounded-sm p-8 text-center space-y-5"
        style={{ background: '#110e09', border: '1px solid rgba(184, 99, 63, 0.18)' }}
      >
        <div
          className="w-14 h-14 rounded-sm flex items-center justify-center text-2xl mx-auto"
          style={{ background: 'rgba(184, 99, 63, 0.1)', color: '#b8633f' }}
        >
          ◈
        </div>
        <div>
          <h2 className="text-lg font-bold mb-1" style={{ color: '#f5ede3' }}>
            Wallet Required
          </h2>
          <p className="text-sm" style={{ color: '#b8a997' }}>{message}</p>
        </div>
        <WalletConnectButton />
      </div>
    </div>
  );
}
