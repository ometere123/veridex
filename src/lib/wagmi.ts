import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

// studionet chain ID = 61999 (same as NEXT_PUBLIC_CHAIN_ID)
const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';

export const genLayerChain = {
  id: 61999,
  name: 'GenLayer Studionet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public:  { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'GenLayer Explorer', url: process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL || 'https://explorer-studio.genlayer.com' },
  },
} as const;

export const wagmiConfig = createConfig({
  chains: [genLayerChain],
  connectors: [injected()],
  transports: {
    [genLayerChain.id]: http(RPC_URL),
  },
});
