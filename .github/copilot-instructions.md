# AI Agent Instructions: Private Auction FHE

This is a **privacy-preserving sealed-bid auction system** using Fully Homomorphic Encryption (FHE) on Ethereum. Bids remain encrypted on-chain and are compared using homomorphic operations without decryption.

## Architecture Overview

**Three-layer system:**

1. **Smart Contracts** (`contracts/`) - Solidity with FHE operations using `@fhevm/solidity`
   - Core: `Auction.sol` - Single auction instance managing encrypted bids
   - Uses Zama's `FHE.sol` library for homomorphic comparisons
   - Deploys to Sepolia testnet

2. **Frontend** (`frontend/`) - React 18 + TypeScript + Vite
   - Client-side FHE encryption via `@fhevm/sdk` (mock in dev, real in prod)
   - Wagmi v2 for contract interaction + RainbowKit for wallet connection
   - React Router v7 for navigation

3. **Cross-Component Data Flow:**
   - User submits bid value → FHE encryption in browser → `submitBid(externalEuint64, proof)` → Contract stores encrypted
   - Contract closes auction → Homomorphic comparison finds max encrypted bid → Owner declares winner off-chain
   - Winner is publicly revealed; bids remain encrypted

## Critical Developer Workflows

### Contract Development
```bash
cd contracts

# Core commands
npm run compile      # Must run after any .sol changes; artifacts go to /artifacts
npm run test         # Hardhat tests using mocha-ethers; read test/Auction.test.ts for patterns
npm run deploy:sepolia  # Uses SEPOLIA_RPC_URL + SEPOLIA_PRIVATE_KEY from .env
npm run node         # Local testnet for debugging (chainId 1337)
```

**Key patterns in contracts:**
- All encrypted bids are `euint64` type from FHE.sol
- Use `FHE.fromExternal(externalEuint64, inputProof)` to convert client input → encrypted (see `Auction.sol` line 72)
- Homomorphic comparison: `FHE.gt(bid, currentHighest)` returns `ebool`, use `FHE.select()` to conditionally update
- No decryption possible on-chain; winner determined off-chain, then declared via `declareWinner()`

### Frontend Development
```bash
cd frontend

npm run dev        # Vite dev server on localhost:3000 with node polyfills
npm run build      # Production bundle with sourcemaps
npm run preview    # Test production build locally
```

**Key patterns in frontend:**
- FHE functions in `src/lib/fhe.ts`: `initializeFHE()` must be called before encrypting (currently mock)
- `encryptBid()` returns `{handle, proof, value}` → pass handle+proof to contract
- Wagmi hooks in `src/hooks/useAuction.ts`: read contract state with `useReadContract`, write with `useWriteContract`
- `AUCTION_CONTRACT_ADDRESS` in `src/config/contracts.ts` must match deployed contract

## Project-Specific Conventions

### FHE Types & Patterns
- **External type**: `externalEuint64` (client sends this)
- **Internal type**: `euint64` (contract uses after `FHE.fromExternal()`)
- **Proof**: ZKPoK (Zero-Knowledge Proof of Knowledge) - always required with encrypted input
- **Current state**: Mock FHE in dev (`fhe.ts` lines 40-62), real SDK `@fhevm/sdk ^0.7.0` for production

### Contract Interaction Pattern (via Wagmi)
```typescript
// Read encrypted state
const { data: bidderCount } = useReadContract({
  address: AUCTION_CONTRACT_ADDRESS,
  abi: AUCTION_ABI,
  functionName: 'getBidderCount',
});

// Write encrypted bid
const { writeContract } = useWriteContract();
writeContract({
  address: AUCTION_CONTRACT_ADDRESS,
  abi: AUCTION_ABI,
  functionName: 'submitBid',
  args: [encryptedHandle, proof], // externalEuint64, bytes
});
```

### Environment Variables
**Contracts (.env):**
- `SEPOLIA_RPC_URL` - Infura/Alchemy endpoint
- `SEPOLIA_PRIVATE_KEY` - Deployer wallet
- `ETHERSCAN_API_KEY` - Verification (optional)

**Frontend (.env):**
- `VITE_AUCTION_CONTRACT_ADDRESS` - Deployed auction address (0x...)
- `VITE_WALLET_CONNECT_PROJECT_ID` - From WalletConnect Cloud (for Wagmi)
- `VITE_SEPOLIA_RPC_URL` - For frontend RPC calls

### Design System (Zama Brand)
- Colors: `#00B8A3` (teal), `#111111` (dark), `#F2F2F2` (light)
- Components styled with TailwindCSS + Glassmorphism effects
- Animations via GSAP and framer-motion

## Integration Points & Dependencies

### External Dependencies
- **@fhevm/sdk** ^0.7.0 - Real FHE encryption (requires browser polyfills)
- **@fhevm/solidity** ^0.9.0 - FHE.sol library for contracts
- **wagmi** v2 + **viem** - Ethereum interaction
- **RainbowKit** ^2.2.9 - Wallet connection UI
- **ethers** v6 - Utilities + RPC
- **Hardhat** ^3.0 - Contract development

### Cross-Module Communication
1. **Contracts → Frontend ABI**: Extract from `/contracts/artifacts/contracts/Auction.sol/Auction.json` after compile
2. **Frontend → Contract**: Wagmi hooks call contract functions; listen for `BidSubmitted` + `AuctionClosed` events
3. **Secrets**: Never commit `.env` files; all private keys must be in environment

## Testing & Deployment Strategy

### Contract Testing
- Hardhat mocha tests in `test/Auction.test.ts`
- Patterns: Deploy, check ownership, test auction lifecycle (init → bid → close → winner)
- Use `ethers.provider.send("evm_increaseTime", [seconds])` to simulate time passage
- Mock FHE in tests (proof validation skipped on local node)

### Deployment Checklist
1. Compile: `npm run compile` → verify no errors
2. Test: `npm run test` → all tests pass
3. Deploy: `npm run deploy:sepolia` → get contract address
4. Update frontend: `VITE_AUCTION_CONTRACT_ADDRESS=0x...`
5. Extract ABI from artifacts → update `src/config/contracts.ts`
6. Frontend build: `npm run build` → test with `npm run preview`

## Known Limitations & Gotchas

1. **FHE Decryption**: Not possible on-chain; winner determination requires off-chain decryption
2. **Bid Privacy**: Bids are encrypted, but bidder addresses are visible (via events/state)
3. **Single Auction**: Current `Auction.sol` is a single instance; multiple auctions need `AuctionFactory.sol`
4. **Network**: Only Sepolia testnet; fhEVM not deployed on mainnet
5. **Mock FHE in Dev**: `fhe.ts` uses mock encryption; real SDK requires proper browser setup (WASM + polyfills)

## File Reference Guide

| File | Purpose |
|------|---------|
| `contracts/contracts/Auction.sol` | Core FHE auction logic; homomorphic bid comparison |
| `contracts/scripts/deploy.ts` | Deployment script; reads artifacts and deploys |
| `contracts/hardhat.config.ts` | Hardhat config; Sepolia RPC + accounts |
| `frontend/src/lib/fhe.ts` | Encryption utilities; client-side bid encryption |
| `frontend/src/hooks/useAuction.ts` | Wagmi hooks; contract read/write operations |
| `frontend/src/config/contracts.ts` | ABI + addresses; extracted from artifacts after compile |
| `frontend/vite.config.ts` | Vite config; node polyfills for FHE SDK |

## Quick Troubleshooting

- **Contract won't compile**: Check Solidity version (0.8.28) and FHE import paths
- **Deployment fails**: Verify SEPOLIA_RPC_URL + SEPOLIA_PRIVATE_KEY in .env
- **FHE initialization fails**: Ensure node polyfills in `vite.config.ts`
- **Wagmi hook returns undefined**: Contract address or ABI mismatch; verify `contracts.ts`
- **Encrypted bid rejected**: Proof validation failed; ensure `@fhevm/sdk` version matches contract FHE.sol

---

**Last Updated**: November 2025  
**Tech Stack**: Solidity 0.8.28 | React 18 + TypeScript | Wagmi v2 | Zama FHE SDK v0.7.0 | Hardhat v3.0
