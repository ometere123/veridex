# AlphaRank

AI-powered crypto intelligence platform built on [GenLayer](https://genlayer.com). AlphaRank evaluates and ranks crypto projects using on-chain AI smart contracts, delivering objective, tamper-proof scores directly on the blockchain.

**Live App:** [alpharank-brown.vercel.app](https://alpharank-brown.vercel.app)

---

## Features

- On-chain AI evaluation of crypto projects via GenLayer smart contracts
- Real-time scoring with async polling for evaluation results
- Dashboard with project rankings and detailed analysis
- Wallet-connected submissions and score finalization

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Blockchain:** GenLayer (AI smart contracts)
- **Database:** Supabase
- **Deployment:** Vercel

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the required environment variables. See `DEPLOYMENT.md` for the full list.

## Deployment

The app is deployed on Vercel: [alpharank-brown.vercel.app](https://alpharank-brown.vercel.app)

For self-hosting instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Smart Contract

AlphaRank uses a GenLayer intelligent contract for on-chain AI evaluation. See [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md) for details on the contract architecture and ABI.

## Testing

See [TESTING.md](TESTING.md) for the testing guide.
