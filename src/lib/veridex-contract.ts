const address = process.env.NEXT_PUBLIC_VERIDEX_CONTRACT_ADDRESS;

if (!address) {
  throw new Error('Missing NEXT_PUBLIC_VERIDEX_CONTRACT_ADDRESS');
}

export const VERIDEX_CONTRACT_ADDRESS = address as `0x${string}`;
